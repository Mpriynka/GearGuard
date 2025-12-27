from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(prefix="/equipment", tags=["Equipment"])

from . import auth

@router.post("/", response_model=schemas.EquipmentOut)
def create_equipment(
    equipment: schemas.EquipmentCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.MANAGER]:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    db_equipment = models.Equipment(**equipment.dict())
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

@router.get("/", response_model=List[schemas.EquipmentOut])
def read_equipment(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    equipment = db.query(models.Equipment).offset(skip).limit(limit).all()
    return equipment

@router.get("/{id}", response_model=schemas.EquipmentOut)
def read_equipment_by_id(id: int, db: Session = Depends(database.get_db)):
    equipment = db.query(models.Equipment).filter(models.Equipment.id == id).first()
    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment

@router.put("/{id}", response_model=schemas.EquipmentOut)
def update_equipment(id: int, equipment_update: schemas.EquipmentUpdate, db: Session = Depends(database.get_db)):
    db_equipment = db.query(models.Equipment).filter(models.Equipment.id == id).first()
    if not db_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    for key, value in equipment_update.dict(exclude_unset=True).items():
        setattr(db_equipment, key, value)
        
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(id: int, db: Session = Depends(database.get_db)):
    db_equipment = db.query(models.Equipment).filter(models.Equipment.id == id).first()
    if not db_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    db.delete(db_equipment)
    db.commit()
    return None
