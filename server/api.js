require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 添加调试日志
console.log('当前API密钥:', process.env.ARK_API_KEY ? '已设置' : '未设置');

// 环境变量校验
if (!process.env.ARK_API_KEY) {
  console.error('\x1b[31m%s\x1b[0m', '错误：ARK_API_KEY 未设置！');
  process.exit(1);
}

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: '服务器运行正常' });
});

app.post('/api/generate-news', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // 调用火山引擎ARK API
    const response = await axios.post(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      {
        model: "ep-20250318151910-rwq52",
        messages: [
          {
            role: "system",
            content: "你是一个新闻编辑，需要根据用户提供的主题生成3条新闻标题和摘要。响应格式为JSON数组，包含title和summary字段"
          },
          {
            role: "user",
            content: `根据以下主题生成新闻：${prompt}`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ARK_API_KEY}`
        }
      }
    );

    // 解析API响应
    const newsContent = JSON.parse(response.data.choices[0].message.content);
    res.json(newsContent);
    
  } catch (error) {
    console.error('新闻生成失败:', error);
    res.status(500).json({ error: '新闻生成失败' });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});