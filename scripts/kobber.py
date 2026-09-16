"""Control local de Kobber para Windows y macOS, sin dependencias adicionales."""
import argparse
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import time
import urllib.request

ROOT = Path(__file__).absolute().parents[1]
RUN = ROOT / '.kobber'
STATE = RUN / 'server.json'
STOP = RUN / 'stop'
PYTHON = ROOT / 'backend' / 'venv' / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
API_PORT = int(os.environ.get('KOBBER_API_PORT', '8000'))
WEB_PORT = int(os.environ.get('KOBBER_PORT', '5173'))
ENV = {**os.environ, 'PYTHONUTF8': '1', 'PYTHONUNBUFFERED': '1'}


def command(args, **kwargs):
    return subprocess.run([str(a) for a in args], cwd=ROOT, env=ENV, check=True, **kwargs)


def tool(name):
    found = shutil.which(name)
    if not found:
        raise RuntimeError(f'Falta {name}. Instala Python 3.14, Node.js 24 LTS y Git; vuelve a abrir la terminal.')
    return found


def occupied(port):
    with socket.socket() as sock:
        try:
            sock.bind(('127.0.0.1', port))
            return False
        except OSError:
            return True


def state():
    try:
        return json.loads(STATE.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return None


def active():
    info = state()
    return info and time.time() - info.get('heartbeat', 0) < 15


def save(status):
    temporary = RUN / 'server.tmp'
    temporary.write_text(json.dumps({'status': status, 'heartbeat': time.time(), 'web_port': WEB_PORT, 'api_port': API_PORT}), encoding='utf-8')
    temporary.replace(STATE)


def install():
    if active() or occupied(API_PORT) or occupied(WEB_PORT):
        raise RuntimeError('Deten los servidores antes de instalar o actualizar dependencias.')
    if sys.version_info[:2] != (3, 14):
        raise RuntimeError('Usa Python 3.14 para una instalacion consistente.')
    npm = tool('npm.cmd' if os.name == 'nt' else 'npm')
    node = tool('node')
    version = command([node, '--version'], capture_output=True, text=True).stdout.strip()
    if int(version.lstrip('v').split('.')[0]) != 24:
        raise RuntimeError('Instala Node.js 24 LTS.')
    if not PYTHON.exists():
        command([sys.executable, '-m', 'venv', ROOT / 'backend/venv'])
    command([PYTHON, '-m', 'pip', 'install', '-r', ROOT / 'backend/requirements.txt'])
    command([PYTHON, '-m', 'pip', 'check'])
    command([npm, 'ci'])
    command([npm, 'run', 'build'])
    env_file = ROOT / 'backend/.env'
    if not env_file.exists():
        shutil.copyfile(ROOT / 'backend/.env.example', env_file)
    print('Instalacion completa. Completa backend/.env y ejecuta iniciar. Chrome es necesario para MercadoLibre.')


def healthy(url):
    try:
        with urllib.request.urlopen(url, timeout=1) as response:
            return response.status == 200
    except (OSError, ValueError):
        return False


def supervise():
    # El supervisor conserva los objetos Popen: nunca mata procesos por un PID guardado.
    children, logs = [], []
    try:
        save('iniciando')
        commands = [
            ('backend', [str(PYTHON), '-m', 'uvicorn', 'main:app', '--app-dir', str(ROOT / 'backend'), '--host', '127.0.0.1', '--port', str(API_PORT)]),
            ('frontend', [tool('node'), str(ROOT / 'node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', str(WEB_PORT), '--strictPort']),
        ]
        for name, args in commands:
            log = (RUN / f'{name}.log').open('w', encoding='utf-8')
            logs.append(log)
            children.append(subprocess.Popen(args, cwd=ROOT, env=ENV, stdin=subprocess.DEVNULL, stdout=log, stderr=log))
        deadline = time.monotonic() + 45
        ready = False
        while not STOP.exists():
            if any(p.poll() is not None for p in children):
                raise RuntimeError('Un servidor se detuvo. Revisa .kobber/backend.log y frontend.log.')
            if not ready:
                ready = healthy(f'http://127.0.0.1:{API_PORT}/health') and healthy(f'http://127.0.0.1:{WEB_PORT}')
                if not ready and time.monotonic() > deadline:
                    raise RuntimeError('Los servidores no respondieron a tiempo.')
            save('activo' if ready else 'iniciando')
            time.sleep(0.5)
    finally:
        for child in children:
            if child.poll() is None:
                if os.name == 'nt':
                    # El ejecutable de un venv puede crear otro proceso Python en Windows.
                    subprocess.run(['taskkill', '/PID', str(child.pid), '/T', '/F'],
                                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    child.terminate()
        for child in children:
            try:
                child.wait(timeout=10)
            except subprocess.TimeoutExpired:
                child.kill()
                child.wait()
        for log in logs:
            log.close()
        STATE.unlink(missing_ok=True)
        STOP.unlink(missing_ok=True)


def start():
    if active():
        print('Kobber ya esta iniciado. Usa estado para consultar su direccion.')
        return
    if occupied(API_PORT) or occupied(WEB_PORT):
        raise RuntimeError(f'Puerto {API_PORT} o {WEB_PORT} ocupado. No se detuvo ningun proceso ajeno.')
    if not PYTHON.exists() or not (ROOT / 'dist/index.html').exists():
        raise RuntimeError('Ejecuta instalar primero.')
    if not (ROOT / 'backend/.env').exists():
        raise RuntimeError('Copia backend/.env.example a backend/.env y completa las credenciales.')
    RUN.mkdir(exist_ok=True)
    STOP.unlink(missing_ok=True)
    STATE.unlink(missing_ok=True)
    options = {'creationflags': subprocess.CREATE_NO_WINDOW | subprocess.DETACHED_PROCESS} if os.name == 'nt' else {'start_new_session': True}
    with (RUN / 'supervisor.log').open('w', encoding='utf-8') as log:
        process = subprocess.Popen([sys.executable, str(Path(__file__).absolute()), '_supervisor'], cwd=ROOT, env=ENV, stdin=subprocess.DEVNULL, stdout=log, stderr=log, **options)
    for _ in range(100):
        info = state()
        if info and info['status'] == 'activo':
            print(f'Kobber activo: http://127.0.0.1:{WEB_PORT} | Admin: http://127.0.0.1:{WEB_PORT}/admin')
            print('El catalogo requiere Supabase; las funciones IA requieren Anthropic en backend/.env.')
            return
        if process.poll() is not None:
            raise RuntimeError('No se pudo iniciar. Revisa los registros en .kobber/.')
        time.sleep(0.5)
    STOP.touch()
    raise RuntimeError('Se cancelo el inicio por tiempo de espera. Revisa .kobber/.')


def stop():
    if not active():
        print('No hay un supervisor activo de esta copia. No se detuvieron procesos externos.')
        return
    STOP.touch()
    for _ in range(60):
        if not STATE.exists():
            print('Kobber detenido.')
            return
        time.sleep(0.5)
    raise RuntimeError('La parada no termino; revisa .kobber/supervisor.log.')


def update():
    if active() or occupied(API_PORT) or occupied(WEB_PORT):
        raise RuntimeError('Ejecuta detener antes de actualizar.')
    git = tool('git')
    changes = command([git, 'status', '--porcelain'], capture_output=True, text=True).stdout
    if changes.strip():
        raise RuntimeError('Hay cambios locales o archivos sin seguimiento. Guardalos en Git antes de actualizar.')
    command([git, 'rev-parse', '--abbrev-ref', '@{upstream}'], capture_output=True)
    command([git, 'pull', '--ff-only'])
    # Ejecutar el instalador actualizado, no el codigo ya cargado en memoria.
    command([sys.executable, Path(__file__).resolve(), 'instalar'])
    print('Actualizado. Ejecuta iniciar cuando estes listo.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('accion', choices=['instalar', 'iniciar', 'detener', 'estado', 'actualizar', '_supervisor'])
    action = parser.parse_args().accion
    actions = {'instalar': install, 'iniciar': start, 'detener': stop, 'actualizar': update, '_supervisor': supervise,
               'estado': lambda: print(f"Kobber {state()['status']}: http://127.0.0.1:{state()['web_port']}" if active() else 'Kobber detenido (sin supervisor activo).')}
    try:
        actions[action]()
    except (RuntimeError, OSError, subprocess.CalledProcessError) as error:
        print(f'Error: {error}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
