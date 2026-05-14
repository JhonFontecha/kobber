import sqlite3
import json
from contextlib import contextmanager
from config import DB_PATH, init_storage

def init_db():
    init_storage()
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS products (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre              TEXT    NOT NULL,
                sku                 TEXT,
                descripcion         TEXT,
                variantes           TEXT    DEFAULT '[]',
                precio_distribuidor REAL,
                precio_mc           REAL,
                unidades_caja       INTEGER,
                categoria           TEXT,
                margen              REAL    DEFAULT 0,
                imagenes            TEXT    DEFAULT '[]',
                pagina_catalogo     INTEGER,
                estado              TEXT    DEFAULT 'pendiente',
                created_at          TEXT    DEFAULT (datetime('now')),
                updated_at          TEXT    DEFAULT (datetime('now'))
            );
        """)

@contextmanager
def get_conn():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def row_to_dict(row):
    d = dict(row)
    for field in ("variantes", "imagenes"):
        if isinstance(d.get(field), str):
            try:
                d[field] = json.loads(d[field])
            except (json.JSONDecodeError, TypeError):
                d[field] = []
    return d
