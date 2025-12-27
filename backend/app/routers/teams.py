from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.post("/", response_model=schemas.TeamOut)
def create_team(team: schemas.TeamCreate, db: Session = Depends(database.get_db)):
    db_team = models.Team(**team.dict())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@router.get("/", response_model=List[schemas.TeamOut])
def read_teams(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    teams = db.query(models.Team).offset(skip).limit(limit).all()
    return teams
