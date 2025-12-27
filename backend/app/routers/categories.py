from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.post("/", response_model=schemas.CategoryOut)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(database.get_db)):
    db_category = models.Category(**category.dict())
    try:
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
    except Exception as e:
        print(f"Category Create Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    return db_category

@router.get("/", response_model=List[schemas.CategoryOut])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories
