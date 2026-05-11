# ==============================================================
# FILE: models.py — Định nghĩa bảng database
# ==============================================================
# 📚 HỌC: ORM (Object-Relational Mapper)
#
# Vấn đề: Python dùng object, database dùng bảng/hàng
# ORM = "phiên dịch viên" giữa Python objects và SQL tables
#
# KHÔNG dùng ORM (SQL thuần):
#   cursor.execute("INSERT INTO users VALUES (?, ?)", (name, email))
#
# DÙNG ORM (SQLAlchemy):
#   user = User(name=name, email=email)
#   db.add(user)
#   db.commit()
#
# Ưu điểm ORM:
#   ✓ Code Python thay vì SQL string (type-safe)
#   ✓ Tự động escape → tránh SQL injection
#   ✓ Dễ đổi database (SQLite → PostgreSQL)
#   ✗ Đôi khi generate SQL kém tối ưu hơn viết tay
# ==============================================================

from sqlalchemy import (
    Column,          # Định nghĩa cột
    Integer,         # Kiểu số nguyên
    String,          # Kiểu chuỗi
    Boolean,         # Kiểu true/false
    DateTime,        # Kiểu ngày giờ
    ForeignKey,      # Khóa ngoại (liên kết bảng)
    Index,           # Tạo index để tìm kiếm nhanh
    text             # SQL thuần trong SQLAlchemy
)
from sqlalchemy.sql import func   # SQL functions (NOW(), COUNT(), ...)
from sqlalchemy.orm import relationship  # Định nghĩa quan hệ giữa bảng

from database import Base

# ==============================================================
# MODEL 1: User — Bảng tài khoản
# ==============================================================
# 📚 HỌC: SQL tương đương:
#
# CREATE TABLE users (
#     id          INTEGER PRIMARY KEY AUTOINCREMENT,
#     username    VARCHAR(100) UNIQUE NOT NULL,
#     email       VARCHAR(200) UNIQUE NOT NULL,
#     hashed_password VARCHAR(200) NOT NULL,
#     is_active   BOOLEAN DEFAULT TRUE,
#     role        VARCHAR(50) DEFAULT 'staff',
#     created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
# );
# CREATE INDEX idx_users_username ON users(username);
# ==============================================================

class User(Base):
    __tablename__ = "users"

    # PRIMARY KEY: định danh duy nhất mỗi hàng
    # Integer + primary_key=True → SQLite tự AUTOINCREMENT
    id = Column(Integer, primary_key=True, index=True)

    # VARCHAR(100): chuỗi tối đa 100 ký tự
    # unique=True: không cho phép 2 hàng cùng giá trị
    # nullable=False: bắt buộc có giá trị (NOT NULL)
    # index=True: tạo B-tree index → tìm theo username nhanh hơn
    username = Column(String(100), unique=True, nullable=False, index=True)

    email = Column(String(200), unique=True, nullable=False, index=True)

    # KHÔNG BAO GIỜ lưu password thường!
    # Chỉ lưu hash: "$2b$12$abc..." (không thể reverse)
    hashed_password = Column(String(255), nullable=False)

    # default=True: giá trị mặc định khi tạo record mới
    is_active = Column(Boolean, default=True, nullable=False)

    # Role-based access control (RBAC)
    # "admin": full quyền
    # "staff": quyền giới hạn (không xóa được donor)
    role = Column(String(50), default="staff", nullable=False)

    # func.now(): gọi SQL NOW() tại thời điểm INSERT
    # server_default: thực thi ở database level (không phải Python)
    created_at = Column(DateTime, server_default=func.now())

    # ===========================================================
    # 📚 HỌC: SQLAlchemy Relationship
    # Không tạo cột mới trong DB
    # Chỉ là "shortcut" để truy cập data từ bảng liên quan
    #
    # user.donors → trả về list Donor của user này
    # Dưới hood: SELECT * FROM donors WHERE created_by = user.id
    # ===========================================================
    donors = relationship("Donor", back_populates="creator", lazy="dynamic")

    def __repr__(self):
        """Hiển thị đẹp khi print(user)"""
        return f"<User id={self.id} username={self.username}>"

# ==============================================================
# MODEL 2: Donor — Bảng người hiến máu
# ==============================================================

class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(200), nullable=False)

    # index=True: thường xuyên filter theo blood_type → cần index
    blood_type = Column(String(10), nullable=False, index=True)

    # nullable=True (mặc định): không bắt buộc
    phone = Column(String(20), nullable=True)

    city = Column(String(100), nullable=True, index=True)

    # Lưu ngày sinh dạng string "YYYY-MM-DD" cho đơn giản
    # Production: dùng Date type và tính tuổi động
    date_of_birth = Column(String(20), nullable=True)

    # FOREIGN KEY: liên kết với bảng users
    # ON DELETE SET NULL: nếu user bị xóa → created_by = NULL (không xóa donor)
    created_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    created_at = Column(DateTime, server_default=func.now())

    # onupdate: tự cập nhật khi record bị sửa
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationship ngược lại với User
    creator = relationship("User", back_populates="donors")

    # ===========================================================
    # 📚 HỌC: Table-level Index
    # Index trên nhiều cột → tối ưu query lọc nhiều điều kiện
    #
    # Ví dụ query: WHERE blood_type='O+' AND city='HCM'
    # Index (blood_type, city) → nhanh hơn 2 index riêng lẻ
    # ===========================================================
    __table_args__ = (
        Index('idx_donor_blood_city', 'blood_type', 'city'),
    )

    def __repr__(self):
        return f"<Donor id={self.id} name={self.name} blood={self.blood_type}>"

# ==============================================================
# MODEL 3: BloodStock — Bảng tồn kho máu
# ==============================================================

class BloodStock(Base):
    __tablename__ = "blood_stock"

    id = Column(Integer, primary_key=True, index=True)

    # unique=True: mỗi nhóm máu chỉ có 1 dòng trong bảng
    blood_type = Column(String(10), unique=True, nullable=False)

    # CHECK constraint: units >= 0 (tránh số âm)
    # Trong SQLAlchemy dùng CheckConstraint trong __table_args__
    units = Column(Integer, default=0, nullable=False)

    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<BloodStock {self.blood_type}={self.units}>"

# ==============================================================
# 📚 TÓM TẮT: Quan hệ giữa các bảng
#
# users ─────────────────────────────────────────┐
#   id (PK)                                       │ created_by (FK)
#   username                                      │
#   ...                                           ▼
#                                              donors
# blood_stock                                   id (PK)
#   id (PK)                                     name
#   blood_type (UNIQUE)                         blood_type
#   units                                       ...
#
# Diagram:
#   1 User → nhiều Donor (one-to-many)
#   BloodStock độc lập (không liên kết trực tiếp)
#
# SQL JOIN ví dụ:
#   SELECT d.name, d.blood_type, u.username
#   FROM donors d
#   LEFT JOIN users u ON d.created_by = u.id
# ==============================================================