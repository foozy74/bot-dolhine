from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.sql import func
from core.database import Base

class Setting(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String, nullable=False)  # trading, api, notifications, system
    key = Column(String, nullable=False, unique=True)
    value = Column(String, nullable=False)
    value_type = Column(String, nullable=False, default="string")  # string, int, float, bool
    is_secret = Column(Boolean, default=False)
    description = Column(String, nullable=True)
    min_value = Column(Float, nullable=True)  # Für Validierung
    max_value = Column(Float, nullable=True)  # Für Validierung
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Setting {self.category}/{self.key}>"
