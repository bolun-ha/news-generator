import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [prompt, setPrompt] = useState('');

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="container">
      <h1 className="title">新闻回响</h1>
      <div className="search-box">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="输入关键词检索新闻..."
          className="search-input"
        />
        <button onClick={handleGenerate} className="generate-button">
          搜索
        </button>
        <button onClick={handleRefresh} className="refresh-button">
          ↻
        </button>
      </div>
    </div>
  );
};

export default App; 