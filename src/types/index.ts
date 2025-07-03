export interface Location {
  latitude: number;
  longitude: number;
  lat?: number;
  lng?: number;
  address?: string;
  district?: string;
  city?: string;
}

export interface LovebugReport {
  id: string;
  content: string;
  description?: string;
  location: Location;
  address?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  platform: 'twitter' | 'instagram' | 'naver' | 'kakao' | 'google';
  created_at: string;
  tweet_id?: string;
  user_id?: string;
  keywords: string[];
  confidence: number;
  sentiment: number;
  intensity: string;
  relevance: number;
  photos?: string[];
  reported_at?: string;
  verified?: boolean;
  verification_count?: number;
}

export interface LovebugStats {
  total_reports: number;
  reports_by_severity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  reports_by_platform: {
    twitter: number;
    instagram: number;
    naver: number;
    kakao: number;
    google?: number;
  };
  reports_by_time: {
    last_hour: number;
    last_6_hours: number;
    last_24_hours: number;
    last_week: number;
  };
  top_districts: Array<{
    district: string;
    count: number;
  }>;
  last_updated: string;
}

export interface HotSpot {
  id: string;
  location: Location;
  address?: string;
  report_count: number;
  average_severity?: number;
  severity_distribution?: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  last_activity: string;
  last_reported?: string;
  radius: number;
}

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type Platform = 'twitter' | 'instagram' | 'naver' | 'kakao' | 'google';

export interface SearchFilter {
  severity?: SeverityLevel;
  platform?: Platform;
  hours?: number;
  keyword?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface Stats {
  total_reports: number;
  verified_reports: number;
  pending_reports: number;
  by_severity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  by_platform: {
    google: number;
    naver: number;
    kakao: number;
    twitter?: number;
    instagram?: number;
  };
  recent_trend: {
    date: string;
    count: number;
  }[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}