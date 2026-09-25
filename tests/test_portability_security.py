import asyncio
import importlib.util
import io
import os
from pathlib import Path, PureWindowsPath
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / "backend"), str(ROOT / "scripts")]
from runtime_paths import project_path, runtime_file
from ml_chrome import chrome_candidates, chrome_profile_dir, _find_chrome_bin
from fastapi.testclient import TestClient
from fastapi import HTTPException, UploadFile
from main import app
from uploads import read_upload
import start


class PortabilityTests(unittest.TestCase):
    def test_storage_independent_of_cwd(self):
        previous = Path.cwd()
        with tempfile.TemporaryDirectory() as folder:
            try:
                os.chdir(folder)
                self.assertEqual(project_path("./storage"), ROOT / "storage")
                self.assertEqual(project_path("carpeta con espacios/á"), ROOT / "carpeta con espacios/á")
            finally:
                os.chdir(previous)

    def test_runtime_names_are_safe(self):
        with tempfile.TemporaryDirectory() as folder, patch.dict(os.environ, {"KOBBER_DATA_DIR": folder}):
            for name in ("../../secret", "CON", 'ml_Café/:*?<>|_resultados.png'):
                path = runtime_file(name)
                self.assertEqual(path.parent, Path(folder))
                self.assertNotIn("/", path.name)
                self.assertNotIn(":", path.name)
                self.assertNotEqual(path.name, "CON")

    def test_platform_chrome_locations(self):
        windows = chrome_candidates("win32", {"LOCALAPPDATA": "C:/Users/Test Name/AppData/Local"}, PureWindowsPath("C:/Users/Test Name"))
        self.assertTrue(str(windows[0]).replace("\\", "/").endswith("Google/Chrome/Application/chrome.exe"))
        mac = chrome_candidates("darwin", {}, Path("/Users/test name"))
        self.assertEqual(mac[0].as_posix(), "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
        self.assertEqual(mac[1].as_posix(), "/Users/test name/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
        self.assertTrue(chrome_candidates("linux", {}, Path("/home/test")))

    def test_platform_chrome_profile_locations(self):
        windows = chrome_profile_dir(
            "win32", {"LOCALAPPDATA": "C:/Users/Test Name/AppData/Local"},
            PureWindowsPath("C:/Users/Test Name"),
        )
        self.assertEqual(
            str(windows).replace("\\", "/"),
            "C:/Users/Test Name/AppData/Local/KobberChromeProfile",
        )
        mac = chrome_profile_dir("darwin", {}, Path("/Users/test name"))
        self.assertEqual(mac.as_posix(), "/Users/test name/Library/Application Support/KobberChromeProfile")
        linux = chrome_profile_dir("linux", {}, Path("/home/test"))
        self.assertEqual(linux.as_posix(), "/home/test/.local/share/KobberChromeProfile")

    def test_explicit_chrome_profile_location(self):
        with tempfile.TemporaryDirectory() as folder:
            self.assertEqual(
                chrome_profile_dir("win32", {"KOBBER_CHROME_PROFILE_DIR": folder}, Path("C:/Users/Test")),
                Path(folder).resolve(),
            )

    def test_explicit_chrome_with_spaces(self):
        with tempfile.TemporaryDirectory() as folder:
            binary = Path(folder) / "Chrome con espacios.exe"
            binary.touch()
            with patch.dict(os.environ, {"CHROME_EXECUTABLE": str(binary)}):
                self.assertEqual(_find_chrome_bin(), str(binary))

    def test_venv_layouts(self):
        self.assertEqual(start.venv_python(Path("repo"), "win32"), Path("repo/backend/venv/Scripts/python.exe"))
        self.assertEqual(start.venv_python(Path("repo"), "darwin"), Path("repo/backend/venv/bin/python"))

    def test_launcher_mirrors_child_output(self):
        from types import SimpleNamespace
        process = SimpleNamespace(stdout=iter(["started\n", "ready\n"]))
        log = io.StringIO()
        with patch("builtins.print") as printer:
            start.mirror_output("backend", process, log)
        self.assertEqual(log.getvalue(), "started\nready\n")
        printer.assert_any_call("[backend] started\n", end="", flush=True)

    def test_desktop_deployment_entrypoints(self):
        expected = (
            "deployment/windows/instalar_Kobber.bat",
            "deployment/windows/iniciar_Kobber.bat",
            "deployment/windows/actualizar_Kobber.bat",
            "deployment/macos/instalar_Kobber.command",
            "deployment/macos/iniciar_Kobber.command",
            "deployment/macos/actualizar_Kobber.command",
        )
        for relative in expected:
            self.assertTrue((ROOT / relative).is_file(), relative)
        manager = (ROOT / "deployment/common/manage.py").read_text(encoding="utf-8")
        self.assertIn('"--ff-only"', manager)
        self.assertIn('branch != "main"', manager)

    def test_scraper_uses_current_python_and_utf8(self):
        from types import SimpleNamespace
        from routes.analyzer import _download_template
        seen = []
        def fake_scraper(command, **kwargs):
            self.assertEqual(command[0], sys.executable)
            self.assertEqual(Path(command[1]), ROOT / "scripts/ml_scrape_template.py")
            source = Path(command[3])
            self.assertIn("Categoría\tCafé", source.read_text(encoding="utf-8"))
            self.assertEqual(kwargs["env"]["PYTHONUTF8"], "1")
            seen.append(source)
            return SimpleNamespace(returncode=0, stderr="")
        with tempfile.TemporaryDirectory() as folder, patch.dict(os.environ, {"KOBBER_DATA_DIR": folder}), patch("routes.analyzer.get_client") as db, patch("routes.analyzer.subprocess.run", side_effect=fake_scraper):
            db.return_value.table.return_value.select.return_value.in_.return_value.execute.return_value.data = [{"nombre": "Café", "categoria_ml": "Categoría"}]
            self.assertTrue(asyncio.run(_download_template({"product_ids": ["test"]}))["ok"])
        self.assertEqual(len(seen), 1)
        self.assertFalse(seen[0].exists())

    def test_no_hardcoded_temporary_paths_or_insecure_tls(self):
        for folder in (ROOT / "backend", ROOT / "scripts"):
            for file in folder.rglob("*.py"):
                if "venv" in file.parts:
                    continue
                content = file.read_text(encoding="utf-8")
                self.assertNotIn('"/tmp/', content, str(file))
                self.assertNotIn("ssl.CERT_NONE", content, str(file))

    def test_foreign_cwd_backend_import(self):
        with tempfile.TemporaryDirectory() as folder:
            result = subprocess.run(
                [sys.executable, "-c", "import main; import config; print(config.STORAGE_PATH)"],
                cwd=folder, env={**os.environ, "PYTHONPATH": str(ROOT / "backend"), "STORAGE_PATH": "./storage"},
                capture_output=True, text=True, encoding="utf-8",
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn(str(ROOT / "storage"), result.stdout)


class SecurityTests(unittest.TestCase):
    def test_tls_verification_enabled(self):
        import ssl
        from tls import verified_context
        context = verified_context()
        self.assertTrue(context.check_hostname)
        self.assertEqual(context.verify_mode, ssl.CERT_REQUIRED)

    def setUp(self):
        self.client = TestClient(app, base_url="http://127.0.0.1:8000", client=("127.0.0.1", 50000))

    def test_health(self):
        self.assertEqual(self.client.get("/health").json()["service"], "kobber-admin")

    def test_unknown_host_denied(self):
        self.assertEqual(self.client.get("/health", headers={"Host": "evil.example"}).status_code, 400)

    def test_cross_origin_denied_before_handler(self):
        self.assertEqual(self.client.post("/api/products/redescribe-all", headers={"Origin": "https://evil.example"}).status_code, 403)

    def test_null_origin_denied(self):
        self.assertEqual(self.client.get("/health", headers={"Origin": "null"}).status_code, 403)

    def test_remote_client_denied(self):
        client = TestClient(app, base_url="http://127.0.0.1:8000", client=("192.168.1.10", 50000))
        self.assertEqual(client.get("/health").status_code, 403)

    def test_database_read_success_mock(self):
        with patch("database.get_client") as get:
            self.assertEqual(self.client.get("/health/db").status_code, 200)
            get.return_value.table.assert_called_once_with("products")

    def test_database_failure_redacted(self):
        with patch("database.get_client", side_effect=ValueError("secret-token")):
            response = self.client.get("/health/db")
            self.assertEqual(response.status_code, 503)
            self.assertNotIn("secret-token", response.text)

    def test_upload_limit(self):
        with patch("uploads.MAX_UPLOAD_BYTES", 10):
            with self.assertRaises(HTTPException) as exc:
                asyncio.run(read_upload(UploadFile(file=io.BytesIO(b"x" * 11), filename="large.xlsx")))
            self.assertEqual(exc.exception.status_code, 413)

    def test_zip_expansion_limit(self):
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
            archive.writestr("xl/large.xml", "x" * 100)
        with patch("uploads.MAX_EXPANDED_BYTES", 50):
            with self.assertRaises(HTTPException):
                asyncio.run(read_upload(UploadFile(file=io.BytesIO(buffer.getvalue()), filename="large.xlsx")))


if __name__ == "__main__":
    unittest.main()
