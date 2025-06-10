import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class CardService {
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

  // 获取所有卡片
  async getAll(params = {}) {
    const response = await this.api.get('/cards', { params });
    return response.data;
  }

  // 获取收到的卡片
  async getReceived(params = {}) {
    const response = await this.api.get('/cards/received', { params });
    return response.data;
  }

  // 获取发出的卡片
  async getSent(params = {}) {
    const response = await this.api.get('/cards/sent', { params });
    return response.data;
  }

  // 获取EYEBALL卡片
  async getEyeball(params = {}) {
    const response = await this.api.get('/cards/eyeball', { params });
    return response.data;
  }

  // 根据呼号档案获取卡片
  async getByCallsignProfile(profileId, params = {}) {
    const response = await this.api.get(`/cards/profile/${profileId}`, { params });
    return response.data;
  }

  // 获取单个卡片
  async getById(id) {
    const response = await this.api.get(`/cards/${id}`);
    return response.data;
  }

  // 创建卡片
  async create(data) {
    const response = await this.api.post('/cards', data);
    return response.data;
  }

  // 更新卡片
  async update(id, data) {
    const response = await this.api.put(`/cards/${id}`, data);
    return response.data;
  }

  // 删除卡片
  async delete(id) {
    const response = await this.api.delete(`/cards/${id}`);
    return response.data;
  }

  // 搜索卡片
  async search(query, params = {}) {
    const response = await this.api.get('/cards/search', { 
      params: { q: query, ...params } 
    });
    return response.data;
  }

  // 获取统计信息
  async getStats() {
    const response = await this.api.get('/cards/stats');
    return response.data;
  }

  // 根据呼号档案获取统计信息
  async getStatsByProfile(profileId) {
    const response = await this.api.get(`/cards/stats/profile/${profileId}`);
    return response.data;
  }
}

export const cardService = new CardService();

