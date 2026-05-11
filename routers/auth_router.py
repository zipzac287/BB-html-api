# ==============================================================
# FILE: routers/auth_router.py
# ==============================================================
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["🔐 Authentication"])

# ==============================================================
# POST /auth/register — Đăng ký tài khoản
# ==============================================================
# 📚 HỌC: HTTP Status Codes
# 200 OK           — thành công (mặc định)
# 201 Created      — tạo mới thành công
# 400 Bad Request  — client gửi data sai
# 401 Unauthorized — chưa đăng nhập
# 403 Forbidden    — đã đăng nhập nhưng không có quyền
# 404 Not Found    — không tìm thấy resource
# 422 Unprocessable Entity — validation error (Pydantic)
# 500 Internal Server Error — lỗi server

@router.post(
    "/register",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký tài khoản mới"
)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Tạo tài khoản mới với username, email, password.
    
    - **username**: 3-100 ký tự, chỉ chữ/số/./_ 
    - **email**: format email hợp lệ
    - **password**: tối thiểu 6 ký tự
    """

    # Kiểm tra username đã tồn tại
    # db.query(Model): SELECT * FROM users
    # .filter(điều_kiện): WHERE username = ?
    # .first(): LIMIT 1 (trả về None nếu không tìm thấy)
    if db.query(models.User).filter(
        models.User.username == user_data.username
    ).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username đã được sử dụng"
        )

    # Kiểm tra email đã tồn tại
    if db.query(models.User).filter(
        models.User.email == user_data.email
    ).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã được sử dụng"
        )

    # Hash password trước khi lưu
    hashed_pw = hash_password(user_data.password)

    # Tạo User object
    # **user_data.model_dump() = unpack dict:
    # username=..., email=... (không có password — field riêng)
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pw,
    )

    # db.add(): thêm vào session (chưa commit)
    db.add(new_user)
    # db.commit(): ghi vào database thật sự
    db.commit()
    # db.refresh(): reload object từ DB (lấy id, created_at được gen)
    db.refresh(new_user)

    return new_user

# POST /auth/login
@router.post(
    "/login",
    response_model=schemas.TokenResponse,
    summary="Đăng nhập → nhận JWT token"
)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Đăng nhập bằng username + password, nhận JWT access token."""

    # Tìm user
    user = db.query(models.User).filter(
        models.User.username == login_data.username
    ).first()

    # 📚 HỌC: Security best practice
    # KHÔNG nói rõ "sai username" hay "sai password"
    # → Kẻ tấn công không biết username có tồn tại không
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username hoặc password không đúng"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị vô hiệu hóa"
        )

    # Tạo token với payload chứa username và role
    token = create_access_token({
        "sub": user.username,   # subject
        "role": user.role,
        "user_id": user.id
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

# GET /auth/me
@router.get(
    "/me",
    response_model=schemas.UserResponse,
    summary="Xem thông tin user đang đăng nhập"
)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Trả về thông tin user từ token. Dùng để verify token còn hợp lệ."""
    return current_user