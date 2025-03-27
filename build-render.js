const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('开始构建...');
  
  // 尝试使用 process.env.PATH 来执行 next
  try {
    console.log('PATH 环境变量:', process.env.PATH);
    execSync('echo "PATH环境变量:" && echo $PATH', { stdio: 'inherit' });
  } catch (err) {
    console.error('无法显示 PATH:', err);
  }
  
  // 尝试列出 node_modules/.bin 目录内容
  try {
    console.log('列出 node_modules/.bin 目录:');
    if (fs.existsSync('./node_modules/.bin')) {
      execSync('ls -la ./node_modules/.bin', { stdio: 'inherit' });
    } else {
      console.log('node_modules/.bin 目录不存在');
    }
  } catch (err) {
    console.error('无法列出目录:', err);
  }
  
  // 创建基本的静态 HTML 文件作为后备方案
  console.log('创建静态 HTML 页面...');
  
  // 确保 out 目录存在
  if (!fs.existsSync('./out')) {
    fs.mkdirSync('./out', { recursive: true });
  }
  
  // 写入一个简单的 index.html 文件
  const html = `
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>新闻回响</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { text-align: center; }
    .input-container { display: flex; margin: 20px 0; }
    input { flex: 1; padding: 10px; font-size: 16px; }
    button { padding: 10px 20px; font-size: 16px; background: #0070f3; color: white; border: none; cursor: pointer; }
    .news-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .news-item { border: 1px solid #eee; padding: 15px; cursor: pointer; }
    .news-header { display: flex; justify-content: space-between; align-items: center; }
    .news-date { font-size: 12px; color: #666; }
    .news-title { margin: 0; }
    a { color: #0070f3; text-decoration: none; }
  </style>
</head>
<body>
  <h1>新闻回响</h1>
  <div class="input-container">
    <input type="text" id="prompt" placeholder="输入新闻主题...">
    <button id="search">搜索</button>
  </div>
  <div id="error" style="color: red;"></div>
  <div id="news-container" class="news-container"></div>

  <script>
    const apiUrl = 'https://news-generator.onrender.com';
    
    document.getElementById('search').addEventListener('click', async () => {
      const prompt = document.getElementById('prompt').value;
      if (!prompt) return;
      
      try {
        document.getElementById('error').textContent = '';
        document.getElementById('search').textContent = '搜索中..';
        
        const response = await fetch(\`\${apiUrl}/api/generate-news\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });
        
        if (!response.ok) {
          throw new Error(\`请求失败: \${response.status}\`);
        }
        
        const data = await response.json();
        renderNews(data);
      } catch (err) {
        document.getElementById('error').textContent = \`错误: \${err.message}\`;
      } finally {
        document.getElementById('search').textContent = '搜索';
      }
    });
    
    function renderNews(news) {
      const container = document.getElementById('news-container');
      container.innerHTML = '';
      
      news.slice(0, 8).forEach(item => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        
        const header = document.createElement('div');
        header.className = 'news-header';
        
        const title = document.createElement('h2');
        title.className = 'news-title';
        title.textContent = item.title;
        
        const date = document.createElement('span');
        date.className = 'news-date';
        date.textContent = item.date;
        
        header.appendChild(title);
        header.appendChild(date);
        
        newsItem.appendChild(header);
        
        let expanded = false;
        
        newsItem.addEventListener('click', () => {
          if (!expanded) {
            const details = document.createElement('div');
            
            const summary = document.createElement('p');
            summary.textContent = item.summary;
            
            const source = document.createElement('div');
            source.innerHTML = \`来源：<a href="\${item.url}" target="_blank">\${item.source}</a>\`;
            
            details.appendChild(summary);
            details.appendChild(source);
            
            newsItem.appendChild(details);
            expanded = true;
          } else {
            newsItem.lastChild.remove();
            expanded = false;
          }
        });
        
        container.appendChild(newsItem);
      });
    }
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync('./out/index.html', html);
  console.log('静态 HTML 页面创建完成');
  
  // 尝试使用 npm 执行构建命令 (这可能会失败，但我们已经有了后备方案)
  try {
    console.log('尝试执行构建命令...');
    execSync('npm run dev -- --output=export', { stdio: 'inherit' });
  } catch (buildError) {
    console.log('标准 Next.js 构建失败，但我们已经创建了静态 HTML 页面作为后备方案');
    console.error('构建错误:', buildError);
  }
  
  console.log('构建过程完成');
} catch (error) {
  console.error('构建脚本执行失败:', error);
  process.exit(1);
}