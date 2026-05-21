from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.modules.disease_engine import disease_engine
from app.database import get_db
from app.models.disease import DiseaseRecord

router = APIRouter(prefix="/api/disease", tags=["disease"])


@router.post("/recognize")
async def recognize_disease(data: dict):
    image_base64 = data.get("image", "")
    crop_type = data.get("crop_type", "")

    if not image_base64:
        raise HTTPException(status_code=400, detail="请提供图片数据")

    # Strip data:image prefix if present
    if "," in image_base64 and image_base64.startswith("data:"):
        image_base64 = image_base64.split(",", 1)[1]

    result = await disease_engine.recognize(image_base64, crop_type)

    # Save image file
    filename = disease_engine.save_image(image_base64)

    return {
        "success": True,
        "data": {
            **result,
            "filename": filename,
        },
    }


@router.post("/save")
async def save_record(data: dict, db: AsyncSession = Depends(get_db)):
    record = DiseaseRecord(
        crop_type=data.get("crop_type", ""),
        disease_name=data.get("disease_name", ""),
        confidence=data.get("confidence", 0),
        recommendation=data.get("recommendation", ""),
        description=data.get("description", ""),
        image_filename=data.get("filename", ""),
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return {
        "success": True,
        "data": {"id": record.id, "created_at": record.created_at.isoformat()},
    }


@router.post("/feedback")
async def submit_feedback(data: dict, db: AsyncSession = Depends(get_db)):
    record_id = data.get("id")
    is_correct = data.get("is_correct", False)

    if not record_id:
        raise HTTPException(status_code=400, detail="请提供记录ID")

    query = select(DiseaseRecord).where(DiseaseRecord.id == record_id)
    result = await db.execute(query)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")

    record.feedback = is_correct
    await db.commit()

    return {
        "success": True,
        "data": {"id": record.id, "feedback": is_correct},
    }


@router.get("/history")
async def get_history(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    count_query = select(func.count(DiseaseRecord.id))
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = (
        select(DiseaseRecord)
        .order_by(DiseaseRecord.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    records = result.scalars().all()

    return {
        "success": True,
        "data": [
            {
                "id": r.id,
                "crop_type": r.crop_type,
                "disease_name": r.disease_name,
                "confidence": r.confidence,
                "description": r.description,
                "recommendation": r.recommendation,
                "image_filename": r.image_filename,
                "feedback": r.feedback,
                "created_at": r.created_at.isoformat(),
            }
            for r in records
        ],
        "total": total,
    }


@router.get("/reference")
async def get_reference(crop_type: str = ""):
    data = disease_engine.get_reference(crop_type)
    return {"success": True, "data": data}
