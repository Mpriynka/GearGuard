from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[schemas.UserOut])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    role: Optional[models.UserRole] = None,
    team_id: Optional[int] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.User)
    
    if role:
        query = query.filter(models.User.role == role)
    if team_id:
        query = query.filter(models.User.team_id == team_id)
        
    users = query.offset(skip).limit(limit).all()
    return users

@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
