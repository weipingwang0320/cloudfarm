import json
import os
import base64
import re
from typing import Optional

import httpx
from app.config import settings

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
GLM_API_BASE = "https://open.bigmodel.cn/api/paas/v4"
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")


def _load_json(filename: str):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


class DiseaseEngine:
    def __init__(self):
        self._ref_data = _load_json("disease_reference.json")
        os.makedirs(UPLOAD_DIR, exist_ok=True)

    async def recognize(self, image_base64: str, crop_type: str = "") -> dict:
        if settings.AI_PROVIDER.lower() == "glm" and settings.GLM_API_KEY:
            try:
                return await self._call_glm_vision(image_base64, crop_type)
            except Exception as e:
                print(f"[DiseaseEngine] GLM vision error: {e}")
                # Fall through to local matching

        return self._local_match(crop_type)

    async def _call_glm_vision(self, image_base64: str, crop_type: str) -> dict:
        url = f"{GLM_API_BASE}/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.GLM_API_KEY}",
            "Content-Type": "application/json",
        }
        crop_hint = f"这是{crop_type}的图片。" if crop_type else ""

        prompt = f"""你是一个农作物病虫害识别专家。请仔细分析图片，识别是否存在病虫害。

{crop_hint}请严格按此JSON格式返回（只返回JSON，不输出其他内容）：
{{"disease_name":"病害中文名（健康则填'健康植株'）","confidence":0.0到1.0的数字,"description":"病害特征描述（50字内）","recommendation":"具体可操作的防治建议（100字内，分条用数字列出）"}}

注意：图片不清晰或无法判断时confidence低于0.5；健康植株confidence高于0.9。"""

        messages = [
            {"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
            ]}
        ]

        payload = {
            "model": settings.GLM_VISION_MODEL,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 800,
        }

        async with httpx.AsyncClient(timeout=90) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code >= 400:
                print(f"[DiseaseEngine] GLM API error {resp.status_code}: {resp.text[:300]}")
            resp.raise_for_status()
            data = resp.json()

            if "choices" in data and len(data["choices"]) > 0:
                content = data["choices"][0]["message"]["content"].strip()
                return self._parse_glm_response(content)
            else:
                print(f"[DiseaseEngine] Unexpected GLM response: {json.dumps(data, ensure_ascii=False)[:300]}")

        raise RuntimeError("GLM API 返回异常")

    def _parse_glm_response(self, content: str) -> dict:
        try:
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                result = json.loads(json_match.group())
                return {
                    "disease_name": str(result.get("disease_name", "未知")),
                    "confidence": min(1.0, max(0.0, float(result.get("confidence", 0.5)))),
                    "description": str(result.get("description", "")),
                    "recommendation": str(result.get("recommendation", "")),
                }
        except (json.JSONDecodeError, ValueError, AttributeError) as e:
            print(f"[DiseaseEngine] JSON parse error: {e} | content: {content[:200]}")

        return {
            "disease_name": "识别异常",
            "confidence": 0.3,
            "description": "AI模型返回格式异常，请重试",
            "recommendation": "请重新拍摄清晰图片或咨询当地农技人员",
        }

    def _local_match(self, crop_type: str) -> dict:
        """Local disease matching using reference data when AI is unavailable."""
        diseases = self._ref_data["diseases"]
        if crop_type:
            matching = [d for d in diseases if crop_type in d.get("crop", "")]
            if matching:
                return {
                    "disease_name": "需人工识别",
                    "confidence": 0.0,
                    "description": f"AI服务暂不可用。{crop_type}需重点关注的病害包括：{'、'.join(d['name'] for d in matching[:3])}等",
                    "recommendation": "建议开启GLM AI视觉服务以获得自动识别，或对照上述病害特征进行人工判断",
                }
        return {
            "disease_name": "需人工识别",
            "confidence": 0.0,
            "description": "AI服务暂不可用，请稍后重试",
            "recommendation": "建议检查GLM_API_KEY是否有效，并确保GLM_VISION_MODEL配置正确（推荐glm-4v-flash）",
        }

    def save_image(self, image_base64: str, filename: str = None) -> str:
        if filename is None:
            from datetime import datetime
            filename = f"disease_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}.jpg"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(image_base64))
        return filename

    def get_reference(self, crop_type: str = "") -> list[dict]:
        diseases = self._ref_data["diseases"]
        if crop_type:
            diseases = [d for d in diseases if crop_type in d.get("crop", "")]
        return diseases


disease_engine = DiseaseEngine()
