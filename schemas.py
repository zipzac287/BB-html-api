# ==============================================================
# FILE: schemas.py — Validate dữ liệu vào/ra
# ==============================================================
# 📚 HỌC: Pydantic — "Type Safety" cho Python
#
# Python mặc định là dynamically typed:
#   def greet(name):  # name có thể là gì cũng được!
#       return f"Hello {name}"
#
# Pydantic thêm runtime type checking:
#   class User(BaseModel):
#       name: str       # Bắt buộc là string
#       age: int        # Bắt buộc là integer
#
#   user = User(name="An", age="25")  # "25" tự convert sang 25
#   user = User(name="An", age="abc") # ValueError! "abc" không phải int
#
# TẠI SAO TÁCH SCHEMA VÀ MODEL?
#
# Model (models.py) = bảng database (có hashed_password, created_at...)
# Schema (schemas.py) = data API (không có hashed_password, v.v.)
#
# Ví dụ:
#   UserCreate (schema nhận từ client): có "password" (plain text)
#   User (model DB): có "hashed_password" (đã hash)
#   UserResponse (schema trả về): không có password gì cả
# ==============================================================

from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional, List
from datetime import datetime

# ==============================================================
# USER SCHEMAS
# ==============================================================

class UserBase(BaseModel):
    """
    Base schema — các field chung
    Các schema khác kế thừa từ đây (tránh lặp code)
    """
    username: str
    email: str  # EmailStr tự validate format email

class UserCreate(UserBase):
    """Schema nhận khi đăng ký — có thêm password"""
    password: str

    # 📚 HỌC: @field_validator
    # Validator tùy chỉnh chạy sau khi Pydantic parse giá trị
    # cls = class method (không phải instance method)
    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("Password phải có ít nhất 6 ký tự")
        return v

    @field_validator("username")
    @classmethod
    def username_valid(cls, v):
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username phải có ít nhất 3 ký tự")
        if not v.replace(".", "").replace("_", "").isalnum():
            raise ValueError("Username chỉ được chứa chữ, số, dấu . và _")
        return v.lower()  # Tự động lowercase

class UserResponse(UserBase):
    """
    Schema trả về cho client
    KHÔNG có password! (bảo mật)
    """
    id: int
    is_active: bool
    role: str
    created_at: Optional[datetime] = None

    # 📚 HỌC: model_config
    # from_attributes=True: cho phép đọc từ SQLAlchemy object
    # (không phải dict thuần)
    model_config = {"from_attributes": True}

# ==============================================================
# AUTH SCHEMAS
# ==============================================================

class LoginRequest(BaseModel):
    """Data gửi lên khi đăng nhập"""
    username: str
    password: str

class TokenResponse(BaseModel):
    """Data trả về khi đăng nhập thành công"""
    # JWT token — client lưu cái này
    access_token: str
    # Luôn là "bearer" theo chuẩn OAuth2
    token_type: str = "bearer"
    # Thông tin user đi kèm để frontend hiển thị
    user: UserResponse

# ==============================================================
# DONOR SCHEMAS
# ==============================================================

# Danh sách nhóm máu hợp lệ
VALID_BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

class DonorBase(BaseModel):
    name: str
    blood_type: str
    phone: Optional[str] = None    # Optional = không bắt buộc
    city: Optional[str] = None
    date_of_birth: Optional[str] = None

    @field_validator("blood_type")
    @classmethod
    def validate_blood_type(cls, v):
        # Tự uppercase: "a+" → "A+"
        v = v.strip().upper()
        if v not in VALID_BLOOD_TYPES:
            raise ValueError(f"Nhóm máu không hợp lệ. Hợp lệ: {VALID_BLOOD_TYPES}")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Tên phải có ít nhất 2 ký tự")
        return v

class DonorCreate(DonorBase):
    """Dùng khi tạo donor mới"""
    pass  # Kế thừa hết từ DonorBase

class DonorUpdate(BaseModel):
    """
    Dùng khi cập nhật — tất cả field đều Optional
    Client chỉ gửi field muốn cập nhật
    
    📚 HỌC: PATCH vs PUT
    PUT  = thay thế toàn bộ (tất cả field bắt buộc)
    PATCH = cập nhật một phần (chỉ gửi field muốn đổi)
    """
    name: Optional[str] = None
    blood_type: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    date_of_birth: Optional[str] = None

class DonorResponse(DonorBase):
    """Trả về cho client — thêm id, created_at"""
    id: int
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

# ==============================================================
# BLOOD STOCK SCHEMAS
# ==============================================================

class BloodStockResponse(BaseModel):
    id: int
    blood_type: str
    units: int
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class BloodStockUpdate(BaseModel):
    units: int

    @field_validator("units")
    @classmethod
    def units_non_negative(cls, v):
        if v < 0:
            raise ValueError("Số đơn vị không thể âm")
        return v

# ==============================================================
# COMMON SCHEMAS
# ==============================================================

class MessageResponse(BaseModel):
    """Response đơn giản: {"message": "..."}"""
    message: str

class PaginationMeta(BaseModel):
    """
    📚 HỌC: Pagination (phân trang)
    Khi có 10,000 donors → không thể trả về hết 1 lần
    Phân trang: trả về 20 donors/trang
    """
    total: int      # Tổng số records
    page: int       # Trang hiện tại
    per_page: int   # Số records/trang
    pages: int      # Tổng số trang

class PaginatedDonors(BaseModel):
    data: List[DonorResponse]
    meta: PaginationMeta