#!/bin/bash
set -e

# ============================================================
# Cloud Farm 一键部署脚本（适用于腾讯云 CVM Ubuntu 22.04/24.04）
# 用法: 在服务器上运行
#   git clone https://github.com/weipingwang0320/cloudfarm.git
#   cd cloud-farm
#   chmod +x scripts/deploy.sh
#   sudo bash scripts/deploy.sh
# ============================================================

# ---- 配置（按需修改）----
GIT_REPO="https://github.com/weipingwang0320/cloudfarm.git"
BRANCH="main"
DOMAIN=""                      # 你的域名（留空用 IP 访问）

# ---- 颜色输出 ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }

# ---- 检查 root 权限 ----
if [ "$EUID" -ne 0 ]; then
    err "请使用 sudo 运行: sudo bash scripts/deploy.sh"
    exit 1
fi

# ---- 1. 系统更新 & 安装基础依赖 ----
log "更新系统包..."
apt update && apt upgrade -y

log "安装 Python、Nginx、Git..."
apt install -y python3 python3-pip python3-venv nginx git curl

# ---- 2. 安装 Node.js 22（Ubuntu apt 自带版本太旧，Vite 需要 >=18） ----
log "安装 Node.js 22（从 NodeSource）..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt 18 ]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
fi
log "Node.js $(node -v), npm $(npm -v)"

# ---- 3. 克隆/更新项目 ----
log "获取项目代码..."
if [ ! -d "/opt/cloud-farm" ]; then
    cd /opt
    git clone -b "$BRANCH" "$GIT_REPO" cloud-farm
else
    cd /opt/cloud-farm
    git pull origin "$BRANCH"
    log "项目已存在，已拉取最新代码"
fi

cd /opt/cloud-farm

# ---- 4. 配置后端环境变量 ----
log "配置后端环境变量..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo ""
    warn "============================================="
    warn "  请现在编辑 backend/.env 填写 GLM_API_KEY"
    warn "  打开新终端执行: sudo nano backend/.env"
    warn "  填好 Key 后按 Enter 继续..."
    warn "============================================="
    read -r -p ""
fi

# ---- 5. 后端 Python 虚拟环境 & 依赖 ----
log "创建 Python 虚拟环境..."
cd backend
python3 -m venv venv
source venv/bin/activate

log "安装 Python 依赖..."
pip install -r requirements.txt
cd ..

# ---- 6. 构建前端（生产模式） ----
log "构建前端（生产模式）..."
cd frontend
npm install
npm run build
cd ..

log "前端构建产物:"
ls -lh frontend/dist/ | head -5

# ---- 7. 部署静态文件 ----
log "部署前端静态文件到 /var/www/cloud-farm..."
rm -rf /var/www/cloud-farm
mkdir -p /var/www/cloud-farm
cp -r frontend/dist/* /var/www/cloud-farm/
log "静态文件已就位: $(ls /var/www/cloud-farm | wc -l) 个文件"

# ---- 8. 配置 Nginx ----
log "配置 Nginx..."
cp scripts/cloud-farm.conf /etc/nginx/sites-available/cloud-farm
ln -sf /etc/nginx/sites-available/cloud-farm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
log "Nginx 已启动"

# ---- 9. 配置 systemd 服务 ----
log "配置 systemd 服务..."
cp scripts/cloud-farm.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable cloud-farm
systemctl restart cloud-farm

# ---- 10. 完成 ----
sleep 2  # 等后端启动

SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "你的服务器IP")

log "部署完成！"
echo ""
echo "============================================="
echo "   ☁️  云上田园 · Cloud Farm"
echo "   部署成功！"
echo "============================================="
echo ""
echo "  前端 + API:  http://$SERVER_IP"
echo "  后端健康检查: http://$SERVER_IP/api/health"
echo ""

# 检查后端是否启动成功
if curl -s "http://127.0.0.1:8000/api/health" > /dev/null 2>&1; then
    log "后端服务正常运行 ✓"
else
    warn "后端可能尚未启动，请检查日志:"
    echo "  sudo journalctl -u cloud-farm -f"
fi

echo ""
echo "  常用命令:"
echo "  查看后端日志: sudo journalctl -u cloud-farm -f"
echo "  重启后端:     sudo systemctl restart cloud-farm"
echo "  重启 Nginx:   sudo systemctl restart nginx"
echo "  更新部署:     cd /opt/cloud-farm && git pull && sudo bash scripts/deploy.sh"
echo "============================================="

# ---- 提醒：Turnstile 密钥 ----
echo ""
warn "============================================="
warn "  提醒：如需启用 Cloudflare Turnstile 人机验证："
warn "  1. 访问 https://dash.cloudflare.com/ → Turnstile"
warn "  2. 添加站点，获取 sitekey"
warn "  3. 编辑 frontend/src/pages/AIAssistantPage.jsx 顶部"
warn "     替换 TURNSTILE_SITEKEY 为你的真实密钥"
warn "  4. 重新构建: cd /opt/cloud-farm && sudo bash scripts/deploy.sh"
warn "============================================="
