from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from datetime import datetime
from .. import models, schemas, database
from . import auth

router = APIRouter(prefix="/requests", tags=["Requests"])



@router.get("/", response_model=List[schemas.RequestOut])
def read_requests(
    skip: int = 0, 
    limit: int = 100, 
    equipment_id: Optional[int] = None, 
    technician_id: Optional[int] = None, # Added filter
    db: Session = Depends(database.get_db)
):
    query = db.query(models.MaintenanceRequest)
    if equipment_id:
        query = query.filter(models.MaintenanceRequest.equipment_id == equipment_id)
    if technician_id:
        query = query.filter(models.MaintenanceRequest.technician_id == technician_id)
        
    requests = query.offset(skip).limit(limit).all()
    # Sort or Order if needed, but not specified.
    return requests

@router.get("/calendar", response_model=List[schemas.RequestOut])
def read_requests_calendar(
    start_date: date,
    end_date: date,
    db: Session = Depends(database.get_db)
):
    # Filter by scheduled_date for Preventive, or created_at for Corrective?
    # Logic: "Requests specifically typed as Preventive... must appear on Calendar View"
    # So we filter for PREVENTIVE and scheduled_date in range.
    # OR maybe all requests? "know upcoming workload" implies everything.
    # Let's include everything active or scheduled in that range.
    # But requirement specifically mentioned Flow B (Preventive) -> Visibility.
    # I'll return requests where (scheduled_date is within range) OR (request_type=CORRECTIVE and created_at within range)
    # Actually, simpler: return all requests overlapping the window.
    
    # Filter by scheduled_date OR created_at (for Corrective maintenance that might not have a scheduled date)
    from sqlalchemy import or_
    query = db.query(models.MaintenanceRequest).filter(
        or_(
            models.MaintenanceRequest.scheduled_date.between(start_date, end_date),
            models.MaintenanceRequest.created_at.between(start_date, end_date)
        )
    )
    return query.all()

@router.post("/", response_model=schemas.RequestOut)
def create_request(request: schemas.RequestCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Validation: Must have either equipment_id or work_center_id
    if not request.equipment_id and not request.work_center_id:
        raise HTTPException(status_code=400, detail="Either Equipment or Work Center must be selected.")

    # Validation: Preventive must have scheduled_date
    if request.request_type == models.RequestType.PREVENTIVE and not request.scheduled_date:
        raise HTTPException(status_code=400, detail="Preventive requests must have a scheduled date")

    # Auto-assign fields
    db_request = models.MaintenanceRequest(**request.dict())
    db_request.reporter_id = current_user.id
    db_request.stage = models.RequestStage.NEW
    db_request.company_name = current_user.company_name # Inherit company

    # Logic: Auto-fill team_id from Equipment if not provided
    if request.equipment_id and not request.team_id:
         equipment = db.query(models.Equipment).filter(models.Equipment.id == request.equipment_id).first()
         if equipment and equipment.default_team_id:
             db_request.team_id = equipment.default_team_id
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.put("/{id}", response_model=schemas.RequestOut)
def update_request(id: int, request_update: schemas.RequestUpdate, db: Session = Depends(database.get_db)):
    db_request = db.query(models.MaintenanceRequest).filter(models.MaintenanceRequest.id == id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")

    update_data = request_update.dict(exclude_unset=True)
    
    # Validation Logic: Technician Assignment
    if "technician_id" in update_data and update_data["technician_id"]:
        tech_id = update_data["technician_id"]
        # Check if tech is in the assigned team
        tech = db.query(models.User).filter(models.User.id == tech_id).first()
        if not tech:
             raise HTTPException(status_code=400, detail="Technician not found")
             
        # If request has a team, tech must be in it?
        # User model has 'team_id'.
        # Note: If db_request.team_id is set, we check tech.team_id == db_request.team_id
        if db_request.team_id and tech.team_id != db_request.team_id:
            # Maybe the tech doesn't belong to the team. 
            # But the requirement says "Request assigned to specific team should only be picked up by members of that team".
            # So updating technician_id must obey this.
            raise HTTPException(status_code=400, detail="Technician does not belong to the assigned team")
    
    # Logic: Scrap Trigger
    if "stage" in update_data:
        new_stage = update_data["stage"]
        
        if new_stage == models.RequestStage.SCRAP:
            # Trigger Update Equipment
            db_equipment = db.query(models.Equipment).filter(models.Equipment.id == db_request.equipment_id).first()
            if db_equipment:
                db_equipment.status = models.EquipmentStatus.SCRAP
                # No separate commit needed if same session, but good to be explicit or ensure it flushes.
                db.add(db_equipment) 
        
        if new_stage == models.RequestStage.IN_PROGRESS and db_request.stage != models.RequestStage.IN_PROGRESS:
            db_request.started_at = datetime.utcnow()
            
        if new_stage == models.RequestStage.REPAIRED:
            db_request.completed_at = datetime.utcnow()
            if db_request.started_at:
                diff = db_request.completed_at - db_request.started_at
                db_request.duration_minutes = int(diff.total_seconds() / 60)

    for key, value in update_data.items():
        setattr(db_request, key, value)

    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(id: int, db: Session = Depends(database.get_db)):
    db_request = db.query(models.MaintenanceRequest).filter(models.MaintenanceRequest.id == id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    db.delete(db_request)
    db.commit()
    return None
