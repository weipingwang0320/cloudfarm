from fastapi import APIRouter, HTTPException, Query

from app.modules.calendar_engine import calendar_engine

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


@router.get("/crops")
async def get_crops():
    data = calendar_engine.get_crops_list()
    return {"success": True, "data": data}


@router.get("/provinces")
async def get_provinces():
    data = calendar_engine.get_provinces_list()
    return {"success": True, "data": data}


@router.get("/generate")
async def generate_calendar(
    crop: str = Query(..., description="作物key"),
    province: str = Query(..., description="省份名称"),
    zone: str = Query(..., description="气候区key"),
    sowing_date: str = Query(..., description="播种日期 ISO格式 YYYY-MM-DD"),
):
    try:
        data = calendar_engine.generate_timeline(crop, province, zone, sowing_date)
        return {"success": True, "data": data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
