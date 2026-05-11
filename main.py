# ==============================================================
# FILE: main.py — Điểm khởi đầu của toàn bộ app
# ==============================================================
# 📚 HỌC: FastAPI application lifecycle
#
# Khi chạy "uvicorn main:app --reload":
#   1. Python đọc file này
#   2. Tạo bảng database (create_all)
#   3. Tạo FastAPI app object
#   4. Đăng ký middleware (CORS)
#   5. Đăng ký routers
#   6. Uvicorn lắng nghe request tại port 8000
# ==============================================================

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
import time

# Import local modules
from database import engine
import models
from routers import auth_router, donors, blood_stock

# ==============================================================
# LOGGING — Ghi log ra terminal để debug
# ==============================================================
# logging.basicConfig: cấu hình logging cho toàn app
# level=INFO: hiện INFO, WARNING, ERROR (không hiện DEBUG)
# format: định dạng mỗi dòng log
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

# ==============================================================
# TẠO BẢNG DATABASE
# ==============================================================
# create_all() đọc tất cả Model (class kế thừa Base)
# và tạo bảng tương ứng trong file .db
# Nếu bảng đã tồn tại → bỏ qua (không xóa data)
logger.info("Kiểm tra và tạo bảng database...")
models.Base.metadata.create_all(bind=engine)
logger.info("Database sẵn sàng ✓")

# ==============================================================
# TẠO FASTAPI APP
# ==============================================================
app = FastAPI(
    title="🩸 Blood Bank API",
    description="""
    ## API quản lý ngân hàng máu

    ### Tính năng:
    - **Authentication**: Đăng ký, đăng nhập, JWT token
    - **Donors**: Thêm, xem, tìm kiếm, xóa người hiến máu
    - **Blood Stock**: Theo dõi tồn kho theo nhóm máu

    ### Cách dùng:
    1. Đăng ký tại `POST /auth/register`
    2. Đăng nhập tại `POST /auth/login` → nhận token
    3. Click "Authorize" bên trên → dán token vào
    4. Thử các API khác
    """,
    version="2.0.0",
    # docs_url: URL của Swagger UI
    docs_url="/docs",
    # redoc_url: URL của ReDoc (giao diện khác)
    redoc_url="/redoc"
)

# ==============================================================
# MIDDLEWARE — Chạy trước/sau mỗi request
# ==============================================================

# 1. CORS Middleware
# ==============================================================
# 📚 HỌC: CORS (Cross-Origin Resource Sharing)
#
# "Origin" = protocol + domain + port
# http://localhost:5500 ≠ http://localhost:8000 (khác port → khác origin)
#
# Browser CHẶN request từ origin A đến origin B theo mặc định
# (bảo mật: tránh website độc hại đọc data từ bank của bạn)
#
# Để cho phép frontend gọi API:
# → Server phải gửi header "Access-Control-Allow-Origin"
# → CORSMiddleware tự động thêm header này
#
# allow_origins=["*"] = cho phép TẤT CẢ origins
# ⚠️ Chỉ dùng trong development!
# Production: chỉ cho phép domain cụ thể:
# allow_origins=["https://myapp.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 2. Request Logging Middleware
# ==============================================================
# 📚 HỌC: Custom Middleware với @app.middleware
# Chạy code trước VÀ sau mỗi request
# Dùng để: logging, timing, authentication check, rate limiting
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware tự viết: log mỗi request + thời gian xử lý
    
    request: thông tin request đến
    call_next: hàm gọi route handler tiếp theo
    """
    start_time = time.time()
    
    # Gọi route handler
    response = await call_next(request)
    
    # Tính thời gian xử lý
    process_time = (time.time() - start_time) * 1000
    
    logger.info(
        f"{request.method} {request.url.path} "
        f"→ {response.status_code} "
        f"({process_time:.1f}ms)"
    )
    
    return response

# ==============================================================
# ĐĂNG KÝ ROUTERS
# ==============================================================
# 📚 HỌC: Router pattern
# Thay vì viết tất cả route trong 1 file (main.py)
# → Chia thành nhiều file theo chức năng
# → Dễ đọc, dễ bảo trì, teamwork hiệu quả hơn

# include_router() = "gắn" router vào app
# Tất cả route trong auth_router bắt đầu bằng /auth
app.include_router(auth_router.router)   # /auth/login, /auth/register, /auth/me
app.include_router(donors.router)         # /donors/, /donors/{id}, ...
app.include_router(blood_stock.router)    # /stock/, /stock/{blood_type}

# ==============================================================
# STATIC FILES — Phục vụ file HTML/CSS/JS
# ==============================================================
# Sau khi mount, truy cập:
# http://localhost:8000/static/index.html → frontend/index.html
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# ==============================================================
# ROUTES CHÍNH
# ==============================================================

@app.get("/", tags=["Health"])
async def root():
    """
    Route gốc — kiểm tra server đang chạy
    
    📚 HỌC: Đây là "health check" endpoint
    Monitor tools gọi endpoint này mỗi vài giây
    Nếu không phản hồi → server có vấn đề
    """
    return {
        "status": "✅ online",
        "app": "Blood Bank API",
        "version": "2.0.0",
        "docs": "/docs",
        "frontend": "/static/index.html"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Chi tiết hơn — dùng cho monitoring"""
    from database import engine
    from sqlalchemy import text
    
    # Kiểm tra database có respond không
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "ok",
        "database": db_status,
        "timestamp": time.time()
    }

# ==============================================================
# GLOBAL ERROR HANDLER
# ==============================================================
# 📚 HỌC: Exception Handler
# Bắt tất cả lỗi không được xử lý → trả về JSON thay vì HTML
# Tránh server crash trả về trang lỗi HTML cho mobile/API client

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Lỗi server. Vui lòng thử lại sau."}
    )

# ==============================================================
# CHẠY TRỰC TIẾP (không qua uvicorn)
# python main.py
# ==============================================================
if __name__ == "__main__":
    import uvicorn
    # reload=True: tự restart khi code thay đổi
    # host="0.0.0.0": cho phép truy cập từ mạng khác (không chỉ localhost)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)