from fastapi import APIRouter
from app.modules.weather import weather_service

router = APIRouter(prefix="/api/weather", tags=["weather"])


@router.get("/forecast")
async def get_forecast(days: int = 7):
    data = await weather_service.get_forecast(days=days)
    current = weather_service.get_current_weather()
    alert = weather_service.is_extreme_weather(current) if current else None
    return {"success": True, "data": data, "alert": alert}


@router.get("/current")
async def get_current():
    data = weather_service.get_current_weather()
    if not data:
        forecast = await weather_service.get_forecast(days=1)
        data = forecast[0] if forecast else None
    alert = weather_service.is_extreme_weather(data) if data else None
    return {"success": True, "data": data, "alert": alert}