# AI 视觉对话助手

> 一个基于 WebRTC 和 AI 的实时视觉对话应用，支持摄像头视频分析和语音交互。

## ✨ 功能特性

- 🎥 **实时视频分析** - AI 能够看到摄像头画面并理解视觉内容
- 🎤 **语音识别** - 支持中文语音输入，自动过滤静音和水词
- 🔊 **语音合成** - 支持多种 AI 音色（冰糖、茉莉、苏打、白桦）
- 📱 **响应式设计** - 完美适配桌面端和移动端
- ⚡ **智能采样** - 根据对话状态自动调整视频帧率，节省资源
- 💬 **实时对话** - WebSocket 双向通信，低延迟交互
- 📸 **截图分析** - 支持手动截图让 AI 分析特定画面
- 📊 **性能监控** - 实时查看 FPS、延迟、API 调用等指标
- 💾 **对话导出** - 支持导出对话历史记录
- ⌨️ **快捷键** - 支持键盘快捷键操作

## 🛠️ 技术栈

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| [React](https://react.dev/) | 18.3 | 用户界面构建库 |
| [TypeScript](https://www.typescriptlang.org/) | 5.5 | 类型安全的 JavaScript 超集 |
| [Vite](https://vitejs.dev/) | 5.4 | 下一代前端构建工具 |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 | 实用优先的 CSS 框架 |
| [Lucide React](https://lucide.dev/) | 0.460 | 精美的开源图标库 |
| [Axios](https://axios-http.com/) | 1.7 | HTTP 客户端 |

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| [Node.js](https://nodejs.org/) | >= 18 | JavaScript 运行时 |
| [Express](https://expressjs.com/) | 4.21 | Web 应用框架 |
| [ws](https://github.com/websockets/ws) | 8.18 | WebSocket 库 |
| [dotenv](https://github.com/motdotla/dotenv) | 16.4 | 环境变量管理 |
| [cors](https://github.com/expressjs/cors) | 2.8 | 跨域资源共享 |
| [uuid](https://github.com/uuidjs/uuid) | 10.0 | 唯一标识符生成 |

### AI 服务

| 模型 | 用途 | 说明 |
|------|------|------|
| mimo-v2.5 | 视觉理解 | 多模态视觉分析 |
| mimo-v2.5-asr | 语音识别 | 音频转文本 |
| mimo-v2.5-tts | 语音合成 | 文本转语音 |

### 浏览器 API

| API | 用途 |
|-----|------|
| WebRTC (MediaStream) | 摄像头/麦克风访问 |
| Web Audio API | 音频处理与 VAD |
| WebSocket | 实时双向通信 |
| Canvas API | 视频帧捕获与压缩 |

## 📦 安装与运行

### 环境要求

- Node.js >= 18
- npm >= 9
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/RuiYier/Rui-Visual-Assistant.git
cd Rui-Visual-Assistant

# 2. 安装依赖
npm run install:all

# 3. 配置环境变量
# 复制 .env.example 为 .env，填入你的 API Key
cp .env.example .env

# 4. 启动开发服务器
npm run dev
```

### 访问应用

- 前端：http://localhost:5173
- 后端 API：http://localhost:3001
- WebSocket：ws://localhost:3002

## 📁 项目结构

```
Rui-Visual-Assistant/
├── client/                     # 前端 React 应用
│   ├── public/                 # 静态资源
│   │   └── favicon.svg         # 网站图标
│   ├── src/
│   │   ├── components/         # UI 组件
│   │   │   ├── VideoCapture.tsx    # 视频捕获组件
│   │   │   ├── ChatPanel.tsx       # 聊天面板组件
│   │   │   ├── ControlBar.tsx      # 控制栏组件
│   │   │   ├── SettingsPanel.tsx   # 设置面板组件
│   │   │   └── PerformanceMonitor.tsx # 性能监控组件
│   │   ├── hooks/              # 自定义 Hooks
│   │   │   ├── useCamera.ts        # 摄像头控制
│   │   │   ├── useMicrophone.ts    # 麦克风控制
│   │   │   ├── useWebSocket.ts     # WebSocket 通信
│   │   │   ├── useSmartSampling.ts # 智能采样
│   │   │   └── useKeyboardShortcuts.ts # 快捷键
│   │   ├── services/           # 服务层
│   │   │   ├── websocket.ts        # WebSocket 客户端
│   │   │   └── api.ts              # API 接口
│   │   ├── utils/              # 工具函数
│   │   │   ├── audio.ts            # 音频处理
│   │   │   ├── image.ts            # 图片处理
│   │   │   ├── vad.ts              # 语音活动检测
│   │   │   └── performance.ts      # 性能监控
│   │   ├── types/              # TypeScript 类型
│   │   │   └── index.ts
│   │   ├── App.tsx             # 主应用组件
│   │   ├── main.tsx            # 入口文件
│   │   └── index.css           # 全局样式
│   ├── tailwind.config.js      # Tailwind 配置
│   ├── tsconfig.json           # TypeScript 配置
│   ├── vite.config.ts          # Vite 配置
│   └── package.json
├── server/                     # 后端 Node.js 应用
│   ├── src/
│   │   ├── routes/             # API 路由
│   │   │   └── api.ts
│   │   ├── services/           # 业务服务
│   │   │   ├── mimo.ts             # Mimo API 封装
│   │   │   ├── asr.ts              # 语音识别服务
│   │   │   ├── vision.ts           # 视觉理解服务
│   │   │   └── tts.ts              # 语音合成服务
│   │   ├── websocket/          # WebSocket 处理
│   │   │   └── handler.ts
│   │   ├── types/              # TypeScript 类型
│   │   │   └── index.ts
│   │   └── index.ts            # 服务器入口
│   ├── tsconfig.json
│   └── package.json
├── .env                        # 环境变量（不提交）
├── .env.example                # 环境变量示例
├── .gitignore
├── package.json                # 根 package.json
└── README.md
```

## 🔧 环境变量

创建 `.env` 文件并配置以下变量：

```env
# Mimo API 配置
MIMO_API_KEY=your_api_key_here
MIMO_API_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1

# 服务器端口
PORT=3001
WS_PORT=3002
```

## 📖 使用说明

### 基本操作

1. **开启摄像头** - 点击控制栏的摄像头按钮
2. **开启麦克风** - 点击控制栏的麦克风按钮
3. **开始对话** - 对着摄像头说话，AI 会自动识别并回复
4. **截图分析** - 点击截图按钮让 AI 分析当前画面
5. **切换音色** - 在设置中选择不同的 AI 音色

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + K` | 开启/关闭摄像头 |
| `Ctrl + M` | 开启/关闭麦克风 |
| `Ctrl + S` | 截图分析 |
| `Ctrl + L` | 清空对话 |
| `Ctrl + ,` | 打开设置 |

### 成本控制

- **智能采样** - 对话时使用高帧率，静默时自动降低
- **静音检测** - 静音时暂停音频处理
- **图片压缩** - 自动压缩到 720p，JPEG 60% 质量
- **TTS 缓存** - 相同文本缓存音频，避免重复调用
- **上下文裁剪** - 保留最近 5 轮对话，控制 token 增长

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行前端测试
npm run test:client

# 运行后端测试
npm run test:server

# 生成覆盖率报告
npm run test:coverage
```

## 📝 PR 提交记录

| PR # | 标题 | 状态 |
|------|------|------|
| PR1 | feat: 添加设置面板功能 | ✅ 已合并 |
| PR2 | feat: 实现智能帧采样功能 | ✅ 已合并 |
| PR3 | feat: 完善 TTS 音色管理与 API 接口 | ✅ 已合并 |
| PR4 | feat: 实现移动端适配与全屏功能 | ✅ 已合并 |
| PR5 | docs: 添加设计文档 | ✅ 已合并 |
| PR6 | feat: 完善错误处理与稳定性 | ✅ 已合并 |
| PR7 | feat: 添加性能监控功能 | ✅ 已合并 |
| PR8 | feat: 添加对话历史导出功能 | ✅ 已合并 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
