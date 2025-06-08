import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    callsign: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!formData.name || !formData.email || !formData.callsign || !formData.password) {
      setError('请填写所有必填字段');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('密码长度至少为6个字符');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // 提交注册请求
      await register({
        name: formData.name,
        email: formData.email,
        callsign: formData.callsign,
        password: formData.password,
      });
      
      // 注册成功后跳转到登录页
      navigate('/auth/login', { 
        state: { 
          message: '注册成功！请登录您的账户。' 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || '注册失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">创建账户</h1>
        <p className="text-muted-foreground">
          输入您的信息以创建账户
        </p>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            姓名
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="张三"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            电子邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="callsign" className="text-sm font-medium">
            呼号
          </label>
          <input
            id="callsign"
            name="callsign"
            type="text"
            placeholder="BH1ABC"
            value={formData.callsign}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            确认密码
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? '注册中...' : '注册'}
        </button>
      </form>
      
      <div className="text-center text-sm">
        已有账户?{' '}
        <Link to="/auth/login" className="text-primary hover:underline">
          登录
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;

