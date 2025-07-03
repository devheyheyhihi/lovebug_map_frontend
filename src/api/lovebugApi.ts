import axios from 'axios';
import { LovebugReport, LovebugStats, HotSpot, SearchFilter, SeverityLevel, Platform, Stats } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 임시 데이터 생성 함수들
const generateMockReports = (): LovebugReport[] => {
  const mockReports: LovebugReport[] = [];
  const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
  const platforms: Array<'google' | 'naver' | 'kakao'> = ['google', 'naver', 'kakao'];
  
  for (let i = 0; i < 20; i++) {
    mockReports.push({
      id: `report-${i}`,
      content: `러브버그 발견 신고 ${i + 1}`,
      description: `러브버그 발견 신고 ${i + 1}`,
      location: {
        latitude: 37.5665 + (Math.random() - 0.5) * 0.1,
        longitude: 126.9780 + (Math.random() - 0.5) * 0.1,
        address: `서울특별시 중구 명동 ${i + 1}길`,
      },
      address: `서울특별시 중구 명동 ${i + 1}길`,
      severity: severities[Math.floor(Math.random() * severities.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      created_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      keywords: ['러브버그', '벌레', '신고'],
      confidence: Math.random() * 0.5 + 0.5,
      sentiment: Math.random() * 2 - 1,
      intensity: severities[Math.floor(Math.random() * severities.length)],
      relevance: Math.random() * 0.5 + 0.5,
      photos: [],
      reported_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      verified: Math.random() > 0.5,
      verification_count: Math.floor(Math.random() * 10),
      user_id: `user-${i}`,
    });
  }
  
  return mockReports;
};

const generateMockHotspots = (): HotSpot[] => {
  const mockHotspots: HotSpot[] = [];
  
  for (let i = 0; i < 5; i++) {
    mockHotspots.push({
      id: `hotspot-${i}`,
      location: {
        latitude: 37.5665 + (Math.random() - 0.5) * 0.1,
        longitude: 126.9780 + (Math.random() - 0.5) * 0.1,
        address: `서울특별시 중구 핫스팟 ${i + 1}`,
      },
      address: `서울특별시 중구 핫스팟 ${i + 1}`,
      report_count: Math.floor(Math.random() * 50) + 10,
      severity_distribution: {
        low: Math.floor(Math.random() * 10),
        medium: Math.floor(Math.random() * 10),
        high: Math.floor(Math.random() * 10),
        critical: Math.floor(Math.random() * 5),
      },
      last_activity: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      last_reported: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      radius: Math.floor(Math.random() * 500) + 100,
    });
  }
  
  return mockHotspots;
};

const generateMockStats = (): Stats => {
  return {
    total_reports: 1250,
    verified_reports: 980,
    pending_reports: 270,
    by_severity: {
      low: 450,
      medium: 520,
      high: 230,
      critical: 50,
    },
    by_platform: {
      google: 480,
      naver: 420,
      kakao: 350,
    },
    recent_trend: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 10,
    })).reverse(),
  };
};

// 신고 목록 조회
export const getReports = async (filter: SearchFilter = {}): Promise<LovebugReport[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filter.hours) params.append('hours', filter.hours.toString());
    if (filter.severity) params.append('severity', filter.severity);
    if (filter.platform) params.append('platform', filter.platform);
    if (filter.limit) params.append('limit', filter.limit.toString());
    if (filter.offset) params.append('offset', filter.offset.toString());
    if (filter.search) params.append('search', filter.search);

    const response = await api.get(`/reports?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    // 임시 데이터 반환
    return generateMockReports();
  }
};

// 핫스팟 조회
export const getHotspots = async (filter: SearchFilter = {}): Promise<HotSpot[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filter.hours) params.append('hours', filter.hours.toString());
    if (filter.severity) params.append('severity', filter.severity);
    if (filter.limit) params.append('limit', filter.limit.toString());

    const response = await api.get(`/hotspots?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hotspots:', error);
    // 임시 데이터 반환
    return generateMockHotspots();
  }
};

// 통계 조회
export const getStats = async (filter: SearchFilter = {}): Promise<Stats> => {
  try {
    const params = new URLSearchParams();
    
    if (filter.hours) params.append('hours', filter.hours.toString());
    if (filter.severity) params.append('severity', filter.severity);
    if (filter.platform) params.append('platform', filter.platform);

    const response = await api.get(`/stats?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    // 임시 데이터 반환
    return generateMockStats();
  }
};

// 신고 생성
export const createReport = async (report: Omit<LovebugReport, 'id' | 'reported_at' | 'verified' | 'verification_count'>): Promise<LovebugReport> => {
  try {
    const response = await api.post('/reports', report);
    return response.data;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

// 신고 검증
export const verifyReport = async (reportId: string): Promise<LovebugReport> => {
  try {
    const response = await api.post(`/reports/${reportId}/verify`);
    return response.data;
  } catch (error) {
    console.error('Error verifying report:', error);
    throw error;
  }
};

// 기본 export
const lovebugApi = {
  getReports,
  getHotspots,
  getStats,
  createReport,
  verifyReport,
};

export default lovebugApi; 