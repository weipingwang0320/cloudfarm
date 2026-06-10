from typing import Optional

import httpx
from app.config import settings


GLM_API_BASE = "https://open.bigmodel.cn/api/paas/v4"


class AIDiaryService:
    def __init__(self):
        self.provider = settings.AI_PROVIDER.lower()
        self.glm_api_key = settings.GLM_API_KEY
        self.glm_model = settings.GLM_MODEL

    async def _call_glm(self, messages: list, temperature: float = 0.8, enable_search: bool = False) -> Optional[str]:
        url = f"{GLM_API_BASE}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.glm_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.glm_model,
            "messages": messages,
            "temperature": temperature,
            "stream": False,
        }
        if enable_search:
            payload["tools"] = [{
                "type": "web_search",
                "web_search": {
                    "enable": "True",
                    "search_prompt": "请基于以下联网搜索结果回答用户问题。如果搜索结果包含相关信息，请引用并总结。如果搜索结果不相关，请如实告知用户并基于你的知识回答。\n\n搜索结果：{search_result}",
                    "search_recency_filter": "month",
                    "count": "5",
                }
            }]
        async with httpx.AsyncClient(timeout=90) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            if "choices" in data and len(data["choices"]) > 0:
                choice = data["choices"][0]
                finish = choice.get("finish_reason", "unknown")
                content = choice["message"]["content"].strip()
                if finish == "length":
                    print(f"[GLM] WARNING: response truncated (finish_reason=length), got {len(content)} chars, used {choice.get('usage', {}).get('completion_tokens', '?')} tokens")
                return content
        return None

    async def ask_farm_assistant(self, question: str, crop_data: dict = None, enable_search: bool = False, history: list = None) -> str:
        if self.provider == "glm" and self.glm_api_key:
            try:
                # Build conversation messages with history
                messages = [
                    {"role": "system", "content": "你是一个友好、博学的AI农场助手，精通农业种植与气象知识。回答要专业、易懂、有温度。对于不了解的问题，坦诚说明即可。记住对话历史，保持上下文连贯。"}
                ]

                # Include conversation history (last N turns) for context
                if history:
                    for msg in history:
                        role = msg.get("role", "user")
                        text = msg.get("text", "")
                        if text.strip():
                            messages.append({
                                "role": "assistant" if role == "bot" else "user",
                                "content": text
                            })

                # Append current question
                messages.append({"role": "user", "content": question})

                answer = await self._call_glm(messages, temperature=0.7, enable_search=enable_search)
                if answer:
                    return answer
            except Exception as e:
                print(f"GLM API error (assistant): {e}")

        return self._local_answer(question, crop_data)

    def _local_answer(self, question: str, crop_data: dict = None) -> str:
        q = question.lower()
        if "浇水" in q or "water" in q:
            return "💧 建议根据土壤湿度决定：手指插入土面2-3厘米，感觉干燥时就需要浇水了。浇水要浇透，但避免积水哦！"
        if "施肥" in q or "fertilizer" in q:
            return "🌱 生长期可每7-10天施一次稀薄液肥。开花结果期增施磷钾肥，能促进开花结果。注意薄肥勤施，避免肥害。"
        if "叶子" in q and ("黄" in q or "枯" in q):
            return "🍃 叶片发黄可能是浇水过多、养分不足或正常新陈代谢。建议检查土壤湿度，暂停浇水2-3天观察。如大面积发黄，需检查是否有病虫害。"
        if "虫" in q or "病" in q:
            return "🐛 建议先检查叶片背面和茎部是否有虫卵或病斑。预防为主，保持通风透光，必要时可使用生物农药。"
        if "收获" in q or "harvest" in q:
            return "🎉 作物从播种到收获一般需要经历完整的生长周期，耐心照料，静待成熟即可收获！"
        if "天气" in q or "温度" in q or "气候" in q:
            return "🌤️ 当前气象站已接入 Open-Meteo 实时天气数据，您可以在仪表盘查看温度、降水、日照等详细信息。天气变化会影响作物生长，建议密切关注。"
        return "抱歉，AI 服务当前不可用。请检查 GLM_API_KEY 配置是否正确，或稍后再试。"


ai_diary_service = AIDiaryService()
