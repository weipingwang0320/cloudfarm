import math
from enum import IntEnum
from typing import Dict, List, Optional, Tuple


STAGE_NAMES = ["播种期", "发芽期", "幼苗期", "生长期", "开花期", "结果期", "成熟期"]


class GrowthStage(IntEnum):
    SEED = 0
    GERMINATION = 1
    SEEDLING = 2
    VEGETATIVE = 3
    FLOWERING = 4
    FRUITING = 5
    MATURE = 6


CROP_PARAMS: Dict[str, dict] = {
    "tomato": {
        "name": "番茄",
        "base_temp": 10,
        "total_gdd": 1600,
        "stage_thresholds": [0, 0.05, 0.15, 0.35, 0.55, 0.75, 1.0],
        "max_height": 80,
        "description": "一年生草本植物，喜温暖光照，果实营养丰富",
    },
    "wheat": {
        "name": "小麦",
        "base_temp": 5,
        "total_gdd": 2000,
        "stage_thresholds": [0, 0.06, 0.18, 0.40, 0.55, 0.70, 1.0],
        "max_height": 80,
        "description": "禾本科植物，全球最重要的粮食作物之一",
    },
    "strawberry": {
        "name": "草莓",
        "base_temp": 8,
        "total_gdd": 1400,
        "stage_thresholds": [0, 0.05, 0.12, 0.30, 0.50, 0.70, 1.0],
        "max_height": 25,
        "description": "蔷薇科多年生草本，果实鲜美多汁",
    },
    "rice": {
        "name": "水稻",
        "base_temp": 12,
        "total_gdd": 2200,
        "stage_thresholds": [0, 0.05, 0.15, 0.35, 0.55, 0.75, 1.0],
        "max_height": 110,
        "description": "禾本科作物，喜高温多湿，主粮之一",
    },
    "corn": {
        "name": "玉米",
        "base_temp": 10,
        "total_gdd": 1800,
        "stage_thresholds": [0, 0.05, 0.15, 0.35, 0.55, 0.75, 1.0],
        "max_height": 250,
        "description": "禾本科高产作物，重要的粮食与饲料来源",
    },
}


class GrowthEngine:
    def __init__(self):
        self.crop_params = CROP_PARAMS

    def get_supported_crops(self) -> List[str]:
        return list(self.crop_params.keys())

    def get_crop_info(self, crop_type: str) -> Optional[dict]:
        return self.crop_params.get(crop_type)

    def calculate_daily_gdd(self, temp_max: float, temp_min: float, base_temp: float) -> float:
        avg_temp = (temp_max + temp_min) / 2
        gdd = max(0, avg_temp - base_temp)
        return gdd

    def determine_stage(self, accumulated_gdd: float, total_gdd: float, thresholds: List[float]) -> Tuple[int, float]:
        progress = accumulated_gdd / total_gdd if total_gdd > 0 else 0
        progress = min(1.0, max(0.0, progress))

        for stage in range(len(thresholds) - 1, -1, -1):
            if progress >= thresholds[stage]:
                if stage < len(thresholds) - 1:
                    stage_progress = (progress - thresholds[stage]) / (thresholds[stage + 1] - thresholds[stage])
                else:
                    stage_progress = 1.0
                return stage, min(1.0, max(0.0, stage_progress))

        return 0, 0.0

    def calculate_height(self, progress: float, max_height: float) -> float:
        # Sigmoid growth: slow seedling → rapid vegetative → slow ripening
        x = 12 * (progress - 0.4)
        height = max_height / (1 + math.exp(-x))
        return round(max(1.0, height), 1)

    def simulate_day(
        self,
        crop_type: str,
        accumulated_gdd: float,
        temp_max: float,
        temp_min: float,
        precipitation: float,
        sunshine_hours: float,
    ) -> dict:
        params = self.crop_params.get(crop_type)
        if not params:
            return None

        daily_gdd = self.calculate_daily_gdd(temp_max, temp_min, params["base_temp"])
        new_gdd = accumulated_gdd + daily_gdd

        stage, stage_progress = self.determine_stage(
            new_gdd, params["total_gdd"], params["stage_thresholds"]
        )

        total_progress = new_gdd / params["total_gdd"] if params["total_gdd"] > 0 else 0
        total_progress = min(1.0, total_progress)

        height = self.calculate_height(total_progress, params["max_height"])

        return {
            "daily_gdd": round(daily_gdd, 2),
            "accumulated_gdd": round(new_gdd, 2),
            "stage": stage,
            "stage_name": STAGE_NAMES[stage],
            "stage_progress": round(stage_progress, 4),
            "total_progress": round(total_progress, 4),
            "height": height,
            "is_mature": stage >= GrowthStage.MATURE,
        }


growth_engine = GrowthEngine()