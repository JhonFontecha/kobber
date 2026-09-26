# Kobber

Herramienta de catálogo Truper/Pretul/FIERO, publicador local de MercadoLibre y tienda pública.
Arquitectura: [CLAUDE.md](CLAUDE.md). Operación de Chrome: [scripts/ML_RUNBOOK.md](scripts/ML_RUNBOOK.md).

## Requisitos

- Python **3.10+**, recomendado **3.14**, con venv.
- Node **20.19+ en la serie 20, o 22.12+**; recomendado Node 24 LTS. npm incluido.
- Google Chrome instalado para los procesos de MercadoLibre.
- Proyecto Supabase con sus tablas y credenciales. Clonar el código no crea las tablas.
- Clave Anthropic para funciones de IA; no es necesaria para consultar el catálogo.

## Instaladores para equipos de escritorio

Los archivos destinados a los siete equipos locales están aislados en
`deployment/`; no participan en el despliegue del servidor.

Windows:

- Primera vez: `deployment/windows/instalar_Kobber.bat`
- Uso diario: `deployment/windows/iniciar_Kobber.bat`
- Actualización: `deployment/windows/actualizar_Kobber.bat`

macOS:

- Primera vez: `deployment/macos/instalar_Kobber.command`
- Uso diario: `deployment/macos/iniciar_Kobber.command`
- Actualización: `deployment/macos/actualizar_Kobber.command`

El instalador comprueba Git, Python, Node/npm y Chrome; clona `main` en
`Documents/Proyectos/kobber`; prepara backend y frontend; abre el `.env` si
falta; compila; ejecuta las pruebas; crea un acceso directo y arranca Kobber.
El actualizador conserva credenciales y datos locales, exige una copia limpia
de `main` y nunca descarta cambios del usuario. Consulta `deployment/README.md`.

Linux: desde la raíz del repositorio:
```sh
python3 scripts/start.py
```

Windows, macOS y Linux usan internamente el mismo iniciador Python:
1. Valida herramientas; si hay un proceso en 8000 o 5173, informa y se detiene sin matarlo.
2. Crea el entorno local si falta e instala las versiones de backend/requirements.txt.
3. Ejecuta npm ci cuando faltan dependencias o cambia package-lock.json.
4. Crea backend/.env desde la plantilla si falta. Completa el archivo y vuelve a ejecutar.
5. Arranca servicios solo en 127.0.0.1; comprueba Supabase con una consulta de lectura.
6. Abre http://127.0.0.1:5173/admin.

Mantén abierta la ventana del iniciador. **Ctrl+C** detiene los dos procesos que inició.
No se garantiza limpieza al forzar el cierre de la ventana o apagar el equipo; si un puerto
queda ocupado, identifica el proceso antes de cerrarlo. Registros: .kobber/backend.log y frontend.log.
Tras cambiar .env, detén con Ctrl+C y vuelve a iniciar para cargar la configuración nueva.

## Configuración local

Archivo: backend/.env (nunca subirlo al repositorio):
```dotenv
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_clave_publica
SUPABASE_SERVICE_KEY=tu_clave_de_servicio
ANTHROPIC_API_KEY=tu_clave
STORAGE_PATH=./storage
KOBBER_DATA_DIR=.kobber
```

Las rutas relativas parten **siempre de la raíz del proyecto**, incluso al iniciar desde otra
carpeta. Usa rutas relativas cuando compartas la configuración entre sistemas; una ruta absoluta
de un equipo no es portable. CHROME_EXECUTABLE permite indicar la ruta absoluta de Chrome si
está fuera de sus ubicaciones habituales. En .env las rutas se escriben sin escapes de shell.

.kobber contiene el perfil de Chrome, capturas y planes del publicador; no se versiona.
No copies esa carpeta ni backend/venv ni node_modules entre equipos: las dependencias se reinstalan
en cada sistema. Si antes usabas el perfil antiguo /tmp/ml_chrome_profile, inicia sesión ML de nuevo
en el perfil nuevo; el iniciador no copia cookies ni borra el perfil anterior.

## Instalación y arranque manual

Windows (desde la raíz):
```powershell
py -3 -m venv backend\venv
backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
npm.cmd ci
backend\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir backend --no-proxy-headers
```
En otra terminal: `npm.cmd run dev`.

macOS/Linux (desde la raíz):
```sh
python3 -m venv backend/venv
backend/venv/bin/python -m pip install -r backend/requirements.txt
npm ci
backend/venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir backend --no-proxy-headers
```
En otra terminal: `npm run dev`.

Pillow está fijado a 12.3.0, compatible con Python 3.14. Ya no hace falta omitirlo de requirements.

## Comprobación

- Tienda: http://127.0.0.1:5173/
- Administrador: http://127.0.0.1:5173/admin
- API: http://127.0.0.1:8000/health
- Lectura Supabase: http://127.0.0.1:8000/health/db (503 si falla).

```powershell
backend\venv\Scripts\python.exe scripts\start.py --check
backend\venv\Scripts\python.exe -m unittest discover -s tests -v
npm.cmd run build
npm.cmd audit
```
En macOS/Linux sustituye el ejecutable por backend/venv/bin/python y npm.cmd por npm.
El modo --check no instala, no inicia servicios ni consulta Supabase.
La integración continua verifica Windows, macOS y Linux con Python 3.10 y 3.14.

## Publicador y seguridad

Para MercadoLibre usa el botón de iniciar sesión del panel, o ejecuta scripts/ml_login.py
con el Python del entorno virtual. Chrome se detecta por sistema y mantiene un perfil propio.
No hace falta descargar Chromium con Playwright.

El administrador es **local y de un solo usuario**. Se rechazan clientes remotos, hosts desconocidos
y solicitudes de otros orígenes. Esto no equivale a cuentas de usuario: una aplicación local puede
acceder al backend. No publiques main:app en Internet ni lo coloques detrás de un proxy.
La pantalla LoginPage todavía es una demostración, no autentica el backend.

Las cargas se limitan a 25 MiB por archivo y 100 MiB de contenido ZIP declarado expandido.
Solo sube documentos de fuentes confiables; estos límites no son un antivirus ni limitan el
tiempo de procesamiento de todos los formatos.

## Tienda pública

render.yaml despliega main_public:app y un frontend con VITE_PUBLIC_ONLY=true.
El publicador no forma parte de ese backend público.
Antes de publicar la tienda revisa los hallazgos del reporte de seguridad:
la API de tienda expone costos de proveedor y el checkout/login son demostraciones.
Se requiere diseño de permisos/RLS de solo lectura para sustituir la clave de servicio en la API pública.
