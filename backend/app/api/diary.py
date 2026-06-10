from fastapi import APIRouter, HTTPException
from app.modules.ai_diary import ai_diary_service

router = APIRouter(prefix="/api/diary", tags=["diary"])


@router.post("/ask")
async def ask_assistant(data: dict):
    question = data.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="请输入您的问题")

    crop_data = {
        "crop_type": data.get("crop_type", ""),
        "stage": data.get("stage", 0),
        "stage_name": data.get("stage_name", ""),
        "height": data.get("height", 0),
    }

    enable_search = data.get("enable_search", False)
    history = data.get("history", None)
    answer = await ai_diary_service.ask_farm_assistant(question, crop_data, enable_search=enable_search, history=history)
    return {"success": True, "data": {"question": question, "answer": answer}}
