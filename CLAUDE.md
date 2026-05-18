# Cloud Farm - 云上田园

## 项目概述

气象监测与 AI 农事助手系统，前端为 Vue 3 单页应用，后端为 FastAPI，集成智谱 GLM-4.5-air AI 模型用于智能问答。

## 技术栈

- **前端**：Vue 3 + Vite + React Style Components
- **后端**：FastAPI + SQLite (aiosqlite) + httpx
- **AI**：智谱 GLM-4.5-air（`backend/app/modules/ai_diary.py`），通过 `AI_PROVIDER=glm` 启用
- **天气**：Open-Meteo API（免费，无需 Key）

## 目录结构

```
cloud-farm/
├── frontend/           # Vue 3 + Vite 前端
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx     # 首页
│   │   │   └── FarmPage.jsx     # 气象监测站（核心页面）
│   │   ├── components/
│   │   │   ├── WeatherPanel.jsx   # 天气面板
│   │   │   ├── SensorPanel.jsx    # 传感器面板
│   │   │   └── ChatBot.jsx        # AI 农场管家
│   │   └── App.jsx
│   └── vite.config.js
└── backend/            # FastAPI 后端
    ├── app/
    │   ├── main.py              # FastAPI 入口，WebSocket /ws/farm
    │   ├── config.py            # Pydantic Settings 配置
    │   ├── database.py          # SQLite 初始化（保留框架，未使用模型）
    │   ├── api/                 # API 路由（weather/sensor/diary）
    │   ├── models/              # 数据模型（已清空，框架保留）
    │   └── modules/
    │       ├── ai_diary.py      # AI 问答服务（GLM 接入）
    │       ├── weather.py       # Open-Meteo 天气服务
    │       └── sensor.py        # 传感器模拟器
    ├── requirements.txt
    └── .env                     # 环境变量（含 GLM_API_KEY）
```

## 关键配置

- **后端端口**：8000（`uvicorn app.main:app`）
- **前端代理**：`/api` → `http://localhost:8000/api`（Vite proxy）
- **AI 模型**：GLM-4.5-air（智谱），Fallback 为本地模板
- **天气 API**：Open-Meteo `https://api.open-meteo.com/v1`
- **默认位置**：纬度 30.5728，经度 104.0668（成都）

## 主要功能流程

1. 用户进入 HomePage 了解系统功能
2. 在 FarmPage（气象监测站）查看实时天气、未来预报、环境传感器数据
3. 点击 AI 助手按钮，通过 ChatBot 向智谱 GLM 提问农事相关问题
4. Weather 面板每 60 秒自动更新，Sensor 面板每 5 分钟自动更新

## 环境变量（backend/.env）

```
APP_NAME=云上田园 - Cloud Farm
DATABASE_URL=sqlite+aiosqlite:///./cloud_farm.db
AI_PROVIDER=glm               # 空=本地模板，glm=智谱AI
GLM_API_KEY=<your-key>
GLM_MODEL=glm-4.5-air
WEATHER_API_BASE=https://api.open-meteo.com/v1
DEFAULT_LATITUDE=30.5728
DEFAULT_LONGITUDE=104.0668
SENSOR_UPDATE_INTERVAL=5
```

## 常用命令

```bash
# 后端启动
cd backend
uvicorn app.main:app --reload --port 8000

# 前端启动
cd frontend
npm run dev

# 安装依赖
cd backend && pip install -r requirements.txt
cd frontend && npm install
```

## API 端点

- `GET /api/health` - 健康检查
- `GET /api/dashboard` - 首页聚合数据（天气 + 传感器）
- `GET /api/weather/current` - 当前天气
- `GET /api/weather/forecast?days=N` - 天气预报
- `GET /api/sensors/current` - 当前传感器数据
- `GET /api/sensors/batch?count=N` - 批量传感器数据
- `POST /api/diary/ask` - AI 农事助手问答
- `WebSocket /ws/farm` - 实时天气/传感器推送
