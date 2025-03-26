import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const generateNews = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('发送请求到后端，主题:', prompt);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
const response = await fetch(`${apiUrl}/api/generate-news`, {
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
      setExpandedIndex(null);  // 重置展开状�?
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
        <h1 className={styles.title}>新闻回响</h1>
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
            {loading ? '搜索中..' : '搜索'}
          </button>
        </div>
        
        {error && (
          <p className={styles.error}>
            错误: {error}
          </p>
        )}
        
        <div className={styles.newsContainer}>
        {news.slice(0, 8).map((item, index) => (
            <div 
              key={index} 
              className={`${styles.newsItem} ${expandedIndex === index ? styles.expanded : ''}`}
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className={styles.newsHeader}>
                <h2 className={styles.newsTitle}>{item.title}</h2>
                <span className={styles.newsDate}>{item.date}</span>
              </div>
              {expandedIndex === index && (
                <div className={styles.newsDetails}>
                  <p className={styles.newsSummary}>{item.summary}</p>
                  <div className={styles.newsSource}>
                    <span>来源/span>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (item.url === '#') {
                          e.preventDefault();
                        }
                      }}
                    >
                      {item.source}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 
