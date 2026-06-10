#!/bin/bash
set -e

# ============================================================
# Cloud Farm 一键部署脚本（兼容 Ubuntu / CentOS / TencentOS）
# ============================================================

GIT_REPO="https://github.com/weipingwang0320/cloudfarm.git"
BRANCH="main"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }

if [ "$EUID" -ne 0 ]; then
    err "请使用 root 运行"
    exit 1
fi

# ---- Detect OS & set package manager ----
if command -v apt &> /dev/null; then
    PKG="apt"
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    NGINX_ENABLE_DIR="/etc/nginx/sites-enabled"
    NODE_SETUP_URL="https://deb.nodesource.com/setup_22.x"
elif command -v dnf &> /dev/null; then
    PKG="dnf"
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_ENABLE_DIR="$NGINX_CONF_DIR"  # same dir on CentOS
    NODE_SETUP_URL="https://rpm.nodesource.com/setup_22.x"
elif command -v yum &> /dev/null; then
    PKG="yum"
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_ENABLE_DIR="$NGINX_CONF_DIR"
    NODE_SETUP_URL="https://rpm.nodesource.com/setup_22.x"
else
    err "未检测到 apt/dnf/yum，无法继续"
    exit 1
fi
log "检测到包管理器: $PKG"

# ---- 1. 安装基础依赖（跳过已有的） ----
log "安装 Python、Nginx、Git（如未安装）..."
if [ "$PKG" = "apt" ]; then
    apt update -y && apt install -y python3 python3-pip python3-venv nginx git curl
else
    $PKG install -y python3 python3-pip python3-virtualenv nginx git curl 2>/dev/null || \
    $PKG install -y python3 python3-pip python3-venv nginx git curl 2>/dev/null || \
    $PKG install -y python3 python3-pip nginx git curl || true
fi

# ---- 2. 安装 Node.js 22 ----
log "安装/更新 Node.js 22..."
NEED_NODE=false
if ! command -v node &> /dev/null; then
    NEED_NODE=true
elif [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt 18 ]; then
    NEED_NODE=true
fi
if $NEED_NODE; then
    curl -fsSL "$NODE_SETUP_URL" | bash -
    if [ "$PKG" = "apt" ]; then
        apt install -y nodejs
    else
        $PKG install -y nodejs
    fi
fi
log "Node.js $(node -v), npm $(npm -v)"

# ---- 3. 确保项目在 /opt/cloud-farm ----
if [ ! -d "/opt/cloud-farm" ]; then
    cd /opt
    git clone -b "$BRANCH" "$GIT_REPO" cloud-farm
else
    log "项目已存在，跳过克隆"
fi
cd /opt/cloud-farm

# ---- 4. 后端环境变量（首次部署时） ----
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    warn "============================================="
    warn "  请编辑 backend/.env 填写 GLM_API_KEY"
    warn "  nano /opt/cloud-farm/backend/.env"
    warn "  填好后按 Enter 继续..."
    warn "============================================="
    read -r -p ""
fi

# ---- 5. 后端 Python 虚拟环境 ----
log "设置 Python 虚拟环境..."
cd /opt/cloud-farm/backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt

# ---- 6. 构建前端 ----
log "构建前端（生产模式）..."
cd /opt/cloud-farm/frontend
npm install
npm run build
log "前端构建完成"

# ---- 7. 部署静态文件 ----
log "部署静态文件..."
rm -rf /var/www/cloud-farm
mkdir -p /var/www/cloud-farm
cp -r dist/* /var/www/cloud-farm/

# ---- 8. 配置 Nginx ----
log "配置 Nginx..."
cd /opt/cloud-farm
if [ "$PKG" = "apt" ]; then
    # Ubuntu/Debian style
    mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
    cp scripts/cloud-farm.conf /etc/nginx/sites-available/cloud-farm
    ln -sf /etc/nginx/sites-available/cloud-farm /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
else
    # CentOS/TencentOS style
    cp scripts/cloud-farm.conf /etc/nginx/conf.d/cloud-farm.conf
fi
nginx -t && systemctl restart nginx
log "Nginx 已重启"

# ---- 9. 配置 systemd ----
log "配置 systemd 服务..."
cp scripts/cloud-farm.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable cloud-farm
systemctl restart cloud-farm

# ---- 10. 完成 ----
sleep 2
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "你的服务器IP")

log "部署完成！"
echo ""
echo "============================================="
echo "   ☁️  云上田园 · Cloud Farm"
echo "============================================="
echo "  http://$SERVER_IP"
echo ""

if curl -s "http://127.0.0.1:8000/api/health" > /dev/null 2>&1; then
    log "后端 ✓"
else
    warn "后端启动中，查看: journalctl -u cloud-farm -f"
fi

echo ""
echo "  或直接访问: http://$SERVER_IP"
echo "============================================="
