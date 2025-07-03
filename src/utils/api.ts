import axios from 'axios';
import { LovebugReport, LovebugStats, HotSpot, SearchFilter } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// API 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 요청 오류:', error);
    return Promise.reject(error);
  }
);

export const lovebugApi = {
  // 보고서 목록 조회
  getReports: async (params?: {
    limit?: number;
    offset?: number;
    severity?: string;
    platform?: string;
    hours?: number;
  }): Promise<LovebugReport[]> => {
    const response = await api.get('/reports', { params });
    return response.data;
  },

  // 특정 보고서 조회
  getReport: async (id: string): Promise<LovebugReport> => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  // 통계 정보 조회
  getStats: async (hours?: number): Promise<LovebugStats> => {
    const response = await api.get('/stats', { 
      params: hours ? { hours } : undefined 
    });
    return response.data;
  },

  // 핫스팟 조회
  getHotspots: async (params?: {
    limit?: number;
    min_reports?: number;
    hours?: number;
  }): Promise<HotSpot[]> => {
    const response = await api.get('/hotspots', { params });
    return response.data;
  },

  // 보고서 검색
  searchReports: async (filter: SearchFilter): Promise<LovebugReport[]> => {
    const response = await api.get('/search', { params: filter });
    return response.data;
  },

  // 지역별 현황 조회
  getDistricts: async (hours?: number): Promise<Array<{
    district: string;
    count: number;
    average_severity: number;
    last_activity: string;
  }>> => {
    const response = await api.get('/districts', { 
      params: hours ? { hours } : undefined 
    });
    return response.data;
  },

  // 헬스 체크
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;