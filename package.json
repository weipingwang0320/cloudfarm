{
  "name": "cloud-farm",
  "version": "1.0.0",
  "description": "云上田园 - 气象驱动型元宇宙认养农场系统",
  "private": true,
  "scripts": {
    "start": "node scripts/start.js",
    "stop": "node scripts/stop.js",
    "dev": "concurrently -n \"后端,前端\" -c \"blue,green\" \"npm run backend\" \"npm run frontend\"",
    "backend": "cd backend && python -m uvicorn app.main:app --reload --port 8000",
    "frontend": "cd frontend && npm run dev",
    "install:all": "npm run install:backend && npm run install:frontend",
    "install:backend": "cd backend && pip install -r requirements.txt",
    "install:frontend": "cd frontend && npm install"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "tree-kill": "^1.2.2"
  }
}
