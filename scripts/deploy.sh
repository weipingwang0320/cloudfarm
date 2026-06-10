#!/bin/bash
set -e

# ============================================================
# Cloud Farm 一键部署脚本（适用于腾讯云 CVM Ubuntu 22.04/24.04）
# 用法: chmod +x scripts/deploy.sh && sudo bash scripts/deploy.sh
# ============================================================

# ---- 配置（按需修改）----
GIT_REPO="你的GitHub仓库地址"   # 例如: https://github.com/yourname/cloud-farm.git
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

# ---- 1. 系统更新 & 安装依赖 ----
log "更新系统包..."
apt update && apt upgrade -y

log "安装 Python、Node.js、Nginx、Git..."
apt install -y python3 python3-pip python3-venv nodejs npm nginx git

log "检查 Node.js 版本..."
node -v
npm -v

# ---- 2. 克隆项目 ----
log "克隆项目到 /opt/cloud-farm..."
if [ -d "/opt/cloud-farm" ]; then
    warn "/opt/cloud-farm 已存在，跳过克隆"
else
    cd /opt
    git clone -b "$BRANCH" "$GIT_REPO" cloud-farm
fi

cd /opt/cloud-farm

# ---- 3. 配置后端环境变量 ----
log "配置后端环境变量..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    warn "请编辑 backend/.env 填写你的 GLM_API_KEY"
    warn "编辑完成后继续运行: sudo bash scripts/deploy.sh"
    # 继续执行，用户稍后自行填写 key
fi

# ---- 4. 后端 Python 虚拟环境 & 依赖 ----
log "创建 Python 虚拟环境..."
cd backend
python3 -m venv venv
source venv/bin/activate

log "安装 Python 依赖..."
pip install -r requirements.txt
cd ..

# ---- 5. 构建前端 ----
log "构建前端..."
cd frontend
npm install
npm run build
cd ..

# ---- 6. 部署静态文件 ----
log "部署前端静态文件到 /var/www/cloud-farm..."
rm -rf /var/www/cloud-farm
mkdir -p /var/www/cloud-farm
cp -r frontend/dist/* /var/www/cloud-farm/

# ---- 7. 配置 Nginx ----
log "配置 Nginx..."
cp scripts/cloud-farm.conf /etc/nginx/sites-available/cloud-farm
ln -sf /etc/nginx/sites-available/cloud-farm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# ---- 8. 配置 systemd 服务 ----
log "配置 systemd 服务..."
cp scripts/cloud-farm.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable cloud-farm
systemctl restart cloud-farm

# ---- 9. 用户提醒 ----
log "部署完成！"
echo ""
echo "============================================="
echo "   Cloud Farm 部署成功！"
echo "============================================="
echo ""
echo "  访问地址: http://$(curl -s ifconfig.me)"
echo ""

if [ ! -f "backend/.env" ] || ! grep -q "GLM_API_KEY" backend/.env 2>/dev/null; then
    warn "  请编辑 backend/.env 填写 GLM_API_KEY"
    warn "  然后执行: sudo systemctl restart cloud-farm"
fi

echo ""
echo "  查看后端日志: sudo journalctl -u cloud-farm -f"
echo "  重启后端:     sudo systemctl restart cloud-farm"
echo "  重启 Nginx:   sudo systemctl restart nginx"
echo "============================================="
