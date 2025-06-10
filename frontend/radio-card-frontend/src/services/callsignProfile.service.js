import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class CallsignProfileService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
    });

    // 请求拦截器 - 添加认证token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器 - 处理认证错误
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // 获取所有呼号档案
  async getAll() {
    const response = await this.api.get('/callsign-profiles');
    return response.data;
  }

  // 获取单个呼号档案
  async getById(id) {
    const response = await this.api.get(`/callsign-profiles/${id}`);
    return response.data;
  }

  // 获取默认呼号档案
  async getDefault() {
    const response = await this.api.get('/callsign-profiles/default');
    return response.data;
  }

  // 创建呼号档案
  async create(data) {
    const response = await this.api.post('/callsign-profiles', data);
    return response.data;
  }

  // 更新呼号档案
  async update(id, data) {
    const response = await this.api.put(`/callsign-profiles/${id}`, data);
    return response.data;
  }

  // 删除呼号档案
  async delete(id) {
    const response = await this.api.delete(`/callsign-profiles/${id}`);
    return response.data;
  }

  // 设置默认呼号档案
  async setDefault(id) {
    const response = await this.api.put(`/callsign-profiles/${id}/set-default`);
    return response.data;
  }
}

export const callsignProfileService = new CallsignProfileService();

