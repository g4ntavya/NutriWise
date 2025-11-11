import os
from pathlib import Path
from urllib.parse import urlparse, unquote
import mysql.connector

def _to_mysql_params(url: str):
    u = urlparse(url)
    if u.scheme not in ("mysql", "mysql+asyncmy"):
        raise RuntimeError("DATABASE_URL must use mysql or mysql+asyncmy")
    return {
        "user": u.username or "root",
        "password": unquote(u.password or ""),
        "host": u.hostname or "localhost",
        "port": u.port or 3306,
        "database": (u.path or "/").lstrip("/"),
        "autocommit": False,
    }

def apply_all_sql_in_sql_dir():
    root = Path(__file__).resolve().parents[1]
    sql_dir = root / "sql"
    files = sorted(sql_dir.glob("*.sql"))
    if not files:
        return
    url = os.getenv("DATABASE_URL", "")
    params = _to_mysql_params(url)
    conn = mysql.connector.connect(**params)
    try:
        cur = conn.cursor()
        for f in files:
            text = f.read_text(encoding="utf-8")
            for _ in cur.execute(text, multi=True):
                pass
        conn.commit()
    finally:
        conn.close()
