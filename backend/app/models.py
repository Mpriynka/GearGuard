from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    TECHNICIAN = "TECHNICIAN"
    EMPLOYEE = "EMPLOYEE"

class RequestType(str, enum.Enum):
    CORRECTIVE = "CORRECTIVE"
    PREVENTIVE = "PREVENTIVE"

class RequestPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class RequestStage(str, enum.Enum):
    NEW = "NEW"
    IN_PROGRESS = "IN_PROGRESS"
    REPAIRED = "REPAIRED"
    SCRAP = "SCRAP"

class EquipmentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE"
    SCRAP = "SCRAP"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE)
    department = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    teams = relationship("Team", back_populates="members") # Assuming simple M2M or foreign key logic. 
    # Let's adjust Team-User relationship. 
    # "Specific groups of technicians". A tech belongs to a team.
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    
    assigned_requests = relationship("MaintenanceRequest", foreign_keys="[MaintenanceRequest.technician_id]", back_populates="technician")
    reported_requests = relationship("MaintenanceRequest", foreign_keys="[MaintenanceRequest.reporter_id]", back_populates="reporter")

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)

    members = relationship("User", back_populates="teams") # Users in this team
    equipment = relationship("Equipment", back_populates="default_team")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    
    equipment = relationship("Equipment", back_populates="category_rel")

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    serial_number = Column(String, unique=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category_rel = relationship("Category", back_populates="equipment")
    
    department = Column(String)
    description = Column(String, nullable=True)
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.ACTIVE)
    location = Column(String, nullable=True)

    # Ownership/Responsibility
    default_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    default_team = relationship("Team", back_populates="equipment")

    default_technician_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    default_technician = relationship("User", foreign_keys=[default_technician_id])

    requests = relationship("MaintenanceRequest", back_populates="equipment")

class WorkCenter(Base):
    __tablename__ = "work_centers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    code = Column(String, unique=True, index=True)
    department = Column(String)
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.ACTIVE)
    location = Column(String, nullable=True)
    
    # Capacity Data
    capacity = Column(Integer, default=0) # e.g. units per hour
    cost_per_hour = Column(Integer, default=0)
    oee_target = Column(Integer, default=85) # Percentage

    requests = relationship("MaintenanceRequest", back_populates="work_center")

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    request_type = Column(Enum(RequestType))
    priority = Column(Enum(RequestPriority), default=RequestPriority.MEDIUM)
    stage = Column(Enum(RequestStage), default=RequestStage.NEW)
    
    # Polymorphic-like association
    maintenance_for = Column(String, default="equipment") # 'equipment' or 'work_center'
    
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)
    equipment = relationship("Equipment", back_populates="requests")

    work_center_id = Column(Integer, ForeignKey("work_centers.id"), nullable=True)
    work_center = relationship("WorkCenter", back_populates="requests")

    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True) # Made optional if not assigned yet? Or mandatory? logic says reported by employee -> ??? usually defaults to equipment's team.
    team = relationship("Team")

    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    technician = relationship("User", foreign_keys=[technician_id], back_populates="assigned_requests")

    reporter_id = Column(Integer, ForeignKey("users.id"))
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reported_requests")

    scheduled_date = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
