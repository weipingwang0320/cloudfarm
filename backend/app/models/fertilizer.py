from sqlalchemy import Column, Integer, Float, String, DateTime, func
from app.database import Base


class FertilizerRecord(Base):
    __tablename__ = "fertilizer_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    crop_key = Column(String(50), nullable=False)
    crop_name = Column(String(50), nullable=False)
    target_yield = Column(Float, nullable=False)
    soil_n = Column(Float, nullable=False)
    soil_p = Column(Float, nullable=False)
    soil_k = Column(Float, nullable=False)
    soil_om = Column(Float, nullable=False)
    soil_ph = Column(Float, nullable=False)
    result_n = Column(Float, nullable=False)
    result_p2o5 = Column(Float, nullable=False)
    result_k2o = Column(Float, nullable=False)
    result_urea = Column(Float, nullable=True)
    result_dap = Column(Float, nullable=True)
    result_mop = Column(Float, nullable=True)
    result_znso4 = Column(Float, nullable=True)
    result_borax = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
