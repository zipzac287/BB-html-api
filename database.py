# ==============================================================
# FILE: database.py — Kết nối database
# ==============================================================
# 📚 HỌC: Tại sao cần file riêng cho database?
#
# Nếu viết db connection trong mỗi file:
#   → Lặp code nhiều lần
#   → Khó đổi database (SQLite → PostgreSQL)
#   → Khó test (không mock được)
#
# Tách ra file riêng:
#   → Import từ 1 nơi
#   → Đổi DATABASE_URL là đổi được toàn bộ app
#   → Dễ test bằng cách override get_db()
# ==============================================================

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

logger = logging.getLogger(__name__)

# ==============================================================
# DATABASE URL — "địa chỉ" kết nối database
# ==============================================================
# 📚 HỌC: Connection String Format
#
# SQLite (file local):
#   sqlite:///./ten-file.db
#   sqlite:///:memory:  (in-memory, mất khi restart — dùng test)
#
# PostgreSQL (production):
#   postgresql://user:password@host:port/dbname
#   Ví dụ: postgresql://admin:secret@localhost:5432/bloodbank
#
# MySQL:
#   mysql+pymysql://user:password@host/dbname
#
# Trong production: ĐỌC từ environment variable, không hardcode!
# import os
# DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bloodbank.db")

DATABASE_URL = "sqlite:///./bloodbank.db"

# ==============================================================
# ENGINE — Đối tượng quản lý kết nối vật lý
# ==============================================================
# 📚 HỌC: Engine là gì?
#
# Engine giống như "connection pool manager":
#   - Quản lý nhiều kết nối đồng thời
#   - Tái sử dụng kết nối thay vì tạo mới mỗi lần
#   - Handle timeout, reconnect tự động
#
# Tạo engine MỘT LẦN khi app khởi động
# Không tạo engine trong mỗi request (chậm + tốn tài nguyên)
#
# connect_args={"check_same_thread": False}:
#   → CHỈ dùng cho SQLite
#   → SQLite mặc định chỉ cho 1 thread dùng 1 connection
#   → FastAPI dùng nhiều thread → cần tắt giới hạn này
#   → PostgreSQL/MySQL không cần dòng này
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    # echo=True,  # Uncomment để in ra SQL query (debug)
)

# ==============================================================
# ENABLE WAL MODE cho SQLite
# ==============================================================
# 📚 HỌC: WAL (Write-Ahead Logging)
# Chế độ ghi của SQLite cho phép:
#   - Đọc và viết đồng thời (không bị lock)
#   - Hiệu năng tốt hơn trong môi trường concurrent
# PostgreSQL không cần vì đã built-in

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")  # Enforce foreign key constraints
    cursor.close()

# ==============================================================
# SESSION FACTORY
# ==============================================================
# 📚 HỌC: Session vs Connection
#
# Connection = kết nối vật lý TCP đến database
# Session = đơn vị công việc (unit of work) với database
#
# Session tracks:
#   - Objects đã load từ DB (identity map)
#   - Thay đổi chưa commit
#   - Transaction đang mở
#
# sessionmaker() tạo ra một "factory" (nhà máy)
# Gọi SessionLocal() → tạo ra 1 Session mới
#
# autocommit=False → ta phải tự gọi session.commit()
#   Nếu True: mỗi câu SQL tự commit ngay → khó rollback
#
# autoflush=False → không tự flush trước query
#   Flush = gửi pending SQL đến DB (nhưng chưa commit)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ==============================================================
# BASE MODEL
# ==============================================================
# 📚 HỌC: Declarative Base
#
# declarative_base() trả về class Base
# Tất cả Model (bảng) PHẢI kế thừa từ Base
#
# Base lưu "registry" của tất cả models
# → create_all() dùng registry này để biết cần tạo bảng nào
#
# Base.metadata = object chứa thông tin schema (bảng, cột, index)
Base = declarative_base()

# ==============================================================
# DEPENDENCY INJECTION — get_db()
# ==============================================================
# 📚 HỌC: Dependency Injection trong FastAPI
#
# FastAPI có system "Dependency Injection" mạnh mẽ:
# Dùng Depends(get_db) trong route → FastAPI tự:
#   1. Gọi get_db() trước khi route chạy
#   2. Inject kết quả vào parameter của route
#   3. Sau khi route xong → tiếp tục chạy phần sau yield
#
# FLOW:
#   Request đến → FastAPI gọi get_db() → tạo session
#       ↓
#   yield db → route handler nhận db và xử lý
#       ↓
#   Route xong → finally chạy → db.close()
#
# TẠI SAO DÙNG yield THAY VÌ return?
# yield tạo ra "generator" → code sau yield vẫn chạy được
# return sẽ kết thúc hàm ngay → không cleanup được
#
# Nếu route throw exception:
#   → FastAPI vẫn chạy phần finally → session vẫn được đóng
#   → Không bị resource leak (session bị bỏ quên không đóng)

def get_db():
    """
    Dependency: cung cấp database session cho mỗi request
    
    Sử dụng trong route:
        from database import get_db
        from fastapi import Depends
        
        @router.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    logger.debug("Database session opened")
    try:
        yield db
        # Code trong route handler chạy ở đây
    except Exception as e:
        # Nếu có lỗi → rollback mọi thay đổi chưa commit
        db.rollback()
        logger.error(f"Database error, rolling back: {e}")
        raise  # Re-raise để FastAPI handle lỗi
    finally:
        db.close()
        logger.debug("Database session closed")