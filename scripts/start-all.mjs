#!/usr/bin/env node

import { spawn } from 'child_process';
import { createServer } from 'net';
import open from 'open';

const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查端口是否被占用
function checkPort(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// 等待端口就绪
async function waitForPort(port, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (!(await checkPort(port))) {
      return true;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

// 主函数
async function main() {
  log('\n🚀 Stock Trading Agent - 智能启动器\n', 'cyan');
  
  // 检查端口 3000
  const port3000Free = await checkPort(3000);
  if (!port3000Free) {
    log('⚠️  端口 3000 已被占用，请先停止现有服务', 'yellow');
    process.exit(1);
  }
  
  // 步骤 1: 构建项目
  log('📦 步骤 1/4: 正在构建后端项目...', 'blue');
  
  const build = spawn('npm', ['run', 'build'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  });
  
  await new Promise((resolve, reject) => {
    build.on('close', (code) => {
      if (code === 0) {
        log('✅ 构建完成\n', 'green');
        resolve();
      } else {
        reject(new Error(`构建失败，退出码: ${code}`));
      }
    });
  });
  
  // 步骤 2: 启动后端
  log('⚙️  步骤 2/4: 正在启动后端服务...', 'blue');
  
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true
  });
  
  let backendReady = false;
  backend.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(`${colors.blue}[BACKEND]${colors.reset} ${output}`);
    
    if (output.includes('Process completed') || output.includes('Executing automatic')) {
      if (!backendReady) {
        backendReady = true;
        log('✅ 后端服务已就绪\n', 'green');
      }
    }
  });
  
  backend.stderr.on('data', (data) => {
    process.stderr.write(`${colors.blue}[BACKEND]${colors.reset} ${data}`);
  });
  
  // 等待后端启动
  await new Promise(r => setTimeout(r, 3000));
  
  // 步骤 3: 启动前端
  log('🌐 步骤 3/4: 正在启动 Web 前端...', 'green');
  
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: './web',
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });
  
  let frontendReady = false;
  frontend.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(`${colors.green}[FRONTEND]${colors.reset} ${output}`);
    
    if (output.includes('Ready') || output.includes('Local:')) {
      if (!frontendReady) {
        frontendReady = true;
        log('✅ 前端服务已就绪\n', 'green');
      }
    }
  });
  
  frontend.stderr.on('data', (data) => {
    process.stderr.write(`${colors.green}[FRONTEND]${colors.reset} ${data}`);
  });
  
  // 等待前端启动
  const frontendStarted = await waitForPort(3000, 30000);
  if (!frontendStarted) {
    log('❌ 前端启动超时', 'red');
    backend.kill();
    process.exit(1);
  }
  
  await new Promise(r => setTimeout(r, 2000));
  
  // 步骤 4: 打开浏览器
  log('🌍 步骤 4/4: 正在打开浏览器...', 'yellow');
  
  try {
    await open('http://localhost:3000');
    log('✅ 浏览器已打开\n', 'green');
  } catch (error) {
    log('⚠️  无法自动打开浏览器，请手动访问: http://localhost:3000', 'yellow');
  }
  
  // 显示成功信息
  log('\n' + '='.repeat(50), 'cyan');
  log('🎉 Stock Trading Agent 启动成功！', 'cyan');
  log('='.repeat(50) + '\n', 'cyan');
  log('📊 Dashboard: http://localhost:3000', 'cyan');
  log('⚙️  后端服务: 运行中', 'blue');
  log('🌐 Web 前端: http://localhost:3000', 'green');
  log('\n按 Ctrl+C 停止所有服务\n', 'yellow');
  
  // 处理进程退出
  process.on('SIGINT', () => {
    log('\n\n👋 正在关闭服务...', 'yellow');
    backend.kill();
    frontend.kill();
    log('✅ 所有服务已停止\n', 'green');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}

main().catch(error => {
  console.error('❌ 启动失败:', error.message);
  process.exit(1);
});
