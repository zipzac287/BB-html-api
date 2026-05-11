# routers/donors.py
# ==============================================================
# 📚 HỌC: CRUD Pattern
# Create  → POST   /donors/
# Read    → GET    /donors/ và GET /donors/{id}
# Update  → PUT    /donors/{id}
# Delete  → DELETE /donors/{id}
# ==============================================================

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
import models, schemas
from auth import get_current_user, require_admin

router = APIRouter(prefix="/donors", tags=["👥 Donors"])

# GET /donors/ — Lấy tất cả donors (có filter + search)
@router.get("/", response_model=List[schemas.DonorResponse])
def get_donors(
    # 📚 HỌC: Query Parameters
    # /donors/?blood_type=O%2B&city=HCM&skip=0&limit=50
    # Query() cho phép set default, validate, description
    blood_type: Optional[str] = Query(None, description="Lọc theo nhóm máu"),
    city: Optional[str] = Query(None, description="Lọc theo thành phố"),
    search: Optional[str] = Query(None, description="Tìm theo tên"),
    skip: int = Query(0, ge=0, description="Bỏ qua N records đầu (pagination)"),
    limit: int = Query(100, ge=1, le=500, description="Tối đa bao nhiêu records"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Lấy danh sách donors với filter tùy chọn.
    
    📚 HỌC: SQLAlchemy Query Building
    Xây query dần dần bằng cách chain .filter()
    Không execute SQL cho đến khi gọi .all() hoặc .first()
    """
    # Bắt đầu với query tất cả donors
    # SQL: SELECT * FROM donors
    query = db.query(models.Donor)

    # Thêm filter theo blood_type nếu có
    # SQL: WHERE blood_type = ?
    if blood_type:
        query = query.filter(models.Donor.blood_type == blood_type.upper())

    # Thêm filter theo city
    if city:
        # ilike = LIKE không phân biệt hoa thường
        # SQL: WHERE city LIKE '%hcm%'
        query = query.filter(models.Donor.city.ilike(f"%{city}%"))

    # Tìm kiếm theo tên
    if search:
        query = query.filter(models.Donor.name.ilike(f"%{search}%"))

    # Pagination
    # SQL: ORDER BY id DESC LIMIT ? OFFSET ?
    donors = (query
              .order_by(models.Donor.created_at.desc())
              .offset(skip)   # Bỏ qua N records
              .limit(limit)   # Lấy tối đa N records
              .all())         # Execute query!

    return donors

# GET /donors/{donor_id} — Lấy 1 donor theo ID
@router.get("/{donor_id}", response_model=schemas.DonorResponse)
def get_donor(
    donor_id: int,  # Path parameter: /donors/5
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user)
):
    # 📚 HỌC: .first() vs .one()
    # .first() → trả về None nếu không tìm thấy
    # .one()   → raise exception nếu không tìm thấy hoặc có nhiều hơn 1
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()

    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy donor ID {donor_id}"
        )
    return donor

# POST /donors/ — Tạo donor mới
@router.post("/", response_model=schemas.DonorResponse, status_code=201)
def create_donor(
    donor_data: schemas.DonorCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # model_dump(): Pydantic model → Python dict
    # {"name": "...", "blood_type": "...", ...}
    new_donor = models.Donor(
        **donor_data.model_dump(),
        created_by=current_user.id
    )
    db.add(new_donor)
    db.commit()
    db.refresh(new_donor)
    return new_donor

# PUT /donors/{id} — Cập nhật donor
@router.put("/{donor_id}", response_model=schemas.DonorResponse)
def update_donor(
    donor_id: int,
    donor_data: schemas.DonorCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user)
):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Không tìm thấy donor")

    # Cập nhật từng field
    # model_dump(exclude_unset=True): chỉ lấy field được gửi lên
    for field, value in donor_data.model_dump().items():
        setattr(donor, field, value)  # donor.name = value

    db.commit()
    db.refresh(donor)
    return donor

# DELETE /donors/{id} — Xóa donor (chỉ admin)
@router.delete("/{donor_id}", response_model=schemas.MessageResponse)
def delete_donor(
    donor_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)  # Chỉ admin!
):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Không tìm thấy donor")

    name = donor.name
    db.delete(donor)
    db.commit()

    return {"message": f"Đã xóa donor '{name}' (ID: {donor_id})"}