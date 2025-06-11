import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Radio } from 'lucide-react';

const InitializePage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    callsign: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { initialize } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 验证表单
    if (!formData.username || !formData.password) {
      setError('请填写所有必填字段');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('密码确认不匹配');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setIsLoading(true);
    console.log('InitializePage: Attempting to initialize with data:', formData);

    try {
      const response = await initialize({
        username: formData.username,
        password: formData.password,
        fullName: formData.name,
        callsign: formData.callsign
      });
      console.log('InitializePage: Initialization successful, response:', response);
      navigate('/dashboard');
    } catch (err) {
      console.error('InitializePage: Initialization failed:', err);
      if (err.response) {
        console.error('InitializePage: Backend error response:', err.response.data);
        setError(err.response.data.message || '系统初始化失败');
      } else {
        setError(err.message || '系统初始化失败');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Radio className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">系统初始化</CardTitle>
          <CardDescription>
            欢迎使用业余无线电卡片管理系统！请设置您的管理员账户。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">用户名 *</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="请输入用户名"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码 *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码 *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="请输入您的姓名"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="callsign">呼号</Label>
              <Input
                id="callsign"
                name="callsign"
                type="text"
                value={formData.callsign}
                onChange={handleChange}
                placeholder="例如：BH2VSQ"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  初始化中...
                </>
              ) : (
                '完成初始化'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitializePage;


