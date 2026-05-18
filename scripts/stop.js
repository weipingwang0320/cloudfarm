/**
 * 云上田园 - 一键停止脚本
 * 停止前端和后端服务
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT_DIR = path.join(__dirname, '..');
const PID_FILE = path.join(ROOT_DIR, '.pids.json');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Windows 下杀掉占用端口的进程
function killPortProcess(port) {
  return new Promise((resolve) => {
    if (os.platform() === 'win32') {
      // Windows: 使用 netstat 找到 PID，然后 taskkill
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (stdout) {
          const lines = stdout.split('\n');
          const pids = new Set();

          lines.forEach(line => {
            const match = line.trim().match(/\s+(\d+)\s*$/);
            if (match && match[1] !== '0') {
              pids.add(match[1]);
            }
          });

          if (pids.size > 0) {
            pids.forEach(pid => {
              exec(`taskkill /F /PID ${pid}`, (err) => {
                if (!err) {
                  log(`  ✓ 已停止端口 ${port} 的进程 (PID: ${pid})`, 'green');
                }
              });
            });
          }
        }
        resolve();
      });
    } else {
      // Unix/Linux/Mac: 使用 lsof
      exec(`lsof -ti :${port}`, (error, stdout) => {
        if (stdout) {
          const pids = stdout.trim().split('\n');
          pids.forEach(pid => {
            if (pid) {
              exec(`kill -9 ${pid}`, () => {
                log(`  ✓ 已停止端口 ${port} 的进程 (PID: ${pid})`, 'green');
              });
            }
          });
        }
        resolve();
      });
    }
  });
}

// 从 PID 文件停止进程
async function killFromPidFile() {
  if (fs.existsSync(PID_FILE)) {
    try {
      const pids = JSON.parse(fs.readFileSync(PID_FILE, 'utf-8'));
      log('从 PID 文件停止进程...', 'cyan');

      if (pids.backend) {
        if (os.platform() === 'win32') {
          exec(`taskkill /F /PID ${pids.backend}`, () => {});
        } else {
          exec(`kill -9 ${pids.backend}`, () => {});
        }
      }

      if (pids.frontend) {
        if (os.platform() === 'win32') {
          exec(`taskkill /F /PID ${pids.frontend}`, () => {});
        } else {
          exec(`kill -9 ${pids.frontend}`, () => {});
        }
      }

      fs.unlinkSync(PID_FILE);
    } catch (e) {
      // 忽略错误
    }
  }
}

// 主函数
async function main() {
  console.log('');
  log('╔══════════════════════════════════════════╗', 'cyan');
  log('║         🛑 云上田园 - 停止中...          ║', 'cyan');
  log('╚══════════════════════════════════════════╝', 'cyan');
  console.log('');

  log('正在检查并停止服务...', 'yellow');
  console.log('');

  // 从 PID 文件停止
  await killFromPidFile();

  // 停止端口占用的进程
  log('检查端口 8000 (后端)...', 'cyan');
  await killPortProcess(8000);

  log('检查端口 5173 (前端)...', 'cyan');
  await killPortProcess(5173);

  // 等待一下确保进程被杀死
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('');
  log('═══════════════════════════════════════════', 'cyan');
  log('  ✅ 云上田园已停止', 'green');
  log('═══════════════════════════════════════════', 'cyan');
  console.log('');
}

main().catch((err) => {
  log(`停止失败: ${err.message}`, 'red');
  process.exit(1);
});
