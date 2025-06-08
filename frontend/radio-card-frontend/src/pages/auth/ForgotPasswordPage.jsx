import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('请输入您的电子邮箱');
      return;
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      await forgotPassword(email);
      
      // 请求成功
      setMessage('重置密码链接已发送到您的邮箱，请查收');
      setEmail(''); // 清空输入框
    } catch (err) {
      setError(err.response?.data?.message || '发送重置密码邮件失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">忘记密码</h1>
        <p className="text-muted-foreground">
          输入您的电子邮箱，我们将发送重置密码链接
        </p>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm">
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            电子邮箱
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? '发送中...' : '发送重置链接'}
        </button>
      </form>
      
      <div className="text-center text-sm">
        记起密码了?{' '}
        <Link to="/auth/login" className="text-primary hover:underline">
          返回登录
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

