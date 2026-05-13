from typing import Optional

import httpx
from app.config import settings


DIARY_STYLE_PROMPTS = {
    "cute": "请用可爱、活泼、拟人化的语气，以作物第一人称视角写一篇60-100字的生长日记。加入一些可爱的颜文字和语气词。",
    "literary": "请用文艺、优美的散文风格，以作物第一人称视角写一篇60-100字的生长日记。运用一些诗意的比喻。",
    "humorous": "请用幽默、风趣的口吻，以作物第一人称视角写一篇60-100字的生长日记。加入一些好笑的吐槽。",
}


DIARY_TEMPLATES = {
    "cute": {
        0: "今天是我被种进土里的第一天！好黑呀～不过周围的土壤软软的，好舒服(*≧▽≦) 听说上面有暖暖的阳光，好期待快点发芽去看看！{weather_msg}",
        1: "哇！！！我终于钻出泥土啦！外面的世界好亮好漂亮(｡♥‿♥｡) 小嫩芽还有点害羞，但是看到阳光好开心～{weather_msg}",
        2: "今天长出了第二片小叶子！虽然个子还小小的，但每天都在努力长大哦💪 {weather_msg} 主人要记得来看我呀～",
        3: "最近长得飞快，叶子越来越大了！我感觉自己一天比一天强壮(๑•̀ㅂ•́)و✧ {weather_msg}",
        4: "开花啦开花啦！！好漂亮的小花花～淡淡的香味飘出来，连路过的小蝴蝶都停下来看我呢🦋 {weather_msg}",
        5: "结出了小小的果实！绿绿的、硬硬的，虽然还不能吃，但看着自己孕育的小果实好有成就感🥰 {weather_msg}",
        6: "终于成熟啦！我已经是一株了不起的大作物了！感谢主人一直以来的照顾，能遇见你真的太好啦！请把我收获走吧(´▽`ʃ♡ƪ) {weather_msg}",
    },
    "literary": {
        0: "我沉睡在泥土的黑暗中，四周是静谧而温润的黑暗。听闻春意在头顶流转，我便安心等待属于我的那一刻。{weather_msg}",
        1: "破土而出的瞬间，光如潮水般涌来。世界在我眼前徐徐展开，天很高，风很轻，日子还很长。{weather_msg}",
        2: "嫩叶初展，如婴儿的手指般稚嫩。我在晨露中苏醒，在暮色里安眠，每一寸成长都是对光明的礼赞。{weather_msg}",
        3: "枝繁叶茂，是我对这片土地最深情的回应。风过时，叶片沙沙作响，仿佛在吟唱着生长的诗篇。{weather_msg}",
        4: "第一朵花悄然绽放，如雪般洁白，如霞般绚烂。这是生命最美的姿态，也是我对这世界最温柔的告白。{weather_msg}",
        5: "果实初结，青涩而饱满。每一颗都是时光的馈赠，凝聚了无数个日升月落的期盼。等待成熟，如同等待一场盛大的仪式。{weather_msg}",
        6: "历经四季更迭，终得圆满。果实丰盈，色泽动人，这是我用整个生命写就的诗。感谢你，亲爱的守护者。{weather_msg}",
    },
    "humorous": {
        0: '被埋了。对，就是被埋了。他们说这叫"播种"，我觉得跟坐小黑屋没啥区别。算了，先睡一觉再说。{weather_msg}',
        1: '破案了！上面不是小黑屋，是个豪华大别墅！阳光浴、新鲜空气，这待遇可以啊。争取多活几天！{weather_msg}',
        2: '作为一棵幼苗，我的日常就是：晒太阳、喝水、长个子。听起来无聊？但这是我的事业！你们人类不也天天对着电脑吗？{weather_msg}',
        3: '最近长势喜人，我觉得我可以去参加选秀了——"农场好声音"那种。不是吹的，我这叶子抖起来比你们人类扭腰好看多了。{weather_msg}',
        4: '开花了！我这该死的魅力啊，连蜜蜂都围着转。柠檬精们别酸，这是实力。{weather_msg}',
        5: '挂果了！虽然现在还是绿疙瘩，但等我红了你们都得跪。番茄炒蛋了解一下？{weather_msg}',
        6: '终于成熟了！再不来摘我就要变成番茄酱了！感谢主人不杀之恩...不对，是不摘之恩！快来收获吧！{weather_msg}',
    },
}


WEEKLY_TEMPLATES = [
    "这周是我来到这个世界的第{week_num}周！{weather_summary} 这一周里，我努力地扎根、生长，感觉身体里充满了力量！{health_msg} 期待下一周能长得更高！",
    "时间过得真快，已经是第{week_num}周啦！{weather_summary} 这周我长高了不少，叶子也变得更绿更茂盛了。{health_msg} 每天都能感受到阳光和雨露的滋养，好幸福～",
    "第{week_num}周的总结时间！{weather_summary} 这周经历了一些小挑战，但我都挺过来啦！{health_msg} 感觉自己越来越坚强了，继续加油！",
    "又过了一周，现在是第{week_num}周了。{weather_summary} 这周我学会了更好地适应环境，根系也扎得更深了。{health_msg} 成长的过程虽然缓慢，但每一步都算数！",
    "哈喽！第{week_num}周的我准时来报到！{weather_summary} 这周最大的变化就是——我又变强壮了！{health_msg} 感谢主人的悉心照料，我会努力回报你的！",
    "一周又过去了，现在是第{week_num}周。{weather_summary} 回顾这一周，有阳光灿烂的日子，也有风雨交加的时刻，但这些都是成长的养分。{health_msg} 期待下一周的蜕变！",
    "第{week_num}周啦！时间过得好快呀！{weather_summary} 这周我认识了很多新朋友——小虫子、蝴蝶，还有隔壁地块的邻居们。{health_msg} 农场生活真是丰富多彩！",
    "又到了写周记的时间，第{week_num}周了。{weather_summary} 这周我更加努力地吸收养分，希望能快快长大。{health_msg} 每一滴雨露都让我离梦想更近一步！",
]


GLM_API_BASE = "https://open.bigmodel.cn/api/paas/v4"


class AIDiaryService:
    def __init__(self):
        self.provider = settings.AI_PROVIDER.lower()
        self.glm_api_key = settings.GLM_API_KEY
        self.glm_model = settings.GLM_MODEL

    async def _call_glm(self, messages: list, max_tokens: int = 200, temperature: float = 0.8) -> Optional[str]:
        url = f"{GLM_API_BASE}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.glm_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.glm_model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            if "choices" in data and len(data["choices"]) > 0:
                return data["choices"][0]["message"]["content"].strip()
        return None

    async def generate_diary(
        self,
        stage: int,
        stage_name: str,
        weather_summary: str,
        health_score: float,
        day_number: int,
        style: str = "cute",
        crop_type: str = "tomato",
        temp_max: float = None,
        temp_min: float = None,
    ) -> str:
        crop_names = {"tomato": "番茄", "wheat": "小麦", "strawberry": "草莓", "rice": "水稻", "corn": "玉米"}
        crop_name = crop_names.get(crop_type, "作物")

        weather_msg = f"今天白天{temp_max or '?'}℃，夜间{temp_min or '?'}℃。"
        weather_msg += f"健康值{health_score}分。"

        templates = DIARY_TEMPLATES.get(style, DIARY_TEMPLATES["cute"])
        stage_templates = templates.get(stage, templates.get(0))
        diary_text = stage_templates.format(weather_msg=weather_msg)

        if self.provider == "glm" and self.glm_api_key:
            try:
                style_prompt = DIARY_STYLE_PROMPTS.get(style, DIARY_STYLE_PROMPTS["cute"])
                messages = [
                    {"role": "system", "content": "你是一株会说话的农作物，请以第一人称视角记录生长日记。日记要简短、生动、有情感。"},
                    {"role": "user", "content": f"""你是一株{crop_name}。今天是你的第{day_number}天，正处于{stage_name}阶段。
今日天气：{weather_summary}
温度：最高{temp_max}℃，最低{temp_min}℃
健康值：{health_score}/100

{style_prompt}

请直接输出日记内容（60-100字），不要添加额外说明。"""}
                ]
                ai_text = await self._call_glm(messages, max_tokens=200, temperature=0.8)
                if ai_text:
                    return ai_text
            except Exception as e:
                print(f"GLM API error (diary): {e}")

        return diary_text

    async def generate_weekly_diary(
        self,
        week_num: int,
        stage: int,
        stage_name: str,
        weather_summary: str,
        health_score: float,
        day_number: int,
        style: str = "cute",
        crop_type: str = "tomato",
        temp_max: float = None,
        temp_min: float = None,
        week_avg_temp: float = None,
        week_rain_days: int = 0,
        week_sunny_days: int = 0,
    ) -> str:
        crop_names = {"tomato": "番茄", "wheat": "小麦", "strawberry": "草莓", "rice": "水稻", "corn": "玉米"}
        crop_name = crop_names.get(crop_type, "作物")

        if health_score >= 80:
            health_msg = "这周我身体棒棒的，吃得好睡得香！"
        elif health_score >= 50:
            health_msg = "这周身体状态还行，但感觉有点小疲惫，需要更多关爱～"
        else:
            health_msg = "这周有点不舒服，希望主人多来看看我！"

        weather_desc = f"这周平均气温{week_avg_temp or temp_max or '?'}℃，{week_sunny_days}天晴天，{week_rain_days}天降雨。"
        template_idx = (week_num - 1) % len(WEEKLY_TEMPLATES)
        diary_text = WEEKLY_TEMPLATES[template_idx].format(
            week_num=week_num,
            weather_summary=weather_desc,
            health_msg=health_msg,
        )

        if self.provider == "glm" and self.glm_api_key:
            try:
                style_prompt = DIARY_STYLE_PROMPTS.get(style, DIARY_STYLE_PROMPTS["cute"])
                messages = [
                    {"role": "system", "content": "你是一株会说话的农作物，请以第一人称视角写一篇周记。周记要简短、生动、有情感，总结这一周的生长经历。"},
                    {"role": "user", "content": f"""你是一株{crop_name}。这是你来到这个世界的第{week_num}周（第{day_number}天），正处于{stage_name}阶段。

本周天气概况：{weather_summary}
本周平均气温：{week_avg_temp or temp_max or '?'}℃
本周晴天：{week_sunny_days}天，降雨：{week_rain_days}天
当前健康值：{health_score}/100

{style_prompt}

请直接输出周记内容（80-120字），不要添加额外说明。"""}
                ]
                ai_text = await self._call_glm(messages, max_tokens=300, temperature=0.85)
                if ai_text:
                    return ai_text
            except Exception as e:
                print(f"GLM API error (weekly): {e}")

        return diary_text

    async def ask_farm_assistant(self, question: str, crop_data: dict, knowledge_base: str = None) -> str:
        if self.provider == "glm" and self.glm_api_key:
            try:
                context = f"""作物类型：{crop_data.get('crop_type', '未知')}
生长阶段：{crop_data.get('stage_name', '未知')}
健康值：{crop_data.get('health_score', 0)}/100
当前高度：{crop_data.get('height', 0)}cm
"""
                messages = [
                    {"role": "system", "content": "你是一位专业的农业种植专家，擅长解答作物种植相关问题。回答要专业、易懂、有温度。"},
                    {"role": "user", "content": f"""用户正在询问关于他/她认养的作物的问题。

作物当前状态：
{context}

用户问题：{question}

请给出专业、易懂的建议。"""}
                ]
                answer = await self._call_glm(messages, max_tokens=300, temperature=0.7)
                if answer:
                    return answer
            except Exception as e:
                print(f"GLM API error (assistant): {e}")

        return self._local_answer(question, crop_data)

    def _local_answer(self, question: str, crop_data: dict) -> str:
        q = question.lower()
        if "浇水" in q or "water" in q:
            return "💧 建议根据土壤湿度决定：手指插入土面2-3厘米，感觉干燥时就需要浇水了。浇水要浇透，但避免积水哦！"
        if "施肥" in q or "fertilizer" in q:
            return "🌱 生长期可每7-10天施一次稀薄液肥。开花结果期增施磷钾肥，能促进开花结果。注意薄肥勤施，避免肥害。"
        if "叶子" in q and ("黄" in q or "枯" in q):
            if crop_data.get("health_score", 100) < 50:
                return "🍂 叶片发黄可能与浇水过多（根部缺氧）或养分不足有关。建议检查土壤湿度，暂停浇水2-3天，观察是否改善。"
            return "🍃 少量底部叶片变黄是正常新陈代谢，摘除即可。如果大面积发黄，可能需要检查是否有病虫害。"
        if "虫" in q or "病" in q:
            return "🐛 建议先检查叶片背面和茎部是否有虫卵或病斑。预防为主，保持通风透光，必要时可使用生物农药。"
        if "收获" in q or "harvest" in q:
            stage = crop_data.get("stage", 0)
            if stage >= 6:
                return '🎉 作物已经成熟，可以收获啦！请前往农场点击"收获"按钮，系统将为您生成电子收获证书！'
            stage_name = crop_data.get("stage_name", "生长中")
            return f"📅 当前处于{stage_name}阶段，还需要耐心等待哦！作物成熟后会有通知。"
        return "🤖 感谢您的提问！建议您观察作物的具体情况，也可以拍下照片对照农事指南。如有紧急问题，建议咨询当地农业技术员。"


ai_diary_service = AIDiaryService()