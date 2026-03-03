# 🚀 Stock Trading Agent - 快速启动指南

## 一键启动（推荐）

```bash
npm run start:all
```

这将自动执行以下操作：
1. ✅ 构建后端项目 (`npm run build`)
2. ✅ 启动后端服务 (`npm run dev`)
3. ✅ 启动 Web 前端 (`npm run dev` in web/)
4. ✅ 自动打开浏览器 (http://localhost:3000)

---

## 📋 功能特性

### 智能启动器特性

- **自动构建** - 每次启动前自动构建 TypeScript 项目
- **端口检测** - 自动检测端口占用，防止冲突
- **顺序启动** - 先启动后端，再启动前端，确保依赖就绪
- **自动打开浏览器** - 服务就绪后自动打开 Dashboard
- **彩色输出** - 后端(蓝色)和前端(绿色)输出颜色区分
- **优雅退出** - Ctrl+C 一次停止所有服务

---

## 🖥️ 界面介绍

### Dashboard 首页 (http://localhost:3000)

```
┌─────────────────────────────────────────────────────────────┐
│  🚀 Stock Trading Agent                    [运行决策] [配置]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│  │ 待审批交易  │ │   总交易数  │ │    胜率     │ │平均收益 ││
│  │     0       │ │     0       │ │    --       │ │   --    ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
│                                                               │
│  ┌───────────────────────────────────┐  ┌─────────────────┐ │
│  │         近期交易提议               │  │    快速操作     │ │
│  │                                   │  ├─────────────────┤ │
│  │  暂无交易提议                     │  │ 🎮 发起新交易   │ │
│  │                                   │  │ ⚠️  审批交易 (0)│ │
│  │                                   │  │ 🧠 运行反思分析 │ │
│  └───────────────────────────────────┘  └─────────────────┘ │
│                                         ┌─────────────────┐ │
│                                         │   当前配置      │ │
│                                         │ 风险承受度: 45% │ │
│                                         │ 策略风格: VALUE │ │
│                                         │ 持仓周期: 20天  │ │
│                                         └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 基本操作流程

### 1. 发起交易决策

**方式一：Web 界面（开发中）**
点击 Dashboard 上的「运行决策」按钮

**方式二：CLI**
```bash
# 在另一个终端中
npm start [股票代码]      # 例如: npm start AAPL
# 或
npm start                 # 自动选择股票
```

### 2. 审批高风险交易

如果交易风险等级 ≥ 3，需要审批：

**Web 界面查看：**
- Dashboard 显示「待审批交易」数量
- 点击数字查看详情

**CLI 审批：**
```bash
# 查看待审批
npm run check-approvals

# 审批指定交易
npm run approve <proposal-id>

# 批量执行已审批
npm run process-approved
```

### 3. 查看结果

- **Web**: 访问 http://localhost:3000 查看 Dashboard
- **CLI**: 查看 `memory/outcomes/` 目录

### 4. 运行反思分析

点击 Dashboard 上的「运行反思分析」或：
```bash
# 开发中
```

---

## 🛠️ 常用命令

```bash
# 一键启动所有服务
npm run start:all

# 单独启动后端
npm run dev

# 单独启动前端
cd web && npm run dev

# 查看待审批
npm run check-approvals

# 审批交易
npm run approve <proposal-id>

# 执行已审批
npm run process-approved

# 构建项目
npm run build

# 运行测试
npm test
```

---

## 🌐 访问地址

| 服务 | URL | 说明 |
|------|-----|------|
| Web Dashboard | http://localhost:3000 | 主界面 |
| API | http://localhost:3000/api/* | REST API |

---

## ⚠️ 注意事项

1. **端口占用** - 确保 3000 端口未被其他程序占用
2. **Node 版本** - 建议使用 Node.js 18+
3. **首次运行** - 确保已运行 `npm install` 安装依赖
4. **数据目录** - 确保 `memory/` 目录有读写权限

---

## 🛑 停止服务

按 `Ctrl+C` 一次即可停止所有服务（前后端同时关闭）

---

## 📊 项目结构

```
stock-agent/
├── src/                    # 后端源码
│   ├── agents/            # 代理实现
│   ├── cli/               # CLI 命令
│   ├── domain/            # 领域模型
│   └── ...
├── web/                   # Web 前端 (Next.js)
│   ├── app/               # 页面路由
│   ├── components/        # 组件
│   └── lib/               # 工具库
├── memory/                # 数据存储
├── scripts/               # 启动脚本
│   └── start-all.mjs     # 智能启动器
└── package.json
```

---

## 🆘 故障排除

### 问题：端口 3000 被占用
```bash
# 查找占用进程
lsof -i :3000

# 停止进程
kill -9 <PID>

# 或使用脚本自动检测
npm run start:all  # 会自动提示
```

### 问题：构建失败
```bash
# 清理并重新构建
rm -rf dist
npm run build
```

### 问题：Web 无法读取数据
```bash
# 确保 memory/ 目录存在且可读写
ls -la memory/

# 如果没有数据，先运行一次 CLI
npm start
```

---

## 📞 帮助

如需帮助，请查看：
- 项目 README.md
- web/README.md
- IMPLEMENTATION_SUMMARY.md
