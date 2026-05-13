from fastapi import APIRouter, HTTPException
from app.modules.ai_diary import ai_diary_service
from app.modules.growth_engine import growth_engine, STAGE_NAMES

router = APIRouter(prefix="/api/diary", tags=["diary"])


@router.post("/generate")
async def generate_diary(data: dict):
    stage = data.get("stage", 0)
    style = data.get("style", "cute")
    crop_type = data.get("crop_type", "tomato")

    stage_name = STAGE_NAMES[stage] if 0 <= stage < len(STAGE_NAMES) else "未知"
    weather_summary = data.get("weather_summary", "天气晴好")

    content = await ai_diary_service.generate_diary(
        stage=stage,
        stage_name=stage_name,
        weather_summary=weather_summary,
        day_number=data.get("day_number", 1),
        style=style,
        crop_type=crop_type,
        temp_max=data.get("temp_max"),
        temp_min=data.get("temp_min"),
    )
    return {"success": True, "data": {"content": content, "style": style, "stage_name": stage_name}}


@router.post("/weekly")
async def generate_weekly_diary(data: dict):
    stage = data.get("stage", 0)
    style = data.get("style", "cute")
    crop_type = data.get("crop_type", "tomato")
    week_num = data.get("week_num", 1)

    stage_name = STAGE_NAMES[stage] if 0 <= stage < len(STAGE_NAMES) else "未知"
    weather_summary = data.get("weather_summary", "天气晴好")

    content = await ai_diary_service.generate_weekly_diary(
        week_num=week_num,
        stage=stage,
        stage_name=stage_name,
        weather_summary=weather_summary,
        day_number=data.get("day_number", 1),
        style=style,
        crop_type=crop_type,
        temp_max=data.get("temp_max"),
        temp_min=data.get("temp_min"),
        week_avg_temp=data.get("week_avg_temp"),
        week_rain_days=data.get("week_rain_days", 0),
        week_sunny_days=data.get("week_sunny_days", 0),
    )
    return {"success": True, "data": {"content": content, "style": style, "stage_name": stage_name, "week_num": week_num}}


@router.post("/ask")
async def ask_assistant(data: dict):
    question = data.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="请输入您的问题")

    crop_data = {
        "crop_type": data.get("crop_type", "tomato"),
        "stage": data.get("stage", 0),
        "stage_name": STAGE_NAMES[data.get("stage", 0)] if 0 <= data.get("stage", 0) < len(STAGE_NAMES) else "未知",
        "height": data.get("height", 0),
    }

    answer = await ai_diary_service.ask_farm_assistant(question, crop_data)
    return {"success": True, "data": {"question": question, "answer": answer}}


@router.get("/styles")
async def get_styles():
    return {"success": True, "data": list(ai_diary_service.DIARY_STYLE_PROMPTS.keys()) if hasattr(ai_diary_service, 'DIARY_STYLE_PROMPTS') else ["cute", "literary", "humorous"]}