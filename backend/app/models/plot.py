from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func


from app.database import Base


class Plot(Base):
    __tablename__ = "plots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plot_number = Column(Integer, nullable=False, unique=True)
    status = Column(String(20), default="available")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    crop_type = Column(String(50), nullable=True)
    adoption_plan = Column(String(20), nullable=True)
    adopted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())