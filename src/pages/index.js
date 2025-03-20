import { useState } from 'react';
import styles from '../styles/Home.module.css';

// API地址配置
const API_URL = 'https://news-generator-p5ok.onrender.com';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateNews = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('发送请求到后端，主题:', prompt);
      
      const response = await fetch(`${API_URL}/api/generate-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('请求失败:', response.status, errorData);
        throw new Error(errorData.error || `请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('收到后端响应:', data);
      setNews(data);
    } catch (err) {
      console.error('生成新闻出错:', err);
      setError(err.message || '生成新闻失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>新闻生成器</h1>
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入新闻主题..."
            className={styles.input}
          />
          <button
            onClick={generateNews}
            disabled={loading || !prompt}
            className={styles.button}
          >
            {loading ? '生成中...' : '生成新闻'}
          </button>
        </div>
        
        {error && (
          <p className={styles.error}>
            错误: {error}
          </p>
        )}
        
        <div className={styles.newsContainer}>
          {news.map((item, index) => (
            <div key={index} className={styles.newsItem}>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 