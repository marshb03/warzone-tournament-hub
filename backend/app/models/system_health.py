# app/models/system_health.py
from sqlalchemy import Column, Integer, Float, String, DateTime, Enum
from datetime import datetime
import enum
from app.models.base import Base

class MetricType(str, enum.Enum):
    API_RESPONSE_TIME = "API_RESPONSE_TIME"
    ERROR_RATE = "ERROR_RATE"
    ACTIVE_USERS = "ACTIVE_USERS"
    MEMORY_USAGE = "MEMORY_USAGE"
    CPU_USAGE = "CPU_USAGE"

class SystemHealth(Base):
    __tablename__ = "system_health"

    id = Column(Integer, primary_key=True, index=True)
    metric_type = Column(Enum(MetricType))
    value = Column(Float)
    unit = Column(String)
    recorded_at = Column(DateTime, default=datetime.utcnow)