from fastapi import APIRouter
from app.modules.growth_engine import growth_engine

router = APIRouter(prefix="/api/crops", tags=["crops"])


@router.get("/types")
async def get_crop_types():
    crops = growth_engine.get_supported_crops()
    result = {}
    for c in crops:
        info = growth_engine.get_crop_info(c)
        if info:
            result[c] = {"name": info["name"], "description": info["description"], "max_height": info["max_height"]}
    return {"success": True, "data": result}


@router.post("/simulate")
async def simulate_growth(data: dict):
    result = growth_engine.simulate_day(
        crop_type=data.get("crop_type", "tomato"),
        accumulated_gdd=data.get("accumulated_gdd", 0),
        current_health=data.get("current_health", 100),
        temp_max=data.get("temp_max", 25),
        temp_min=data.get("temp_min", 15),
        precipitation=data.get("precipitation", 0),
        sunshine_hours=data.get("sunshine_hours", 8),
        user_care=data.get("user_care", 0),
    )
    if result:
        return {"success": True, "data": result}
    return {"success": False, "message": "不支持的作物类型"}