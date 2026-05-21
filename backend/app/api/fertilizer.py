from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.modules.fertilizer_engine import fertilizer_engine
from app.database import get_db
from app.models.fertilizer import FertilizerRecord

router = APIRouter(prefix="/api/fertilizer", tags=["fertilizer"])


@router.get("/crops")
async def get_crops():
    data = fertilizer_engine.get_crops_list()
    return {"success": True, "data": data}


@router.get("/calculate")
async def calculate(
    crop: str = Query(..., description="作物key"),
    target_yield: float = Query(..., description="目标产量 kg/ha"),
    soil_n: float = Query(..., description="土壤速效N mg/kg"),
    soil_p: float = Query(..., description="土壤速效P mg/kg"),
    soil_k: float = Query(..., description="土壤速效K mg/kg"),
    soil_om: float = Query(..., description="土壤有机质 %"),
    soil_ph: float = Query(..., description="土壤pH"),
):
    try:
        data = fertilizer_engine.calculate(
            crop, target_yield, soil_n, soil_p, soil_k, soil_om, soil_ph
        )
        return {"success": True, "data": data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/history")
async def save_history(data: dict, db: AsyncSession = Depends(get_db)):
    result = data.get("result", {})
    nutrients = result.get("nutrients", {})
    products = result.get("products", {})
    micro = result.get("micronutrient", {})

    record = FertilizerRecord(
        crop_key=data.get("crop_key", ""),
        crop_name=data.get("crop_name", ""),
        target_yield=data.get("target_yield", 0),
        soil_n=data.get("soil_n", 0),
        soil_p=data.get("soil_p", 0),
        soil_k=data.get("soil_k", 0),
        soil_om=data.get("soil_om", 0),
        soil_ph=data.get("soil_ph", 0),
        result_n=nutrients.get("N", 0),
        result_p2o5=nutrients.get("P2O5", 0),
        result_k2o=nutrients.get("K2O", 0),
        result_urea=products.get("urea", 0),
        result_dap=products.get("dap", 0),
        result_mop=products.get("mop", 0),
        result_znso4=micro.get("ZnSO4", 0),
        result_borax=micro.get("Borax", 0),
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return {
        "success": True,
        "data": {"id": record.id, "created_at": record.created_at.isoformat()},
    }


@router.get("/history")
async def get_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    count_query = select(func.count(FertilizerRecord.id))
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = (
        select(FertilizerRecord)
        .order_by(FertilizerRecord.created_at.desc())
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
                "crop_key": r.crop_key,
                "crop_name": r.crop_name,
                "target_yield": r.target_yield,
                "soil_n": r.soil_n,
                "soil_p": r.soil_p,
                "soil_k": r.soil_k,
                "soil_om": r.soil_om,
                "soil_ph": r.soil_ph,
                "result_n": r.result_n,
                "result_p2o5": r.result_p2o5,
                "result_k2o": r.result_k2o,
                "result_urea": r.result_urea,
                "result_dap": r.result_dap,
                "result_mop": r.result_mop,
                "result_znso4": r.result_znso4,
                "result_borax": r.result_borax,
                "created_at": r.created_at.isoformat(),
            }
            for r in records
        ],
        "total": total,
    }
