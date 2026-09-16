import importlib.util
from pathlib import Path
import socket
import subprocess
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('launcher', ROOT / 'scripts/kobber.py')
launcher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(launcher)


class LauncherTests(unittest.TestCase):
    def test_busy_port_is_detected(self):
        with socket.socket() as server:
            server.bind(('127.0.0.1', 0))
            server.listen()
            self.assertTrue(launcher.occupied(server.getsockname()[1]))

    def test_start_does_not_launch_over_existing_server(self):
        with patch.object(launcher, 'active', return_value=False), patch.object(launcher, 'occupied', return_value=True), patch.object(launcher.subprocess, 'Popen') as popen:
            with self.assertRaises(RuntimeError):
                launcher.start()
            popen.assert_not_called()

    def test_update_preserves_uncommitted_changes(self):
        with patch.object(launcher, 'active', return_value=False), patch.object(launcher, 'occupied', return_value=False), patch.object(launcher, 'tool', return_value='git'), patch.object(launcher, 'command', return_value=subprocess.CompletedProcess([], 0, ' M README.md')) as command:
            with self.assertRaises(RuntimeError):
                launcher.update()
            self.assertEqual(command.call_count, 1)
            self.assertEqual(command.call_args.args[0][1:], ['status', '--porcelain'])

    def test_install_preserves_existing_credentials(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'backend').mkdir()
            env_file = root / 'backend/.env'
            env_file.write_text('SUPABASE_KEY=local-test-value', encoding='utf-8')
            with patch.object(launcher, 'ROOT', root), patch.object(launcher, 'PYTHON', root / 'backend/venv/python'), patch.object(launcher, 'active', return_value=False), patch.object(launcher, 'occupied', return_value=False), patch.object(launcher, 'tool', return_value='test-tool'), patch.object(launcher.sys, 'version_info', (3, 14, 0)), patch.object(launcher, 'command', return_value=subprocess.CompletedProcess([], 0, 'v24.19.0')):
                launcher.install()
            self.assertEqual(env_file.read_text(), 'SUPABASE_KEY=local-test-value')


if __name__ == '__main__':
    unittest.main()
