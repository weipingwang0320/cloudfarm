from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, func
from app.database import Base


class DiseaseRecord(Base):
    __tablename__ = "disease_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    crop_type = Column(String(50), nullable=True, default="")
    disease_name = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    recommendation = Column(String(1000), nullable=True)
    description = Column(String(500), nullable=True)
    image_filename = Column(String(200), nullable=True)
    feedback = Column(Boolean, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
