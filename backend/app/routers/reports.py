from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, database

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(database.get_db)):
    # 1. Critical Equipment (Health < 30%)
    # Logic: For now, we count equipment with status 'UNDER_MAINTENANCE' or associated with CRITICAL active requests.
    # Let's simple count Equipment where status != ACTIVE
    critical_eq_count = db.query(models.Equipment).filter(
        models.Equipment.status != models.EquipmentStatus.ACTIVE
    ).count()

    # 2. Technician Load
    # Logic: Ratio of Active Requests to Total Technicians.
    total_techs = db.query(models.User).filter(models.User.role == models.UserRole.TECHNICIAN).count()
    active_requests = db.query(models.MaintenanceRequest).filter(
        models.MaintenanceRequest.stage.in_([models.RequestStage.NEW, models.RequestStage.IN_PROGRESS])
    ).count()
    
    # Avoid division by zero
    tech_load_msg = "0% Utilized"
    if total_techs > 0:
        # Assuming an arbitrary "Full Load" is 5 requests per tech
        load_percentage = int((active_requests / (total_techs * 5)) * 100)
        tech_load_msg = f"{load_percentage}% Utilized"

    # 3. Open Requests (Pending / Overdue)
    # Pending = NEW + IN_PROGRESS
    # Overdue = NEW + IN_PROGRESS and scheduled_date < Now (for Preventive) or created_at < Now - 1 day (for Corrective)
    # Keeping it simple: Pending label
    
    return {
        "critical_equipment": {
            "count": critical_eq_count,
            "label": "Units (Not Active)"
        },
        "technician_load": {
            "label": tech_load_msg,
            "details": "(Based on active requests)"
        },
        "open_requests": {
            "count": active_requests,
            "label": "Pending Requests"
        }
    }
