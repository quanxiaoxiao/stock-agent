# Stock Trading Agent - Web Frontend

基于 Next.js + React + TypeScript 的股票交易代理 Web 前端。

## 功能特性

### 已实现的页面
- **Dashboard (首页)** - 数据概览、待审批提示、近期交易、快速操作
- **API 路由** - 与后端数据对接的 REST API

### 页面结构
```
/
├── /                    # 仪表盘首页
├── /decisions           # 交易决策（待实现）
├── /approvals           # 待审批页面（待实现）
├── /proposals           # 交易提议列表（待实现）
├── /proposals/[id]      # 提议详情（待实现）
├── /intent              # 意图配置（待实现）
├── /history             # 历史记录（待实现）
└── /reflection          # 反思洞察（待实现）
```

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: React 18 + Tailwind CSS
- **状态管理**: TanStack Query (React Query)
- **图标**: Lucide React
- **图表**: Recharts

## 快速开始

### 1. 安装依赖
```bash
cd web
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

### 3. 构建生产版本
```bash
npm run build
```

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/intent` | GET/PUT | 用户意图管理 |
| `/api/proposals` | GET | 获取所有提议 |
| `/api/approvals/pending` | GET | 待审批列表 |
| `/api/outcomes` | GET | 执行结果 |
| `/api/reflections` | GET | 反思报告 |

## 开发计划

### Phase 1 - MVP (已完成)
- [x] 项目初始化
- [x] Dashboard 首页
- [x] 基础 API 路由
- [x] 数据展示组件

### Phase 2 - 核心功能
- [ ] 交易决策页面
- [ ] 待审批页面
- [ ] 提议列表和详情
- [ ] 意图配置页面

### Phase 3 - 增强功能
- [ ] 历史记录页面
- [ ] 反思洞察页面
- [ ] 图表和数据分析
- [ ] 实时数据更新

## 与后端集成

Web 前端通过文件系统直接读取 `../memory/` 目录中的数据，无需额外的后端服务。所有 API 路由都在 `app/api/` 目录下实现。

## 注意事项

1. 确保后端项目已经运行并生成了数据
2. API 路由使用相对路径 `../memory/` 访问数据
3. 开发时使用 `npm run dev`，生产使用 `npm run build`
