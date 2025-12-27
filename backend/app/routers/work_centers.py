from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/work-centers",
    tags=["work-centers"],
)

from . import auth

@router.post("/", response_model=schemas.WorkCenterOut)
def create_work_center(
    wc: schemas.WorkCenterCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.MANAGER]:
         raise HTTPException(status_code=403, detail="Not authorized")

    db_wc = models.WorkCenter(**wc.dict())
    db.add(db_wc)
    db.commit()
    db.refresh(db_wc)
    return db_wc

@router.get("/", response_model=List[schemas.WorkCenterOut])
def read_work_centers(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    work_centers = db.query(models.WorkCenter).offset(skip).limit(limit).all()
    return work_centers

@router.get("/{wc_id}", response_model=schemas.WorkCenterOut)
def read_work_center(wc_id: int, db: Session = Depends(database.get_db)):
    wc = db.query(models.WorkCenter).filter(models.WorkCenter.id == wc_id).first()
    if wc is None:
        raise HTTPException(status_code=404, detail="Work Center not found")
    return wc
