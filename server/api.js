require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3005;

// CORS配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],  // 允许两个端口
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

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

// 第一步：使用大模型分析用户意图
async function analyzeUserIntent(prompt) {
  const response = await axios.post(
    'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    {
      model: "ep-20250324134832-r8z59",
      messages: [
        {
          role: "system",
          content: `你是一个新闻分析助手，需要分析用户的搜索意图，提取关键词和主题。请返回JSON格式：
{
  "keywords": ["关键词1", "关键词2"],
  "topic": "主题描述",
  "timeRange": "today/3days/7days/15days/30days"
}`
        },
        {
          role: "user",
          content: prompt
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
  return JSON.parse(response.data.choices[0].message.content);
}

// 第二步：调用今日头条API获取新闻
async function fetchToutiaoNews(keywords, timeRange) {
  const maxRetries = 3; // 最大重试次数
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // 增加获取数量，提高命中率
      const response = await axios.get('https://www.toutiao.com/api/search/content/', {
        params: {
          keyword: keywords.join(' '),
          count: 50,  // 从20改为50，获取更多新闻
          pd: 'information',
          offset: 0,
          format: 'json',
          from: 'news',  // 改为 news，专门获取资讯
          _: Date.now()
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Referer': 'https://www.toutiao.com/search/?keyword=' + encodeURIComponent(keywords.join(' ')),
          'Cookie': 'tt_webid=' + Math.random().toString(36).substr(2)
        }
      });

      console.log('今日头条API响应:', response.data);

      if (response.data && response.data.data) {
        // 广告关键词列表
        const adKeywords = [
          '下载', '安装', 'app', '手机版', '官方版', '免费', '入口',
          '豌豆荚', '应用宝', '应用商店', '应用市场', '应用下载'
        ];
        
        // 需要过滤的域名
        const blockedDomains = [
          'wandoujia.com',
          'pp.cn',
          'appstore.com',
          'play.google.com'
        ];

        // 只过滤广告关键词和域名
        const newsItems = response.data.data.filter(item => {
          const url = String(item.article_url || item.url || '');
          const title = String(item.title || item.display?.title || '');
          
          // 检查URL是否包含被过滤的域名
          const isBlockedDomain = blockedDomains.some(domain => url.includes(domain));
          
          // 检查标题是否包含广告关键词
          const hasAdKeyword = adKeywords.some(keyword => title.includes(keyword));
          
          return !isBlockedDomain && !hasAdKeyword && url && title;
        });

       // 获取网站域名的函数
       const getDomainFromUrl = (url) => {
        try {
          const urlObj = new URL(url);
          return urlObj.hostname.replace('www.', '');
        } catch (e) {
          return '未知来源';
        }
      };

      return newsItems.map(item => ({
        title: item.title || item.display?.title || '',
        content: item.abstract || item.content || item.display?.abstract || '',
        date: item.publish_time ? new Date(item.publish_time * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        url: item.article_url || item.url || '',
        source: getDomainFromUrl(item.article_url || item.url || '')
      }));
      }
      
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('获取今日头条新闻失败:', error);
      if (error.response) {
        console.error('错误响应:', error.response.data);
      }
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`已重试 ${maxRetries} 次，仍未获取到有效新闻`);
  return [];
}

// 第三步：使用大模型处理新闻内容
async function processNewsContent(newsData) {
  if (!newsData || newsData.length === 0) {
    console.log('没有找到新闻数据');
    return [];
  }

  console.log('开始处理新闻数据:', newsData);

  const response = await axios.post(
    'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    {
      model: "ep-20250324134832-r8z59",
      messages: [
        {
          role: "system",
          content: `你是一个新闻处理助手，需要处理新闻数据并生成标题和摘要。请严格按照以下JSON格式返回：
[
  {
    "title": "新闻标题",
    "summary": "新闻摘要（200字以内）",
    "date": "YYYY-MM-DD",
    "source": "今日头条",
    "url": "新闻链接"
  }
]

要求：
1. 标题要简洁明了
2. 摘要要包含新闻的核心信息
3. 保持原始新闻的日期和链接
4. 按日期从新到旧排序
5. 最多返回8条新闻
6. 确保返回的是有效的JSON数组`
        },
        {
          role: "user",
          content: JSON.stringify(newsData)
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

  try {
    console.log('大模型返回内容:', response.data.choices[0].message.content);
    const processedNews = JSON.parse(response.data.choices[0].message.content);
    // 验证处理后的新闻数据
    if (!Array.isArray(processedNews)) {
      throw new Error('处理后的新闻数据格式不正确');
    }
    return processedNews;
  } catch (error) {
    console.error('处理新闻内容失败:', error);
    return [];
  }
}

app.post('/api/generate-news', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // 第一步：分析用户意图
    console.log('分析用户意图...');
    const intent = await analyzeUserIntent(prompt);
    console.log('用户意图分析结果:', intent);
    
    // 第二步：获取新闻数据
    console.log('获取新闻数据...');
    const newsData = await fetchToutiaoNews(intent.keywords, intent.timeRange);
    console.log('获取到的新闻数据:', newsData);
    
    // 第三步：处理新闻内容
    console.log('处理新闻内容...');
    const processedNews = await processNewsContent(newsData);
    console.log('处理后的新闻:', processedNews);
    
    res.json(processedNews);
    
  } catch (error) {
    console.error('新闻检索失败:', error);
    res.status(500).json({ 
      error: '新闻检索失败',
      message: error.message 
    });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});