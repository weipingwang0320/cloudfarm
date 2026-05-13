import asyncio
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db, close_db
from app.api import weather, crop, sensor, diary, adoption
from app.modules.weather import weather_service
from app.modules.sensor import sensor_simulator


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title=settings.APP_NAME,
    description="气象驱动型元宇宙认养农场系统 - 后端API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather.router)
app.include_router(crop.router)
app.include_router(sensor.router)
app.include_router(diary.router)
app.include_router(adoption.router)


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": "1.0.0",
    }


@app.get("/api/dashboard")
async def get_dashboard():
    weather_data = await weather_service.get_forecast(days=3)
    current_weather = weather_service.get_current_weather()

    sensor_data = None
    if current_weather:
        sensor_data = sensor_simulator.generate_reading(
            weather_temp_max=current_weather["temp_max"],
            weather_temp_min=current_weather["temp_min"],
            weather_humidity=current_weather["humidity"],
            precipitation=current_weather["precipitation"],
            sunshine_hours=current_weather["sunshine_hours"],
        )

    return {
        "success": True,
        "data": {
            "weather": current_weather,
            "forecast": weather_data,
            "sensor": sensor_data["data"] if sensor_data else None,
            "alert": weather_service.is_extreme_weather(current_weather) if current_weather else None,
        },
    }


@app.websocket("/ws/farm")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            action = msg.get("action", "")

            if action == "subscribe_weather":
                for _ in range(60):
                    weather_data = await weather_service.get_forecast(days=1)
                    current = weather_service.get_current_weather()
                    await websocket.send_json({
                        "type": "weather_update",
                        "data": current,
                        "alert": weather_service.is_extreme_weather(current) if current else None,
                    })
                    await asyncio.sleep(30)

            elif action == "subscribe_sensor":
                for _ in range(60):
                    weather = weather_service.get_current_weather()
                    if weather:
                        sensor_data = sensor_simulator.generate_reading(
                            weather_temp_max=weather["temp_max"],
                            weather_temp_min=weather["temp_min"],
                            weather_humidity=weather["humidity"],
                            precipitation=weather["precipitation"],
                            sunshine_hours=weather["sunshine_hours"],
                        )
                        await websocket.send_json({
                            "type": "sensor_update",
                            "data": sensor_data,
                        })
                    await asyncio.sleep(5)

            elif action == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)