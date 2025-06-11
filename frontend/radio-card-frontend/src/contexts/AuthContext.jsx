import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 检查系统初始化状态
  useEffect(() => {
    const checkInitStatus = async () => {
      try {
        const response = await api.get('/auth/init-status');
        console.log('AuthContext: Init Status API Response:', response.data);
        setIsInitialized(response.data.data.isInitialized);
      } catch (err) {
        console.error('AuthContext: Failed to check init status:', err);
        // 如果请求失败，假设系统未初始化
        setIsInitialized(false);
      } finally {
        setLoading(false);
      }
    };

    checkInitStatus();
  }, []);

  // 检查用户是否已登录
  useEffect(() => {
    console.log('AuthContext: isInitialized state changed:', isInitialized);
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setCurrentUser(response.data.user);
      } catch (err) {
        console.error('AuthContext: Failed to fetch user data:', err);
        // 如果获取用户信息失败，清除token
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      } finally {
        setLoading(false);
      }
    };

    if (isInitialized) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, [isInitialized]);

  // 系统初始化
  const initialize = async (userData) => {
    setError(null);
    try {
      const response = await api.post('/auth/initialize', userData);
      console.log('AuthContext: Initialize API Response:', response.data);
      setIsInitialized(true);
      setCurrentUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      console.log('AuthContext: isInitialized set to true, currentUser set, tokens stored.');
      return response.data;
    } catch (err) {
      console.error('AuthContext: Initialize Error:', err.response ? err.response.data : err.message, err);
      setError(err.response?.data?.message || '系统初始化失败');
      throw err;
    }
  };

  // 登录
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      setCurrentUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || '登录失败，请检查您的凭据');
      throw err;
    }
  };

  // 登出
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.error('AuthContext: Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setCurrentUser(null);
    }
  };

  // 重置密码请求
  const forgotPassword = async (email) => {
    setError(null);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || '发送重置密码邮件失败');
      throw err;
    }
  };

  // 重置密码
  const resetPassword = async (token, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || '重置密码失败');
      throw err;
    }
  };

  // 更新用户信息
  const updateProfile = async (userData) => {
    setError(null);
    try {
      const response = await api.put('/auth/profile', userData);
      setCurrentUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || '更新个人资料失败');
      throw err;
    }
  };

  // 更改密码
  const changePassword = async (currentPassword, newPassword) => {
    setError(null);
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || '更改密码失败');
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    isInitialized,
    initialize,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


