from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func, JSON


from app.database import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plot_id = Column(Integer, ForeignKey("plots.id"), nullable=False)
    crop_type = Column(String(50), nullable=False)
    stage = Column(Integer, default=0)
    stage_progress = Column(Float, default=0.0)
    accumulated_gdd = Column(Float, default=0.0)
    height = Column(Float, default=0.0)
    plant_date = Column(DateTime, server_default=func.now())
    harvest_date = Column(DateTime, nullable=True)
    daily_log = Column(JSON, default=list)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())