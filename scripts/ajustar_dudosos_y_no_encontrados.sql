-- Ajusta las variantes dudosas y despublica las que no están en el PDF.
-- Generado el 2026-11-25. NO es un cambio de esquema. NO se corrió en producción.
--
-- Corre DESPUÉS de supabase/migrations/20261125180000_vendible_plazo_stock_full.sql
-- (hace falta la columna products.vendible) y DESPUÉS de
-- scripts/corregir_claves_truper.sql, para que las claves que ese script
-- ya tomó no se dupliquen aquí.
--
-- Precio de distribuidor: siempre el del PDF impreso.
-- Medidas, capacidad, material y cantidad: la ficha del banco de contenido
-- digital de Truper (searchByWord por código numérico). Si la ficha y el
-- PDF discrepan, manda la ficha. Si una reconsulta en bloque respondió
-- HTTP 500, se usan las fichas ya traídas de ese mismo banco. Donde la
-- ficha no trae la medida, se completa con el PDF y el comentario lo dice.
--
-- vendible es del producto entero. Si la familia tiene variantes que siguen
-- a la venta, solo la variante mala pasa a estado = 'descontinuado' (la tienda
-- no la muestra ni deja pedirla). Para volver a publicarla:
--   update public.product_variants set estado = 'activo' where id = '...';
-- Si todo el producto se apaga, se usa vendible = false. Para volver:
--   update public.products set vendible = true where id = '...';
--
-- Idempotente: se puede correr dos veces. No toca order_items.

begin;

-- 1. Variantes cuya fila del PDF identifica el producto.
-- código 21854, pág. 140. ficha banco Truper (ALL-10P-P, PRETUL). Precio del PDF pág. 140 ($11,000).
update public.product_variants
set descripcion = '10 llaves hexagonales en pulgadas, organizador plástico, PRETUL.',
    precio_distribuidor = 11000
where id = '536e1d9f-e74d-461e-9b87-7d94031e4dbc';
update public.product_variants v
set clave = 'ALL-10P-P'
where v.id = '536e1d9f-e74d-461e-9b87-7d94031e4dbc'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-10P-P' and o.id <> v.id);

-- código 15539, pág. 140. ficha banco Truper (ALL-10P, std). Precio del PDF pág. 140.
update public.product_variants
set descripcion = '10 llaves hexagonales en pulgadas, con organizador.',
    precio_distribuidor = 15000
where id = 'a9f2478c-779f-4f5c-bd5c-26f77ef2cd14';
update public.product_variants v
set clave = 'ALL-10P'
where v.id = 'a9f2478c-779f-4f5c-bd5c-26f77ef2cd14'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-10P' and o.id <> v.id);

-- código 102316, pág. 29. ficha banco Truper (BASE-05B, 500 g de bolsillo). Precio del PDF pág. 29.
update public.product_variants
set descripcion = 'De bolsillo, 500 g.',
    precio_distribuidor = 39000
where id = '2ffed7e2-0c3f-4d09-a019-19dd664cf7d5';
update public.product_variants v
set clave = 'BASE-05B'
where v.id = '2ffed7e2-0c3f-4d09-a019-19dd664cf7d5'
  and not exists (select 1 from public.product_variants o where o.clave = 'BASE-05B' and o.id <> v.id);
update public.products
set nombre = 'Báscula electrónica de precisión, de bolsillo, 500 g'
where id = 'ba0f1e50-e88a-4a7d-b9f2-5e9ef961849d';
update public.product_attributes
set valor = '500 g'
where product_id = 'ba0f1e50-e88a-4a7d-b9f2-5e9ef961849d'
  and nombre = 'capacidad'
  and variant_id is null;

-- código 102317, pág. 29. ficha banco Truper (BASE-3, recargable, 3 kg). Precio del PDF pág. 29 ($66,000).
update public.product_variants
set descripcion = 'Recargable, 3 kg.',
    precio_distribuidor = 66000
where id = '0eb8b304-b83a-434f-9f53-4c97fc60e7d9';
update public.product_variants v
set clave = 'BASE-3'
where v.id = '0eb8b304-b83a-434f-9f53-4c97fc60e7d9'
  and not exists (select 1 from public.product_variants o where o.clave = 'BASE-3' and o.id <> v.id);

-- código 15160, pág. 29. ficha banco Truper (BASE-5EC, plato de vidrio, 5 kg). El PDF también la muestra así. Precio del PDF pág. 29.
update public.product_variants
set descripcion = 'Plato de vidrio, 5 kg.',
    precio_distribuidor = 30500
where id = 'f1fc6ff6-11b0-4e88-ac6c-20ab6a984e51';
update public.product_variants v
set clave = 'BASE-5EC'
where v.id = 'f1fc6ff6-11b0-4e88-ac6c-20ab6a984e51'
  and not exists (select 1 from public.product_variants o where o.clave = 'BASE-5EC' and o.id <> v.id);

-- código 12125, pág. 38. ficha banco Truper (BES-12, 12 escalones, 3/16 a 7/8 pulg). Precio del PDF pág. 38 ($51,000).
update public.product_variants
set descripcion = '12 escalones, rango 3/16 a 7/8 pulg, óxido negro.',
    precio_distribuidor = 51000
where id = '7e09e118-831f-4a30-8bb6-29699810078a';
update public.product_variants v
set clave = 'BES-12'
where v.id = '7e09e118-831f-4a30-8bb6-29699810078a'
  and not exists (select 1 from public.product_variants o where o.clave = 'BES-12' and o.id <> v.id);

-- código 12082, pág. 25. ficha banco Truper (FILP-ASPI-G1, bolsa para polvo, 5 y 6 gal). Precio del PDF pág. 25 ($40,000).
-- El nombre del producto no cambia: las otras variantes son aspiradoras. Si corregir_claves_truper.sql
-- ya dejó FILP-ASPI-G1 en la familia de filtros, esta variante conserva la clave ASP-06.
update public.product_variants
set descripcion = 'Bolsa para polvo para aspiradoras de 5 y 6 gal.',
    precio_distribuidor = 40000
where id = 'f1b8c914-caa7-453f-9f39-7b69ab150d41';
update public.product_variants v
set clave = 'FILP-ASPI-G1'
where v.id = 'f1b8c914-caa7-453f-9f39-7b69ab150d41'
  and not exists (select 1 from public.product_variants o where o.clave = 'FILP-ASPI-G1' and o.id <> v.id);

-- código 12085, pág. 25. ficha banco Truper (FILC-ASPI-G1). El PDF pág. 25 imprime FILC-AS-6X-G1 al mismo precio; las specs y la clave salen de la ficha. Precio del PDF ($56,000).
update public.product_variants
set descripcion = 'Filtro de cartucho para sólidos, aspiradoras de 5, 12 y 16 gal.',
    precio_distribuidor = 56000
where id = '60c6d902-22c1-4ac3-ad6c-f3c30d93c332';
update public.product_variants v
set clave = 'FILC-ASPI-G1'
where v.id = '60c6d902-22c1-4ac3-ad6c-f3c30d93c332'
  and not exists (select 1 from public.product_variants o where o.clave = 'FILC-ASPI-G1' and o.id <> v.id);

-- código 22409, pág. 31. ficha banco Truper (EXA-13P, 13 cuchillas). El PDF pág. 31 imprime EXA-3P; el título de esa página y la ficha dicen 13 cuchillas. Precio del PDF ($15,000).
update public.product_variants
set descripcion = 'Juego de 13 cuchillas en estuche.',
    precio_distribuidor = 15000
where id = 'bb1cd7a2-55a8-4b2f-b372-55ca7ac312a6';
update public.product_variants v
set clave = 'EXA-13P'
where v.id = 'bb1cd7a2-55a8-4b2f-b372-55ca7ac312a6'
  and not exists (select 1 from public.product_variants o where o.clave = 'EXA-13P' and o.id <> v.id);

-- código 13643, pág. 140. ficha banco Truper (ALLX-10P, juego std en pulgadas). Precio del PDF pág. 140.
update public.product_variants
set descripcion = '10 llaves hexagonales largas en pulgadas, punta de bola.',
    precio_distribuidor = 24000
where id = '24f15610-7a1f-4f85-9bc1-fa9552ceb6e8';
update public.product_variants v
set clave = 'ALLX-10P'
where v.id = '24f15610-7a1f-4f85-9bc1-fa9552ceb6e8'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALLX-10P' and o.id <> v.id);

-- código 15556, pág. 140. ficha banco Truper (ALL-8P, 8 llaves std). Precio del PDF pág. 140.
update public.product_variants
set descripcion = '8 llaves hexagonales en pulgadas, tipo navaja.',
    precio_distribuidor = 15000
where id = 'd56fcbfe-54d0-4080-83d9-76fc1f621b4b';
update public.product_variants v
set clave = 'ALL-8P'
where v.id = 'd56fcbfe-54d0-4080-83d9-76fc1f621b4b'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-8P' and o.id <> v.id);

-- código 43797, pág. 52. ficha banco Truper (CH-25L, 25 mm, gancho largo). Precio del PDF pág. 52.
update public.product_variants
set descripcion = '25 mm, gancho largo, caja con 1 pieza.',
    precio_distribuidor = 4500
where id = 'c6932645-6f07-4586-aa42-3194b4802db3';
update public.product_variants v
set clave = 'CH-25L'
where v.id = 'c6932645-6f07-4586-aa42-3194b4802db3'
  and not exists (select 1 from public.product_variants o where o.clave = 'CH-25L' and o.id <> v.id);

-- código 43315, pág. 52. ficha banco Truper (CH-38, 38 mm, gancho corto). Precio del PDF pág. 52 ($7,600).
update public.product_variants
set descripcion = '38 mm, gancho corto, caja con 1 pieza.',
    precio_distribuidor = 7600
where id = '680d8cf1-2ea7-4848-a7c6-40c85a521ed5';

-- código 103955, pág. 26. ficha banco Truper (ASPI-20A, 20 V, 1 batería 2 Ah). La capacidad 7.5 L sale del PDF pág. 26. El PDF imprime la clave ASP-20A; la ficha del código es ASPI-20A. Precio del PDF ($465,000).
update public.product_variants
set descripcion = '20 V, 1 batería de 2 Ah y cargador. Depósito 7.5 L (2 gal).',
    precio_distribuidor = 465000
where id = 'e2ea0720-2316-41f2-b086-cf0e9a7f4937';

-- código 100832, pág. 85. ficha banco Truper (DR-3/16X6B). Precio del PDF pág. 85 ($6,500).
update public.product_variants
set descripcion = 'Punta plana 3/16 x 6 pulg, mango Comfort Grip.',
    precio_distribuidor = 6500
where id = '00566cef-82cc-4263-82d7-4168b04a4426';
update public.product_variants v
set clave = 'DR-3/16X6B'
where v.id = '00566cef-82cc-4263-82d7-4168b04a4426'
  and not exists (select 1 from public.product_variants o where o.clave = 'DR-3/16X6B' and o.id <> v.id);

-- código 13998, pág. 85. ficha banco Truper (DR-1/4X4B). Precio del PDF pág. 85 ($7,200).
update public.product_variants
set descripcion = 'Punta plana 1/4 x 4 pulg, mango Comfort Grip.',
    precio_distribuidor = 7200
where id = '97eca79b-62d4-4027-85d3-0c272d991121';
update public.product_variants v
set clave = 'DR-1/4X4B'
where v.id = '97eca79b-62d4-4027-85d3-0c272d991121'
  and not exists (select 1 from public.product_variants o where o.clave = 'DR-1/4X4B' and o.id <> v.id);

-- código 14006, pág. 85. ficha banco Truper (DR-5/16X6B). Precio del PDF pág. 85 ($9,600).
update public.product_variants
set descripcion = 'Punta plana 5/16 x 6 pulg, mango Comfort Grip.',
    precio_distribuidor = 9600
where id = 'aa082c7f-dc47-4ee4-adc8-6eaef2b14cc7';
update public.product_variants v
set clave = 'DR-5/16X6B'
where v.id = 'aa082c7f-dc47-4ee4-adc8-6eaef2b14cc7'
  and not exists (select 1 from public.product_variants o where o.clave = 'DR-5/16X6B' and o.id <> v.id);

-- código 18546, pág. 85. ficha banco Truper (DR-5/16X10B). Precio del PDF pág. 85 ($11,000).
update public.product_variants
set descripcion = 'Punta plana 5/16 x 10 pulg, mango Comfort Grip.',
    precio_distribuidor = 11000
where id = 'cf7be335-f486-42ee-8dc1-2dea084dbfe6';
update public.product_variants v
set clave = 'DR-5/16X10B'
where v.id = 'cf7be335-f486-42ee-8dc1-2dea084dbfe6'
  and not exists (select 1 from public.product_variants o where o.clave = 'DR-5/16X10B' and o.id <> v.id);

-- código 100834, pág. 85. ficha banco Truper (DR-3/8X8B). Precio del PDF pág. 85 ($12,000).
update public.product_variants
set descripcion = 'Punta plana 3/8 x 8 pulg, mango Comfort Grip.',
    precio_distribuidor = 12000
where id = '77470814-0974-4622-b4ef-facb7ef5eee8';
update public.product_variants v
set clave = 'DR-3/8X8B'
where v.id = '77470814-0974-4622-b4ef-facb7ef5eee8'
  and not exists (select 1 from public.product_variants o where o.clave = 'DR-3/8X8B' and o.id <> v.id);

-- código 14067, pág. 85. ficha banco Truper (DP-3/16X6B). Precio del PDF pág. 85 ($6,500).
update public.product_variants
set descripcion = 'Punta de cruz 3/16 x 6 pulg, mango Comfort Grip.',
    precio_distribuidor = 6500
where id = 'dc1412fb-ac32-4a1c-b86c-d998d38cd29a';
update public.product_variants v
set clave = 'DP-3/16X6B'
where v.id = 'dc1412fb-ac32-4a1c-b86c-d998d38cd29a'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-3/16X6B' and o.id <> v.id);

-- código 100837, pág. 85. ficha banco Truper (DP-3/16X10B, 3/16 x 10 pulg). El precio impreso de la pág. 85 se leyó $7,200 y $7,500; no se cambia.
update public.product_variants
set descripcion = 'Punta de cruz 3/16 x 10 pulg, mango Comfort Grip.'
where id = '6ab11249-b540-45b1-a1af-93e049251419';
update public.product_variants v
set clave = 'DP-3/16X10B'
where v.id = '6ab11249-b540-45b1-a1af-93e049251419'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-3/16X10B' and o.id <> v.id);

-- código 14073, pág. 85. ficha banco Truper (DP-1/4X1-1/2B). Precio del PDF pág. 85 ($5,200).
update public.product_variants
set descripcion = 'Punta de cruz 1/4 x 1-1/2 pulg, mango Comfort Grip.',
    precio_distribuidor = 5200
where id = 'adff7ad2-3ada-4f41-89dc-74e9a8c9824a';
update public.product_variants v
set clave = 'DP-1/4X1-1/2B'
where v.id = 'adff7ad2-3ada-4f41-89dc-74e9a8c9824a'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-1/4X1-1/2B' and o.id <> v.id);

-- código 14082, pág. 85. ficha banco Truper (DP-1/4X8B). Precio del PDF pág. 85 ($7,900).
update public.product_variants
set descripcion = 'Punta de cruz 1/4 x 8 pulg, mango Comfort Grip.',
    precio_distribuidor = 7900
where id = '19c5772f-4e86-4813-a948-77e5f2f6389a';
update public.product_variants v
set clave = 'DP-1/4X8B'
where v.id = '19c5772f-4e86-4813-a948-77e5f2f6389a'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-1/4X8B' and o.id <> v.id);

-- código 100838, pág. 85. ficha banco Truper (DP-1/4X12B). Precio del PDF pág. 85 ($9,500).
update public.product_variants
set descripcion = 'Punta de cruz 1/4 x 12 pulg, mango Comfort Grip.',
    precio_distribuidor = 9500
where id = '42eedda3-2e9f-4413-b898-edd8a492bbab';
update public.product_variants v
set clave = 'DP-1/4X12B'
where v.id = '42eedda3-2e9f-4413-b898-edd8a492bbab'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-1/4X12B' and o.id <> v.id);

-- código 18548, pág. 85. ficha banco Truper (DP-5/16X6B). Precio del PDF pág. 85 ($9,900).
update public.product_variants
set descripcion = 'Punta de cruz 5/16 x 6 pulg, mango Comfort Grip.',
    precio_distribuidor = 9900
where id = '66af5a23-7451-4ba9-b803-86a9e57355f9';
update public.product_variants v
set clave = 'DP-5/16X6B'
where v.id = '66af5a23-7451-4ba9-b803-86a9e57355f9'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-5/16X6B' and o.id <> v.id);

-- código 18549, pág. 85. ficha banco Truper (DG-1/8X4-1/2B). Precio del PDF pág. 85 ($4,500).
update public.product_variants
set descripcion = 'Punta gabinete 1/8 x 4-1/2 pulg, mango Comfort Grip.',
    precio_distribuidor = 4500
where id = '5cfa58ad-65f7-4255-8649-61ae02a6022c';
update public.product_variants v
set clave = 'DG-1/8X4-1/2B'
where v.id = '5cfa58ad-65f7-4255-8649-61ae02a6022c'
  and not exists (select 1 from public.product_variants o where o.clave = 'DG-1/8X4-1/2B' and o.id <> v.id);

-- código 14025, pág. 85. ficha banco Truper (DG-1/8X6B). Precio del PDF pág. 85 ($4,500).
update public.product_variants
set descripcion = 'Punta gabinete 1/8 x 6 pulg, mango Comfort Grip.',
    precio_distribuidor = 4500
where id = '031b2293-20b6-43c6-908c-68a8e371fbb7';
update public.product_variants v
set clave = 'DG-1/8X6B'
where v.id = '031b2293-20b6-43c6-908c-68a8e371fbb7'
  and not exists (select 1 from public.product_variants o where o.clave = 'DG-1/8X6B' and o.id <> v.id);

-- código 14027, pág. 85. ficha banco Truper (DG-1/8X8B). Precio del PDF pág. 85 ($4,700).
update public.product_variants
set descripcion = 'Punta gabinete 1/8 x 8 pulg, mango Comfort Grip.',
    precio_distribuidor = 4700
where id = 'bc20798f-b4b0-47c7-a67d-6f49bd0c6280';
update public.product_variants v
set clave = 'DG-1/8X8B'
where v.id = 'bc20798f-b4b0-47c7-a67d-6f49bd0c6280'
  and not exists (select 1 from public.product_variants o where o.clave = 'DG-1/8X8B' and o.id <> v.id);

-- código 14040, pág. 85. ficha banco Truper (DG-3/16X6B). Precio del PDF pág. 85 ($6,500).
update public.product_variants
set descripcion = 'Punta gabinete 3/16 x 6 pulg, mango Comfort Grip.',
    precio_distribuidor = 6500
where id = 'b3fafaf4-1509-4434-9997-bddd3b50a594';
update public.product_variants v
set clave = 'DG-3/16X6B'
where v.id = 'b3fafaf4-1509-4434-9997-bddd3b50a594'
  and not exists (select 1 from public.product_variants o where o.clave = 'DG-3/16X6B' and o.id <> v.id);

-- código 14043, pág. 85. ficha banco Truper (DG-3/16X8B). Precio del PDF pág. 85 ($7,200).
update public.product_variants
set descripcion = 'Punta gabinete 3/16 x 8 pulg, mango Comfort Grip.',
    precio_distribuidor = 7200
where id = 'c8eac656-d682-4c40-aece-11fe7920c52a';
update public.product_variants v
set clave = 'DG-3/16X8B'
where v.id = 'c8eac656-d682-4c40-aece-11fe7920c52a'
  and not exists (select 1 from public.product_variants o where o.clave = 'DG-3/16X8B' and o.id <> v.id);

-- código 14138, pág. 85. ficha banco Truper (DTJ-5B). La clave impresa en la pág. 85 no se lee; el precio $31,000 sí. Specs de la ficha.
update public.product_variants
set descripcion = 'Juego de 5 desarmadores, mango Comfort Grip.',
    precio_distribuidor = 31000
where id = 'f2d02742-57bf-4acd-938e-611050fb9051';
update public.product_variants v
set clave = 'DTJ-5B'
where v.id = 'f2d02742-57bf-4acd-938e-611050fb9051'
  and not exists (select 1 from public.product_variants o where o.clave = 'DTJ-5B' and o.id <> v.id);

-- código 19621, pág. 85. ficha banco Truper (DTJ-6B). Precio del PDF pág. 85 ($38,500).
update public.product_variants
set descripcion = 'Juego de 6 desarmadores, mango Comfort Grip.',
    precio_distribuidor = 38500
where id = 'a0a6c948-e007-4c8d-b3ba-f8771a0bf26a';
update public.product_variants v
set clave = 'DTJ-6B'
where v.id = 'a0a6c948-e007-4c8d-b3ba-f8771a0bf26a'
  and not exists (select 1 from public.product_variants o where o.clave = 'DTJ-6B' and o.id <> v.id);

-- código 21378, pág. 85. ficha banco Truper (J-DIMP-7). Precio del PDF pág. 85 ($30,000).
update public.product_variants
set descripcion = 'Juego de 7 desarmadores de impacto.',
    precio_distribuidor = 30000
where id = 'a9d6732f-d8f2-4772-b979-2a59ae39fd81';
update public.product_variants v
set clave = 'J-DIMP-7'
where v.id = 'a9d6732f-d8f2-4772-b979-2a59ae39fd81'
  and not exists (select 1 from public.product_variants o where o.clave = 'J-DIMP-7' and o.id <> v.id);

-- 2. Variantes ambiguas o con el código repetido. La familia sigue publicada.
-- código 17357, pág. no hallada. Alicates multiusos para electricista. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = '74e7edb8-738a-41b8-adf3-32ae46008800'
  and estado is distinct from 'descontinuado';

-- código 101500, pág. no hallada. Aspiradoras plásticas. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = '880463f7-a02e-4f45-8d25-6a4dab12802e'
  and estado is distinct from 'descontinuado';

-- código 103106, pág. no hallada. Básculas electrónicas grameras, 5 kg. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = '0cad2fc4-5b33-4ed4-80d8-bb1a96a1206d'
  and estado is distinct from 'descontinuado';

-- código 27119, pág. no hallada. Básculas electrónicas multifunciones (PRETUL). El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = '749a917a-7d02-45df-a908-6b0d6b256903'
  and estado is distinct from 'descontinuado';

-- código 9576, pág. no hallada. Berbiquí profesional 12". El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'b003fa91-c365-4eef-9ad2-84fe8e8571d8'
  and estado is distinct from 'descontinuado';

-- código 12111, pág. no hallada. Bombas periféricas 1/2 HP. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'ad534aea-d4dc-48ee-b8bb-0c801ca318d3'
  and estado is distinct from 'descontinuado';

-- código 12113, pág. no hallada. Bombas periféricas 3/4 HP. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = '2097d545-77e6-4bbb-81c2-f87999131182'
  and estado is distinct from 'descontinuado';

-- código 16934, pág. no hallada. Bombas sumergibles para agua limpia, tipo bala 127 V. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'a024bf85-3b6e-4abc-a13a-14905969c8bc'
  and estado is distinct from 'descontinuado';

-- código 88, pág. no hallada. Brocas escalonadas. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'a990c4c9-44f9-47c4-a104-f3363fdcd271'
  and estado is distinct from 'descontinuado';

-- código 23532, pág. no hallada. Candados de hierro color latón, gancho corto. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = '4011f0ca-b6a7-42c7-b01c-d085fb03ed4f'
  and estado is distinct from 'descontinuado';

-- código 43315, pág. 52. Candados de hierro con coraza. Página 52 imprime CH-38 a $7,600 y lo publicado es CHR-404 a $21,000. candado de hierro, gancho corto, medidas 38 mm.
update public.product_variants
set estado = 'descontinuado'
where id = '9e796566-6b6f-4538-b045-6945e53b81b4'
  and estado is distinct from 'descontinuado';

-- código 43315, pág. 52. Candados de hierro, gancho corto. Página 52 imprime CH-38 a $7,600 y lo publicado es CH-32 a $5,700. candado de hierro, gancho corto, medidas 38 mm.
update public.product_variants
set estado = 'descontinuado'
where id = '28c19fec-8ce2-47f0-be97-9d686b1e5cc5'
  and estado is distinct from 'descontinuado';

-- código 43337, pág. 52. Candados de hierro, gancho corto. Página 52 imprime CA-65LQ a $40,000 y lo publicado es CH-50 a $12,000. candado redondo 65 mm, gancho largo; 54 mm es la medida A del gancho.
update public.product_variants
set estado = 'descontinuado'
where id = 'a684045b-b8f8-430a-9b8f-febba8f37be5'
  and estado is distinct from 'descontinuado';

-- código 43323, pág. 52. Candados de hierro, gancho largo. El código está en página 52 del PDF, pero la fila no se leyó. Publicado CH-3XL; banco CH-38L.
update public.product_variants
set estado = 'descontinuado'
where id = 'f9d7956e-9e1f-40aa-a92a-9a4080053cc5'
  and estado is distinct from 'descontinuado';

-- código 43324, pág. 52. Candados de hierro, gancho largo. El código está en página 52 del PDF, pero la fila no se leyó. Publicado CH-4XL; banco CH-45L.
update public.product_variants
set estado = 'descontinuado'
where id = 'e144336d-ed63-49e1-84bc-d1525203da18'
  and estado is distinct from 'descontinuado';

-- código 43325, pág. 52. Candados de hierro, gancho largo. El código está en página 52 del PDF, pero la fila no se leyó. Publicado CH-4XL; banco CH-50L.
update public.product_variants
set estado = 'descontinuado'
where id = 'b2884bc5-a904-4132-9b9e-eb6a65e507b2'
  and estado is distinct from 'descontinuado';

-- código 43002, pág. 52. Candados de hierro, gancho largo. El código está en página 52 del PDF, pero la fila no se leyó. Publicado CH-5XL; banco sin ficha.
update public.product_variants
set estado = 'descontinuado'
where id = 'ba0c49ca-6418-4d8a-a644-681d51f902e5'
  and estado is distinct from 'descontinuado';

-- código 43002, pág. 52. Candados de hierro, gancho largo. El código está en página 52 del PDF, pero la fila no se leyó. Publicado CH-6XL; banco sin ficha.
update public.product_variants
set estado = 'descontinuado'
where id = '3b8d6fba-f2c4-4997-b431-370e75df34e1'
  and estado is distinct from 'descontinuado';

-- código 23610, pág. 53. Cerrojos llave-llave, llave tradicional. El código está en página 53 del PDF, pero la fila no se leyó. Publicado CERO-42P; banco CERO-12P.
update public.product_variants
set estado = 'descontinuado'
where id = '0ce259a9-b321-49f0-b9be-2eea194cd070'
  and estado is distinct from 'descontinuado';

-- código 23611, pág. 53. Cerrojos llave-llave, llave tradicional. El código está en página 53 del PDF, pero la fila no se leyó. Publicado CERO-02P; banco CERO-32P.
update public.product_variants
set estado = 'descontinuado'
where id = '0685207a-9a69-4e6e-98b1-55ccaf44f67f'
  and estado is distinct from 'descontinuado';

-- código 23612, pág. 53. Cerrojos llave-mariposa, llave tradicional. El código está en página 53 del PDF, pero la fila no se leyó. Publicado CERO-21P; banco CERO-22P.
update public.product_variants
set estado = 'descontinuado'
where id = '38395433-f3dc-4ca5-81fe-dfc046e2e080'
  and estado is distinct from 'descontinuado';

-- código 26067, pág. 53. Cerrojos llave-mariposa, llave tradicional. El código está en página 53 del PDF, pero la fila no se leyó. Publicado CERO-6P; banco CERO-61P.
update public.product_variants
set estado = 'descontinuado'
where id = '34d16946-56a5-44f3-9b06-db8d4b7df141'
  and estado is distinct from 'descontinuado';

-- código 16963, pág. no hallada. Cuchillas de repuesto para bisturí, acero SK4. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'b098b227-8f66-4831-aa67-7aa43f60ffd9'
  and estado is distinct from 'descontinuado';

-- código 100836, pág. 85. Destornilladores punta gabinete, empuñadura Comfort Grip. Página 85: el renglón de este código no quedó con clave y precio unívocos. El código está en página 85 del PDF, pero la fila no se leyó. Publicado DG-3/16I33B; 
update public.product_variants
set estado = 'descontinuado'
where id = 'a25ed90b-7be1-452a-9044-5361325ba907'
  and estado is distinct from 'descontinuado';

-- código 10034, pág. no hallada. Destornilladores punta gabinete, empuñadura Comfort Grip. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = '6c7bb2d3-e510-4a49-b53c-c10ee8a69cd1'
  and estado is distinct from 'descontinuado';

-- código 100833, pág. 85. Destornilladores punta pala, empuñadura Comfort Grip. Página 85 imprime DR-1/4X8B a $7,900 y lo publicado es DR-1/4I6B a $7,500. pala Comfort Grip 1/4 x 8".
update public.product_variants
set estado = 'descontinuado'
where id = '9ac0b6f3-58ef-4c09-adf1-7544f268575e'
  and estado is distinct from 'descontinuado';

-- código 100833, pág. 85. Destornilladores punta phillips, empuñadura Comfort Grip. Página 85 imprime DR-1/4X8B a $7,900 y lo publicado es DP-3/16I3B a $4,500. pala Comfort Grip 1/4 x 8".
update public.product_variants
set estado = 'descontinuado'
where id = '75eb5e15-6aa3-4afd-9880-53657524e9a0'
  and estado is distinct from 'descontinuado';

-- código 100836, pág. 85. Destornilladores punta phillips, empuñadura Comfort Grip. Página 85: el renglón de este código no quedó con clave y precio unívocos. El código está en página 85 del PDF, pero la fila no se leyó. Publicado DP-3/16I4B; b
update public.product_variants
set estado = 'descontinuado'
where id = '09cfe848-e36c-45e4-9957-e08099141323'
  and estado is distinct from 'descontinuado';

-- código 14068, pág. no hallada. Destornilladores punta phillips, empuñadura Comfort Grip. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'b49b2c51-aa84-4231-b878-1dcd7f071064'
  and estado is distinct from 'descontinuado';

-- código 14091, pág. no hallada. Destornilladores punta phillips, empuñadura Comfort Grip. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'd53474db-5705-43db-917e-755767cc7730'
  and estado is distinct from 'descontinuado';

-- código 100834, pág. 85. Destornilladores punta phillips, empuñadura Comfort Grip. El código está en página 85 del PDF, pero la fila no se leyó. Publicado DP-3/8I4B; banco DR-3/8X8B.
update public.product_variants
set estado = 'descontinuado'
where id = '8577f551-b88f-490b-be9f-62d456c0103f'
  and estado is distinct from 'descontinuado';

-- código 17420, pág. no hallada. Hombresolos mordazas curvas, palanca recubierta. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = '7d571d1a-923a-4ffb-b7b7-b309cefc5d56'
  and estado is distinct from 'descontinuado';

-- código 17429, pág. no hallada. Hombresolos mordazas curvas, palanca recubierta. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'a70d4e6f-791d-47ef-a597-29ac1cb48c48'
  and estado is distinct from 'descontinuado';

-- código 17427, pág. no hallada. Hombresolos tipo "C", mordazas autoajustables. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'bb8db7fd-bfe4-48be-8164-fb4eebe46dce'
  and estado is distinct from 'descontinuado';

-- código 10447, pág. no hallada. Inversores de corriente con puertos USB. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = '213bbbe6-5174-4b5a-9efc-c61d10a1301e'
  and estado is distinct from 'descontinuado';

-- código 22971, pág. no hallada. Juegos de alicates y llave expansiva. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'fff0f2b4-5de4-48ee-9bf9-803e0db3afb6'
  and estado is distinct from 'descontinuado';

-- código 15533, pág. no hallada. Juegos de llaves bristol cortas, punta recta, organizador pl. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'e8022ad4-a54b-4a0a-beb2-e19df8b088f8'
  and estado is distinct from 'descontinuado';

-- código 15530, pág. no hallada. Juegos de llaves bristol cortas, punta recta, organizador pl. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = '68c04311-2adf-4bef-9592-2a774247213b'
  and estado is distinct from 'descontinuado';

-- código 15554, pág. 141. La ficha y el PDF son TORX-9 a $16,000, y esa variante ya está en la familia torx. Se apaga este duplicado (ALL-9, texto en mm, $13,000).
update public.product_variants
set estado = 'descontinuado'
where id = 'bd259587-ee50-45fb-b0cc-587a47996e4c'
  and estado is distinct from 'descontinuado';

-- código 17111, pág. no hallada. Limpiadores de carburador. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'eba6a2b4-1372-41d3-95b1-73fe74d4d387'
  and estado is distinct from 'descontinuado';

-- código 7117, pág. no hallada. Motobombas de combustión de 4 tiempos, Ø 4", 3" y 2". El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = '938a4b90-e5ab-4767-bf2c-df72561d5cb4'
  and estado is distinct from 'descontinuado';

-- código 10402, pág. no hallada. Multitesters digitales. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = '9e8903bf-199f-421e-a5f2-f08927776a48'
  and estado is distinct from 'descontinuado';

-- código 18335, pág. no hallada. Testers de tensión. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'e19dc1d0-5f90-4e95-b52d-5aff44690562'
  and estado is distinct from 'descontinuado';

-- código 18333, pág. no hallada. Testers de tensión. El código no aparece en las páginas de producto ni en el índice numérico del PDF.
update public.product_variants
set estado = 'descontinuado'
where id = 'f9a0b706-ebbe-4775-b8da-927960b67279'
  and estado is distinct from 'descontinuado';

-- 3. Productos cuyas variantes publicadas no quedan ninguna. Se apaga el producto.
-- códigos 16711, 16712. Aceites multiusos TRUPER
update public.products
set vendible = false
where id = '400d77c9-49b1-4f6d-bf2b-4501d85af707'
  and vendible is distinct from false;

-- códigos 17438. Hombresolo de cadena
update public.products
set vendible = false
where id = 'f2719a5a-4995-4124-ba6a-72950e519bde'
  and vendible is distinct from false;

-- códigos 17437. Hombresolos mordazas rectas, empuñadura de vinil
update public.products
set vendible = false
where id = '899f918e-f299-4b9c-a73f-16181a9b8a80'
  and vendible is distinct from false;

-- códigos 17416, 17417. Hombresolos tipo "C", mordazas fijas
update public.products
set vendible = false
where id = '209f1530-6eb1-4ba1-84af-0cc303289c63'
  and vendible is distinct from false;

-- códigos 112190, 111997. Minibombas manuales para bicicleta
update public.products
set vendible = false
where id = '44c07234-babf-4d2f-8f52-404c8ef9c2ce'
  and vendible is distinct from false;

-- códigos 10243,2. Motobomba de combustión de 4 tiempos, Ø 1"
update public.products
set vendible = false
where id = '1246a62e-44e3-4eab-913b-7f838b8ac12a'
  and vendible is distinct from false;

-- códigos 103925, 10110. Motobombas de combustión de 2 tiempos.
-- 10110 en el banco es el raspador RASP-3, no una bomba, y 103925 no está en el PDF.
update public.products
set vendible = false
where id = 'd0de9782-1c85-4e41-af0c-a06d6abc1b16'
  and vendible is distinct from false;

-- códigos 23029, 26763. Motobombas de combustión de 4 tiempos PRETUL
update public.products
set vendible = false
where id = 'ce633d17-4338-48f0-941a-322907eca6a9'
  and vendible is distinct from false;

-- códigos 10101. Navaja abatible, cuchilla de cambio rápido
update public.products
set vendible = false
where id = '4856cea8-b3bf-4973-a92c-f495cab3cd67'
  and vendible is distinct from false;

-- códigos 18146. Sopladora/aspiradora eléctrica 1,440 W
update public.products
set vendible = false
where id = '82e52c7e-1e70-47c5-96f3-b55d08047911'
  and vendible is distinct from false;

-- códigos 17241. Tester de receptáculo
update public.products
set vendible = false
where id = 'b860d875-5e8a-4a37-97d5-a2fd0f9ac95b'
  and vendible is distinct from false;

-- códigos 102882, 102141. Testers de tensión sin contacto
update public.products
set vendible = false
where id = 'b7e73ca4-1d28-4013-a269-3259c4b8e5b2'
  and vendible is distinct from false;

commit;
