/**
 * 云上田园 - 一键启动脚本
 * 同时启动前端和后端服务
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT_DIR = path.join(__dirname, '..');
const PID_FILE = path.join(ROOT_DIR, '.pids.json');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBanner() {
  console.log('');
  log('╔══════════════════════════════════════════╗', 'cyan');
  log('║         🌱 云上田园 - 启动中...          ║', 'cyan');
  log('╚══════════════════════════════════════════╝', 'cyan');
  console.log('');
}

// 检查端口是否被占用
function checkPort(port) {
  return new Promise((resolve) => {
    const command = os.platform() === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port}`;

    exec(command, (error, stdout) => {
      resolve(stdout.length > 0);
    });
  });
}

// 启动后端服务
async function startBackend() {
  log('正在启动后端服务...', 'blue');

  const backendDir = path.join(ROOT_DIR, 'backend');
  const isWindows = os.platform() === 'win32';

  const backend = spawn(
    isWindows ? 'python' : 'python3',
    ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000'],
    {
      cwd: backendDir,
      shell: isWindows,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  backend.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Uvicorn running')) {
      log('✓ 后端服务启动成功: http://localhost:8000', 'green');
    } else if (output.includes('ERROR') || output.includes('error')) {
      log(`后端: ${output.trim()}`, 'yellow');
    }
  });

  backend.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Uvicorn running')) {
      log('✓ 后端服务启动成功: http://localhost:8000', 'green');
    }
  });

  return backend;
}

// 启动前端服务
async function startFrontend() {
  log('正在启动前端服务...', 'blue');

  const frontendDir = path.join(ROOT_DIR, 'frontend');
  const isWindows = os.platform() === 'win32';

  const frontend = spawn(
    isWindows ? 'npm.cmd' : 'npm',
    ['run', 'dev'],
    {
      cwd: frontendDir,
      shell: isWindows,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  frontend.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:') || output.includes('localhost')) {
      const match = output.match(/http:\/\/localhost:\d+/);
      if (match) {
        log(`✓ 前端服务启动成功: ${match[0]}`, 'green');
      }
    }
  });

  frontend.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:') || output.includes('localhost')) {
      const match = output.match(/http:\/\/localhost:\d+/);
      if (match) {
        log(`✓ 前端服务启动成功: ${match[0]}`, 'green');
      }
    }
  });

  return frontend;
}

// 保存进程 ID
function savePids(backendPid, frontendPid) {
  const pids = {
    backend: backendPid,
    frontend: frontendPid,
    startTime: new Date().toISOString(),
  };
  fs.writeFileSync(PID_FILE, JSON.stringify(pids, null, 2));
}

// 主函数
async function main() {
  logBanner();

  // 检查端口占用
  const backendPortUsed = await checkPort(8000);
  const frontendPortUsed = await checkPort(5173);

  if (backendPortUsed) {
    log('⚠ 端口 8000 已被占用，后端可能已在运行', 'yellow');
  }

  if (frontendPortUsed) {
    log('⚠ 端口 5173 已被占用，前端可能已在运行', 'yellow');
  }

  // 启动服务
  const backend = await startBackend();
  const frontend = await startFrontend();

  // 保存 PID
  savePids(backend.pid, frontend.pid);

  // 等待服务启动
  setTimeout(() => {
    console.log('');
    log('═══════════════════════════════════════════', 'cyan');
    log('  🎉 云上田园启动完成！', 'bright');
    log('═══════════════════════════════════════════', 'cyan');
    console.log('');
    log('  前端地址: http://localhost:5173', 'green');
    log('  后端地址: http://localhost:8000', 'green');
    log('  API文档:  http://localhost:8000/docs', 'green');
    console.log('');
    log('  按 Ctrl+C 停止所有服务', 'yellow');
    log('  或运行: npm run stop', 'yellow');
    console.log('');
  }, 3000);

  // 监听退出信号
  process.on('SIGINT', () => {
    console.log('');
    log('正在停止服务...', 'yellow');
    backend.kill();
    frontend.kill();
    if (fs.existsSync(PID_FILE)) {
      fs.unlinkSync(PID_FILE);
    }
    log('✓ 服务已停止', 'green');
    process.exit(0);
  });

  // 保持进程运行
  process.stdin.resume();
}

main().catch((err) => {
  log(`启动失败: ${err.message}`, 'red');
  process.exit(1);
});
