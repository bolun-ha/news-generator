import { useState, useEffect } from 'react';

const NewsGrid = ({ prompt }) => {
  const [news, setNews] = useState([]);
  const [expanded, setExpanded] = useState(false);

  // 获取新闻数据
  useEffect(() => {
    const fetchNews = async () => {
      const lastUpdated = localStorage.getItem(`lastUpdated_${prompt}`);
      const now = new Date().getTime();
      
      if (!lastUpdated || (now - lastUpdated) > 86400000) { // 24小时更新
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
        const response = await fetch(`${apiUrl}/api/generate-news`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });
        const newNews = await response.json();
        setNews(newNews);
        localStorage.setItem(`lastUpdated_${prompt}`, now);
      }
    };
    fetchNews();
  }, [prompt]);

  return (
    <div className={`news-box ${expanded ? 'expanded' : ''}`} 
         onClick={() => setExpanded(!expanded)}>
      {news.slice(0, expanded ? 6 : 3).map((item, index) => (
        <div key={index} className="news-item">
          <h3>{item.title}</h3>
          {expanded && <p>{item.summary}</p>}
        </div>
      ))}
    </div>
  );
};

export default NewsGrid;