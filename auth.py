# ==============================================================
# FILE: auth.py — Toàn bộ logic Authentication
# ==============================================================
# 📚 HỌC: Authentication vs Authorization
#
# Authentication (Xác thực) = "Bạn là ai?"
#   → Đăng nhập bằng username/password
#   → Nhận token
#
# Authorization (Phân quyền) = "Bạn được làm gì?"
#   → Token nói bạn là "staff" → không được xóa donor
#   → Token nói bạn là "admin" → được xóa
#
# FILE NÀY XỬ LÝ:
#   1. Hash password (bcrypt)
#   2. Tạo JWT token khi đăng nhập
#   3. Giải mã JWT token từ mỗi request
#   4. Dependency functions bảo vệ route
# ==============================================================

from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import logging

from database import get_db
import models

logger = logging.getLogger(__name__)

# ==============================================================
# CẤU HÌNH BẢO MẬT
# ==============================================================

# 📚 HỌC: SECRET_KEY là gì?
#
# JWT token được "ký" bằng secret key:
#   token = header.payload.SIGNATURE
#   SIGNATURE = HMAC(header + payload, SECRET_KEY)
#
# Ai có SECRET_KEY mới có thể tạo/xác thực token hợp lệ
# → KHÔNG BAO GIỜ chia sẻ secret key
# → Production: lưu trong environment variable
#   SECRET_KEY = os.getenv("SECRET_KEY")
#   Tạo key mạnh: python -c "import secrets; print(secrets.token_hex(32))"

SECRET_KEY = "blood-bank-dev-key-CHANGE-IN-PRODUCTION-use-env-var"
ALGORITHM = "HS256"  # HMAC + SHA-256 — phổ biến nhất
ACCESS_TOKEN_EXPIRE_HOURS = 8  # Token hết hạn sau 8 tiếng

# ==============================================================
# PASSWORD HASHING — Bcrypt
# ==============================================================
# 📚 HỌC: Tại sao phải hash password?
#
# Kịch bản: Database bị hack
# - Nếu lưu plain text: "mypassword123" → hacker đọc được ngay
# - Nếu lưu hash bcrypt: "$2b$12$EixZ..." → không thể reverse
#
# Bcrypt đặc điểm:
#   1. One-way: không thể từ hash → password gốc
#   2. Salted: cùng password nhưng hash ra khác nhau mỗi lần
#      hash("abc") = "$2b$12$X..." (lần 1)
#      hash("abc") = "$2b$12$Y..." (lần 2) — khác!
#      → Chống rainbow table attack
#   3. Slow (chủ ý): 12 rounds mặc định
#      → Brute force cần hàng năm thay vì giây

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Higher = slower = more secure
)

def hash_password(plain_password: str) -> str:
    """
    Chuyển "mypassword" → "$2b$12$abc..." (không thể reverse)
    
    Luôn dùng hàm này — không tự hash bằng md5/sha1 (không đủ an toàn)
    """
    return pwd_context.hash(plain_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Kiểm tra password nhập vào có khớp với hash không
    
    Bcrypt tự extract salt từ hash string rồi hash lại để so sánh
    → Không cần lưu salt riêng
    
    Returns:
        True  → đúng password
        False → sai password
    """
    return pwd_context.verify(plain_password, hashed_password)

# ==============================================================
# JWT TOKEN
# ==============================================================
# 📚 HỌC: JWT (JSON Web Token) là gì?
#
# JWT = chuỗi 3 phần ngăn cách bởi dấu chấm:
#   eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.abc123
#   |______header______|.|___payload_________|.|_sig_|
#
# 1. HEADER (base64): thuật toán ký
#    {"alg": "HS256", "typ": "JWT"}
#
# 2. PAYLOAD (base64): thông tin user (KHÔNG mã hóa! Chỉ encode)
#    {"sub": "admin", "role": "admin", "exp": 1735689600}
#    → Bất kỳ ai cũng có thể đọc payload (decode base64)
#    → KHÔNG lưu thông tin nhạy cảm trong payload!
#
# 3. SIGNATURE (HMAC):
#    HMAC-SHA256(header + "." + payload, SECRET_KEY)
#    → Chỉ ai có SECRET_KEY mới tạo được signature hợp lệ
#    → Server verify: tính lại signature → so sánh
#
# LUỒNG:
#   Login → Server tạo JWT → Client lưu JWT
#   Request API → Client gửi JWT trong header
#   Server verify JWT → cho phép hoặc từ chối

def create_access_token(data: dict) -> str:
    """
    Tạo JWT token từ payload data
    
    Args:
        data: dict thông tin user, vd: {"sub": "admin", "role": "admin"}
              "sub" = subject = định danh chính (username)
    
    Returns:
        JWT token string
    """
    payload = data.copy()

    # Thêm expiration time
    # timezone.utc: dùng UTC (không bị ảnh hưởng timezone server)
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload["exp"] = expire

    # Thêm issued-at time
    payload["iat"] = datetime.now(timezone.utc)

    # Ký token bằng SECRET_KEY
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    logger.info(f"Token created for user: {data.get('sub')}")
    return token

def decode_token(token: str) -> dict:
    """
    Giải mã và verify JWT token
    
    Kiểm tra:
    1. Signature hợp lệ (không bị giả mạo/sửa)
    2. Token chưa hết hạn
    
    Raises:
        HTTPException 401: token invalid hoặc expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
            # WWW-Authenticate header: theo chuẩn OAuth2
            headers={"WWW-Authenticate": "Bearer"},
        )

# ==============================================================
# DEPENDENCIES — Bảo vệ route
# ==============================================================
# 📚 HỌC: FastAPI Dependency Injection
#
# Dependency = hàm chạy trước route handler
# FastAPI tự gọi dependency và inject kết quả
#
# VÍ DỤ:
#   @router.get("/protected")
#   def protected(user = Depends(get_current_user)):
#       return {"hello": user.username}
#
#   → Mỗi request đến /protected:
#     1. FastAPI gọi get_current_user()
#     2. get_current_user đọc + verify token
#     3. Nếu valid → inject user object vào route
#     4. Nếu invalid → trả 401 ngay, route không chạy
#
# CHAIN DEPENDENCY:
#   require_admin depends on get_current_user
#   get_current_user depends on bearer_scheme và get_db
#   → FastAPI tự resolve chain

# HTTPBearer: đọc token từ "Authorization: Bearer <token>" header
bearer_scheme = HTTPBearer(
    scheme_name="JWT Bearer Token",
    description="Dán JWT token nhận được từ /auth/login"
)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Dependency: xác thực user từ JWT token
    
    Trả về User object nếu token hợp lệ
    Raises 401 nếu token thiếu/sai/hết hạn
    """
    token = credentials.credentials  # Lấy token string từ header

    # Giải mã token → payload dict
    payload = decode_token(token)

    # Lấy username từ payload
    username: str = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=401,
            detail="Token không chứa thông tin user"
        )

    # Tìm user trong database
    # Mỗi request đều query DB để đảm bảo user vẫn tồn tại/active
    # (Nếu account bị khóa, token cũ vẫn không dùng được)
    user = db.query(models.User).filter(
        models.User.username == username
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="User không tồn tại")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Tài khoản đã bị vô hiệu hóa")

    return user

def get_current_user_optional(
    db: Session = Depends(get_db),
    authorization: str = None
) -> Optional[models.User]:
    """
    Dependency: token optional (không bắt buộc đăng nhập)
    Dùng cho endpoint public nhưng có thêm tính năng khi đăng nhập
    """
    pass  # Implement nếu cần

def require_admin(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """
    Dependency: chỉ cho phép admin
    
    Phải đăng nhập (get_current_user) VÀ phải có role="admin"
    
    📚 HỌC: Dependency chain
    require_admin → get_current_user → bearer_scheme + get_db
    FastAPI tự resolve từ trong ra ngoài
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền thực hiện thao tác này. Yêu cầu quyền Admin."
        )
    return current_user

# Type alias cho gọn (tùy chọn)
from typing import Annotated, Optional
CurrentUser = Annotated[models.User, Depends(get_current_user)]
AdminUser = Annotated[models.User, Depends(require_admin)]