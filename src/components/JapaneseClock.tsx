import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function JapaneseClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // 日本時間のフォーマット
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}年${month}月${day}日(${weekday})`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="fixed bottom-10 right-16 bg-black/80 text-white p-4 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700">
      <div className="flex items-center gap-3">
        <Clock size={24} className="text-gray-400" />
        <div>
          <div className="text-sm text-gray-300">{formatDate(currentTime)}</div>
          <div className="text-xl font-medium">{formatTime(currentTime)}</div>
        </div>
      </div>
    </div>
  );
} 