"""
Run all .sql files in ./sql (alphabetical) against DATABASE_URL using mysql-connector-python.
Usage (PowerShell/CMD):
  set DATABASE_URL=mysql://root:password@localhost:3306/nutriwise
  python scripts/apply_sql.py
"""
import os, sys
from pathlib import Path
from urllib.parse import urlparse, unquote
import mysql.connector

def _params_from_url(url: str):
    u = urlparse(url)
    if u.scheme not in ("mysql", "mysql+asyncmy"):
        raise SystemExit("❌ DATABASE_URL must start with mysql:// or mysql+asyncmy://")
    return {
        "user": u.username or "root",
        "password": "ADserver@54321",
        "host": u.hostname or "localhost",
        "port": u.port or 3306,
        "database": (u.path or "/").lstrip("/"),
        "autocommit": False,
    }

def main():
    root = Path(__file__).resolve().parents[1]
    sql_dir = root / "sql"
    files = sorted(sql_dir.glob("*.sql"))
    if not files:
        print(f"❌ No .sql files in {sql_dir}")
        sys.exit(1)

    url = os.getenv("DATABASE_URL", "")
    if not url:
        print("❌ DATABASE_URL not set")
        sys.exit(1)

    params = _params_from_url(url)
    print(f"🔗 Connecting to: mysql://{params['user']}@{params['host']}:{params['port']}/{params['database']}")
    try:
        conn = mysql.connector.connect(**params)
        cur = conn.cursor()
        for f in files:
            print(f"⌛ Applying {f.name} ...")
            sql = f.read_text(encoding="utf-8")
            for _ in cur.execute(sql, multi=True):
                pass
        conn.commit()
        print("🎉 All SQL files applied successfully.")
    except Exception as e:
        print(f"❌ Failed: {e}")
        sys.exit(1)
    finally:
        try:
            conn.close()
        except:
            pass

if __name__ == "__main__":
    main()
