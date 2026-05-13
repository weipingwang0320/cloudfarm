from fastapi import APIRouter
from app.modules.sensor import sensor_simulator
from app.modules.weather import weather_service

router = APIRouter(prefix="/api/sensors", tags=["sensors"])


@router.get("/current")
async def get_current_sensor():
    weather = weather_service.get_current_weather()
    if not weather:
        forecast = await weather_service.get_forecast(days=1)
        weather = forecast[0] if forecast else {"temp_max": 25, "temp_min": 15, "humidity": 60, "precipitation": 0, "sunshine_hours": 8}

    data = sensor_simulator.generate_reading(
        weather_temp_max=weather["temp_max"],
        weather_temp_min=weather["temp_min"],
        weather_humidity=weather["humidity"],
        precipitation=weather["precipitation"],
        sunshine_hours=weather["sunshine_hours"],
    )
    return {"success": True, "data": data}


@router.get("/batch")
async def get_batch_sensor(count: int = 24):
    weather = weather_service.get_current_weather()
    if not weather:
        forecast = await weather_service.get_forecast(days=1)
        weather = forecast[0] if forecast else {"temp_max": 25, "temp_min": 15, "humidity": 60, "precipitation": 0, "sunshine_hours": 8}

    data = sensor_simulator.generate_batch(weather, count=count)
    return {"success": True, "data": data}