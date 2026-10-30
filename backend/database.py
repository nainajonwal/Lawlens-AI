import os
from urllib.parse import quote_plus
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load variables from .env into the environment
load_dotenv()

DB_USER = os.getenv("DB_USER", "root")
raw_password = os.getenv("DB_PASSWORD", "") or ""
DB_PASSWORD = quote_plus(raw_password)
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "lawlens_db")

# Attempt MySQL/MariaDB first, fallback to SQLite if unavailable
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = None

try:
    # Try connecting to MySQL with a short timeout
    _engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 2})
    with _engine.connect() as conn:
        pass
    engine = _engine
    print("[Database] Successfully connected to MySQL/MariaDB database.")
except Exception as e:
    # Graceful fallback to SQLite (always resolve to backend/lawlens.db regardless of working directory)
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    db_file_path = os.path.join(backend_dir, "lawlens.db")
    SQLITE_URL = f"sqlite:///{db_file_path.replace(os.sep, '/')}"
    print(f"[Database] MySQL connection unavailable ({e}). Falling back to local SQLite: {SQLITE_URL}")
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

# Each request will get its own "session" — a temporary workspace for DB queries
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All our future table models will inherit from this Base class
Base = declarative_base()

# Helper function FastAPI will use to get a DB session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()