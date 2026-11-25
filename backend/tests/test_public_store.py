"""Tienda pública: precios, pedidos, auth y cabeceras. No toca Supabase."""
import os
import unittest
from unittest import mock

os.environ.setdefault("KOBBER_ENV", "production")
os.environ["KOBBER_DEV_FIXTURES"] = "0"

from fastapi.testclient import TestClient

from dev_fixtures import build_fixture_store
from main_public import app
from routes import auth, store
from store_pricing import iva_incluido, precio_venta


def _pedido(variant_id="var-aceite", cantidad=2, **extra):
    body = {
        "items": [{"variant_id": variant_id, "cantidad": cantidad, "precio": 1}],
        "metodo_pago": "contra_entrega",
        "cliente": {
            "nombre": "Ana Gómez",
            "email": "ana@example.com",
            "telefono": "3001234567",
        },
        "envio": {
            "direccion": "Cra 7 # 32-16",
            "ciudad": "Bogotá",
            "departamento": "Bogotá D.C.",
        },
        "acepta_terminos": True,
    }
    body.update(extra)
    return body


class PublicStoreTests(unittest.TestCase):
    def setUp(self):
        store.clear_store_cache()
        auth.reset_login_limits()
        self.memory = build_fixture_store()
        self._db = mock.patch.object(store, "_db", return_value=self.memory)
        self._db.start()
        self.client = TestClient(app)

    def tearDown(self):
        self._db.stop()
        store.clear_store_cache()
        auth.reset_login_limits()

    def test_docs_apagados_y_cabeceras(self):
        docs = self.client.get("/docs")
        self.assertEqual(docs.status_code, 404)
        self.assertEqual(self.client.get("/openapi.json").status_code, 404)
        health = self.client.get("/health")
        self.assertEqual(health.status_code, 200)
        self.assertEqual(health.headers["x-content-type-options"], "nosniff")
        self.assertEqual(health.headers["x-frame-options"], "DENY")
        self.assertIn("frame-ancestors", health.headers["content-security-policy"])

        evil = self.client.get("/health", headers={"Origin": "https://evil.example"})
        self.assertNotIn("access-control-allow-origin", evil.headers)
        ok = self.client.get("/health", headers={"Origin": "https://kobber-tienda.onrender.com"})
        self.assertEqual(ok.headers.get("access-control-allow-origin"), "https://kobber-tienda.onrender.com")

    def test_no_expone_costo_ni_margen_del_cliente(self):
        normal = self.client.get("/api/store/productos")
        self.assertEqual(normal.status_code, 200)
        manipulado = self.client.get("/api/store/productos?margen=-100")
        self.assertEqual(manipulado.status_code, 200)
        self.assertEqual(normal.json()["productos"], manipulado.json()["productos"])

        texto = normal.text
        self.assertNotIn("precio_distribuidor", texto)
        self.assertNotIn("precio_dist", texto)
        self.assertNotIn("9600", texto)
        self.assertNotIn('"nc"', texto)
        self.assertNotIn("stock_total", texto)
        self.assertNotIn("agotado", texto)
        self.assertNotIn("stock_full", texto)

        aceite = next(p for p in normal.json()["productos"] if p["id"] == "prod-aceite")
        self.assertEqual(aceite["precio"], 12480)
        self.assertIsNone(aceite["precio_anterior"])
        self.assertTrue(aceite["disponible"])
        self.assertIn("días hábiles", aceite["plazo_envio"])
        self.assertNotIn("stock", aceite["variantes"][0])
        self.assertTrue(aceite["imagen"].startswith("https://www.truper.com/"))
        # La lista no arrastra la descripción larga.
        self.assertNotIn("descripcion", aceite)

        sin_foto = next(p for p in normal.json()["productos"] if p["id"] == "prod-sinfoto")
        self.assertIsNone(sin_foto["imagen"])
        self.assertEqual(sin_foto["precio"], precio_venta(5000, None))
        self.assertTrue(sin_foto["disponible"])

    def test_oferta_solo_si_hay_precio_anterior(self):
        res = self.client.get("/api/store/productos", params={"en_oferta": "true", "page_size": 10})
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertEqual(body["total"], 1)
        oferta = body["productos"][0]
        self.assertEqual(oferta["id"], "prod-oferta")
        self.assertEqual(oferta["precio"], 13000)
        self.assertEqual(oferta["precio_anterior"], 20000)
        self.assertGreater(oferta["descuento"], 0)

        detalle = self.client.get("/api/store/productos/prod-aceite?margen=0")
        self.assertEqual(detalle.status_code, 200)
        self.assertEqual(detalle.json()["precio"], 12480)
        self.assertNotIn("precio_distribuidor", detalle.text)
        self.assertIn("descripcion", detalle.json())

    def test_paginacion(self):
        res = self.client.get("/api/store/productos", params={"page": 1, "page_size": 1, "orden": "nombre"})
        body = res.json()
        self.assertEqual(body["total"], 3)
        self.assertEqual(body["pages"], 3)
        self.assertEqual(len(body["productos"]), 1)
        self.assertIn("Aceiteras Manuales", body["categorias"])
        self.assertIn("public", res.headers["cache-control"])

    def test_pedido_recalcula_precio_y_no_suma_iva(self):
        res = self.client.post("/api/store/pedidos", json=_pedido())
        self.assertEqual(res.status_code, 200, res.text)
        data = res.json()
        subtotal = 12480 * 2
        self.assertEqual(data["totales"]["subtotal"], subtotal)
        self.assertEqual(data["totales"]["iva_incluido"], iva_incluido(subtotal))
        self.assertEqual(data["totales"]["envio"], 15000)
        self.assertEqual(data["totales"]["total"], subtotal + 15000)
        self.assertTrue(data["totales"]["iva_ya_incluido"])
        self.assertFalse(data["correo_enviado"])
        self.assertIsNone(data["pasarela"])
        self.assertEqual(data["pago_estado"], "pendiente")
        self.assertTrue(data["numero"].startswith("KOB-"))
        self.assertNotIn("correo", data["mensaje"].lower().split("no enviamos")[0])
        self.assertIn("No enviamos un correo", data["mensaje"])

        guardado = self.memory.tables["orders"]
        self.assertEqual(len(guardado), 1)
        self.assertEqual(guardado[0]["subtotal"], subtotal)
        self.assertEqual(len(self.memory.tables["order_items"]), 1)

        consulta = self.client.get(
            f"/api/store/pedidos/{data['numero']}",
            params={"email": "ana@example.com"},
        )
        self.assertEqual(consulta.status_code, 200)
        self.assertEqual(consulta.json()["numero"], data["numero"])
        ajeno = self.client.get(
            f"/api/store/pedidos/{data['numero']}",
            params={"email": "otro@example.com"},
        )
        self.assertEqual(ajeno.status_code, 404)

    def test_rechaza_tarjeta_y_vende_sin_inventar_stock(self):
        tarjeta = _pedido()
        tarjeta["tarjeta"] = {"numero": "4111111111111111", "cvv": "123"}
        res = self.client.post("/api/store/pedidos", json=tarjeta)
        self.assertEqual(res.status_code, 400)
        self.assertEqual(self.memory.tables["orders"], [])

        # stock 0 no bloquea: la tienda no publica inventario.
        sin_stock = self.client.post("/api/store/pedidos", json=_pedido("var-sinfoto", 1))
        self.assertEqual(sin_stock.status_code, 200, sin_stock.text)
        self.assertEqual(sin_stock.json()["totales"]["subtotal"], precio_venta(5000, None))

        otro = self.client.post("/api/store/pedidos", json=_pedido(metodo_pago="tarjeta"))
        self.assertEqual(otro.status_code, 400)

    def test_descontinuado_no_se_lista_ni_se_vende(self):
        for product in self.memory.tables["products"]:
            if product["id"] == "prod-sinfoto":
                product["vendible"] = False
        for row in self.memory.tables["product_variants"]:
            if row["id"] == "var-sinfoto":
                row["products"]["vendible"] = False
        store.clear_store_cache()
        listed = [p["id"] for p in self.client.get("/api/store/productos").json()["productos"]]
        self.assertNotIn("prod-sinfoto", listed)
        pedido = self.client.post("/api/store/pedidos", json=_pedido("var-sinfoto", 1))
        self.assertEqual(pedido.status_code, 400)

    def test_envio_gratis_sobre_el_umbral(self):
        # 20 unidades * 12480 = 249600, por encima de 200000.
        for row in self.memory.tables["product_variants"]:
            if row["id"] == "var-aceite":
                row["stock"] = 30
        res = self.client.post("/api/store/pedidos", json=_pedido(cantidad=20))
        self.assertEqual(res.status_code, 200, res.text)
        self.assertEqual(res.json()["totales"]["envio"], 0)
        self.assertEqual(res.json()["totales"]["total"], 12480 * 20)

    def test_imagen_solo_de_truper(self):
        bloqueada = self.client.get("/api/store/imagen", params={"src": "http://169.254.169.254/latest/meta-data", "w": 100})
        self.assertEqual(bloqueada.status_code, 400)
        otra = self.client.get("/api/store/imagen", params={"src": "https://example.com/media/a.jpg", "w": 480})
        self.assertEqual(otra.status_code, 400)

    def test_auth_exige_rol_admin_en_supabase(self):
        from admin_auth import AuthError

        def fake_sign_in(email, password):
            if email == "admin@example.com" and password == "correcta":
                return {"token": "token-admin", "email": email, "role": "admin"}
            if email == "persona@example.com":
                raise AuthError(403, "Esta cuenta no tiene acceso al panel.")
            raise AuthError(401, "Correo o contraseña incorrectos.")

        def fake_current(token):
            if token == "token-admin":
                return {"email": "admin@example.com", "sub": "user-1", "role": "admin"}
            raise AuthError(401, "Sesión no válida.")

        with mock.patch("routes.auth.sign_in", fake_sign_in), mock.patch("routes.auth.current_admin", fake_current):
            viejo = self.client.post("/api/auth/login", json={"email": "admin@kobber.com", "password": "1234"})
            self.assertEqual(viejo.status_code, 401)
            ajeno = self.client.post("/api/auth/login", json={"email": "persona@example.com", "password": "otra"})
            self.assertEqual(ajeno.status_code, 403)
            bien = self.client.post("/api/auth/login", json={"email": "admin@example.com", "password": "correcta"})
            self.assertEqual(bien.status_code, 200, bien.text)
            self.assertEqual(bien.json()["token"], "token-admin")
            me = self.client.get("/api/auth/me", headers={"Authorization": "Bearer token-admin"})
            self.assertEqual(me.status_code, 200)
            self.assertEqual(me.json()["email"], "admin@example.com")
            self.assertEqual(self.client.get("/api/auth/me").status_code, 401)

        with mock.patch("config.SUPABASE_URL", ""), mock.patch("config.SUPABASE_KEY", ""):
            cerrado = self.client.post("/api/auth/login", json={"email": "admin@example.com", "password": "correcta"})
            self.assertEqual(cerrado.status_code, 503)


    def test_catalogo_tolera_fila_rota_y_oculta_descontinuado(self):
        # Precio numérico como lo manda PostgREST (texto) y orden de foto mezclado.
        # Antes, orden int mezclado con str rompía sorted() y uvicorn respondía 500.
        bueno = {
            "id": "prod-numerico",
            "nombre": "Precio numérico",
            "marca": "Truper",
            "categoria": "Destornilladores",
            "categoria_ml": "Destornilladores",
            "estado": "publicado",
            "vendible": True,
            "plazo_envio": None,
            "caracteristicas": [],
            "product_attributes": [],
            "product_images": [
                {"url": "https://www.truper.com/media/a.jpg", "orden": 1},
                {"url": "https://www.truper.com/media/b.jpg", "orden": "2"},
            ],
            "product_variants": [
                {
                    "id": "var-numerico",
                    "clave": "DG-OK",
                    "descripcion": "1/8 x 4",
                    "precio_distribuidor": "4300.00",
                    "porcentaje_kobber": "30.00",
                    "precio_anterior": None,
                    "estado": "activo",
                },
                {
                    "id": "var-off",
                    "clave": "DG-OFF",
                    "descripcion": "no va",
                    "precio_distribuidor": 1000,
                    "porcentaje_kobber": 30,
                    "estado": "descontinuado",
                },
            ],
        }
        roto = {
            "id": "prod-roto",
            "nombre": "Fila inválida",
            "marca": "Truper",
            "categoria": "X",
            "categoria_ml": "X",
            "estado": "publicado",
            "vendible": True,
            "plazo_envio": None,
            "caracteristicas": [],
            "product_attributes": "no-es-lista",
            "product_images": [{"url": "https://www.truper.com/media/c.jpg", "orden": "no"}],
            "product_variants": [
                {
                    "id": "var-roto",
                    "clave": "ROTO",
                    "descripcion": "precio ilegible",
                    "precio_distribuidor": "12.345,00",
                    "porcentaje_kobber": None,
                    "estado": "activo",
                }
            ],
        }
        self.memory.tables["products"].extend([bueno, roto])
        self.memory.tables["product_variants"].append({
            "id": "var-off",
            "product_id": "prod-numerico",
            "clave": "DG-OFF",
            "precio_distribuidor": 1000,
            "porcentaje_kobber": 30,
            "estado": "descontinuado",
            "products": {"nombre": "Precio numérico", "marca": "Truper", "estado": "publicado", "vendible": True},
        })
        store.clear_store_cache()
        res = self.client.get("/api/store/productos?page=1&page_size=24")
        self.assertEqual(res.status_code, 200, res.text)
        body = res.json()
        ids = [p["id"] for p in body["productos"]]
        self.assertIn("prod-numerico", ids)
        self.assertNotIn("prod-roto", ids)
        publicado = next(p for p in body["productos"] if p["id"] == "prod-numerico")
        self.assertEqual([v["clave"] for v in publicado["variantes"]], ["DG-OK"])
        self.assertEqual(publicado["precio"], precio_venta("4300.00", "30.00"))
        pedido = self.client.post("/api/store/pedidos", json=_pedido("var-off", 1))
        self.assertEqual(pedido.status_code, 400)


if __name__ == "__main__":
    unittest.main()
