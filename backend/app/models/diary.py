from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, func


from app.database import Base


class Diary(Base):
    __tablename__ = "diaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    style = Column(String(20), default="cute")
    weather_summary = Column(String(200))
    stage = Column(Integer)
    is_harvest_message = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class FarmQA(Base):
    __tablename__ = "farm_qa"

    id = Column(Integer, primary_key=True, autoincrement=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())