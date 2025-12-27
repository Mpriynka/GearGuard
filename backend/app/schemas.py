from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
from .models import UserRole, RequestType, RequestPriority, RequestStage, EquipmentStatus

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Optional[UserRole] = UserRole.EMPLOYEE
    department: Optional[str] = None
    company_name: Optional[str] = None
    team_id: Optional[int] = None # Added team_id

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    role: Optional[UserRole] = None
    department: Optional[str] = None
    company_name: Optional[str] = None
    team_id: Optional[int] = None

# --- Team Schemas ---
class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None

class TeamCreate(TeamBase):
    pass

class TeamOut(TeamBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Work Center Schemas ---
class WorkCenterBase(BaseModel):
    name: str
    code: str
    department: str
    status: Optional[EquipmentStatus] = EquipmentStatus.ACTIVE
    location: Optional[str] = None
    capacity: Optional[int] = 0
    cost_per_hour: Optional[int] = 0
    oee_target: Optional[int] = 85

class WorkCenterCreate(WorkCenterBase):
    pass

class WorkCenterOut(WorkCenterBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Request Schemas ---
class RequestBase(BaseModel):
    title: str
    description: str
    request_type: RequestType
    priority: Optional[RequestPriority] = RequestPriority.MEDIUM
    scheduled_date: Optional[datetime] = None 
    maintenance_for: Optional[str] = "equipment"

class RequestCreate(RequestBase):
    equipment_id: Optional[int] = None
    work_center_id: Optional[int] = None
    team_id: Optional[int] = None
    technician_id: Optional[int] = None

class RequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    stage: Optional[RequestStage] = None
    priority: Optional[RequestPriority] = None
    technician_id: Optional[int] = None
    scheduled_date: Optional[datetime] = None

class RequestOut(RequestBase):
    id: int
    stage: RequestStage
    equipment_id: Optional[int]
    work_center_id: Optional[int]
    team_id: Optional[int]
    technician_id: Optional[int]
    reporter_id: int
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_minutes: Optional[int]

    # Nested objects for UI convenience
    reporter: Optional[UserOut] = None
    technician: Optional[UserOut] = None

    class Config:
        from_attributes = True

# --- Equipment Schemas ---
class EquipmentBase(BaseModel):
    name: str
    serial_number: str
    category_id: Optional[int] = None
    department: str
    description: Optional[str] = None
    status: Optional[EquipmentStatus] = EquipmentStatus.ACTIVE
    location: Optional[str] = None
    default_team_id: Optional[int] = None
    default_technician_id: Optional[int] = None

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    serial_number: Optional[str] = None
    category_id: Optional[int] = None
    department: Optional[str] = None
    description: Optional[str] = None
    status: Optional[EquipmentStatus] = None
    location: Optional[str] = None
    default_team_id: Optional[int] = None
    default_technician_id: Optional[int] = None

class EquipmentOut(EquipmentBase):
    id: int
    # Include a summary of requests for the "Smart Button" view? 
    # Or keep it separate. The requirement says "Clicking it opens a list". 
    # So a separate endpoint GET /equipment/{id}/requests is better.
    
    # Nested objects
    default_technician: Optional[UserOut] = None
    category_rel: Optional[CategoryOut] = None

    class Config:
        from_attributes = True
