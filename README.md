# 徐州旅游指南 (Xuzhou Travel Guide)

这是一个基于React + Vite构建的徐州旅游指南网页项目，为游客提供全面的徐州旅游信息。

## 项目简介

本项目是一个现代化的旅游指南网站，包含以下功能模块：
- 🏠 首页展示
- 🗺️ 景点地图
- 🍜 美食推荐
- 🏨 住宿指南
- 🚗 交通信息
- 📅 旅行计划

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **样式**: CSS3
- **代码规范**: ESLint

## 开发环境设置

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 项目结构

```
src/
├── components/          # React组件
│   ├── Header.jsx      # 头部导航
│   ├── Home.jsx        # 首页
│   ├── Map.jsx         # 地图组件
│   ├── Food.jsx        # 美食推荐
│   ├── Accommodation.jsx # 住宿指南
│   ├── Transportation.jsx # 交通信息
│   └── TravelPlan.jsx  # 旅行计划
├── assets/             # 静态资源
├── App.jsx            # 主应用组件
└── main.jsx           # 应用入口
```

## Vite + React 技术说明

本项目使用Vite作为构建工具，提供快速的开发体验和HMR（热模块替换）功能。

当前使用的官方插件：
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) 使用 [Babel](https://babeljs.io/) 进行快速刷新
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) 使用 [SWC](https://swc.rs/) 进行快速刷新

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License
