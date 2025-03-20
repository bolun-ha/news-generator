# 新闻生成器

这是一个基于火山引擎ARK API的新闻生成器，可以根据用户输入的主题自动生成相关新闻。

## 功能特点

- 根据主题生成新闻标题和摘要
- 实时生成，快速响应
- 简洁美观的用户界面
- 支持中文输入

## 技术栈

- 前端：Next.js, React
- 后端：Node.js, Express
- API：火山引擎ARK API

## 本地开发

1. 克隆仓库：
```bash
git clone [仓库地址]
```

2. 安装依赖：
```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
```

3. 配置环境变量：
在根目录创建 `.env` 文件，添加以下内容：
```
ARK_API_KEY=你的API密钥
```

4. 启动开发服务器：
```bash
# 启动前端（在根目录）
npm run dev

# 启动后端（在server目录）
cd server
npm run dev
```

5. 访问 http://localhost:3000 即可使用应用

## 在线演示

[在线演示地址]

## 部署

- 前端使用Vercel部署
- 后端使用Railway或Render部署

## 许可证

MIT 