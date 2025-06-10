import { useState } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant = 'default' }) => {
    const id = Date.now();
    const newToast = { id, title, description, variant };
    
    setToasts(prev => [...prev, newToast]);
    
    // 简单的控制台输出，实际项目中应该有UI显示
    console.log(`Toast: ${title} - ${description} (${variant})`);
    
    // 3秒后自动移除
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return { toast, toasts };
};

