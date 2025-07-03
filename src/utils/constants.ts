export const SEVERITY_COLORS = {
  low: '#2ecc71',
  medium: '#f39c12',
  high: '#e67e22',
  critical: '#e74c3c'
};

export const SEVERITY_LABELS = {
  low: '낮음',
  medium: '보통',
  high: '높음',
  critical: '심각'
};

export const PLATFORM_COLORS = {
  google: '#4285f4',
  naver: '#00c73c',
  kakao: '#fee500',
  other: '#95a5a6'
};

export const PLATFORM_LABELS = {
  google: '구글',
  naver: '네이버',
  kakao: '카카오',
  other: '기타'
};

export const DEFAULT_CENTER = {
  lat: 37.5665,  // 서울 시청 좌표
  lng: 126.9780
};

export const DEFAULT_ZOOM = 11;

export const WEBSOCKET_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

export const REFRESH_INTERVALS = {
  STATS: 30000,      // 30초
  REPORTS: 60000,    // 1분
  HOTSPOTS: 120000   // 2분
};

export const TIME_FILTERS = [
  { value: 1, label: '최근 1시간' },
  { value: 6, label: '최근 6시간' },
  { value: 24, label: '최근 24시간' },
  { value: 72, label: '최근 3일' },
  { value: 168, label: '최근 7일' },
  { value: 720, label: '최근 30일' }
];

export const SEVERITY_FILTERS = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '높음' },
  { value: 'critical', label: '심각' }
];

export const PLATFORM_FILTERS = [
  { value: 'google', label: '구글' },
  { value: 'naver', label: '네이버' },
  { value: 'kakao', label: '카카오' },
  { value: 'other', label: '기타' }
];

export const CHART_COLORS = {
  primary: '#e74c3c',
  secondary: '#3498db',
  success: '#2ecc71',
  warning: '#f39c12',
  info: '#9b59b6',
  dark: '#2c3e50',
  light: '#ecf0f1'
};

export const LOVEBUG_SEVERITY = {
  low: { label: '낮음', color: SEVERITY_COLORS.low, value: 1 },
  medium: { label: '보통', color: SEVERITY_COLORS.medium, value: 2 },
  high: { label: '높음', color: SEVERITY_COLORS.high, value: 3 },
  critical: { label: '심각', color: SEVERITY_COLORS.critical, value: 4 }
};

export const REPORT_STATUS = {
  pending: { label: '대기 중', color: '#f39c12' },
  verified: { label: '검증됨', color: '#2ecc71' },
  rejected: { label: '거부됨', color: '#e74c3c' }
};