import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { getStats, getReports } from '../api/lovebugApi';
import { useWebSocket } from '../contexts/WebSocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { SEVERITY_COLORS, PLATFORM_COLORS, TIME_FILTERS } from '../utils/constants';

const StatisticsContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const PageTitle = styled.h1`
  color: #333;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const TimeFilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #e74c3c;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 200px;
  }
`;

const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
`;

const OverviewCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  text-align: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const OverviewValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const OverviewLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
  
  @media (max-width: 768px) {
    gap: 1rem;
    margin-bottom: 2rem;
  }
`;

const ChartCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ChartTitle = styled.h3`
  color: #333;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin: 0 0 1rem 0;
  }
`;

const FullWidthChart = styled(ChartCard)`
  grid-column: 1 / -1;
`;

const TrendSection = styled.div`
  margin-bottom: 3rem;
`;

const InsightsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const InsightCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const InsightTitle = styled.h4`
  color: #333;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const InsightItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InsightLabel = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const InsightValue = styled.span`
  color: #333;
  font-weight: 600;
`;

const StatisticsPage: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState(24);
  const { isConnected } = useWebSocket();

  // 통계 데이터 조회
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', timeFilter],
    queryFn: () => getStats({ hours: timeFilter }),
    refetchInterval: 30000,
  });

  // 신고 데이터 조회 (트렌드 분석용)
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports', timeFilter],
    queryFn: () => getReports({ hours: timeFilter, limit: 1000 }),
    refetchInterval: 30000,
  });

  // 차트 데이터 준비
  const severityData = stats?.by_severity ? Object.entries(stats.by_severity).map(([key, value]) => ({
    name: key === 'low' ? '낮음' : key === 'medium' ? '보통' : key === 'high' ? '높음' : '심각',
    value: Number(value),
    color: SEVERITY_COLORS[key as keyof typeof SEVERITY_COLORS]
  })) : [];

  const platformData = stats?.by_platform ? Object.entries(stats.by_platform).map(([key, value]) => ({
    name: key === 'google' ? '구글' : key === 'naver' ? '네이버' : key === 'kakao' ? '카카오' : key,
    value: Number(value),
    color: PLATFORM_COLORS[key as keyof typeof PLATFORM_COLORS]
  })) : [];

  // 시간대별 분포 데이터 (24시간 기준)
  const hourlyData = React.useMemo(() => {
    if (!reports) return [];
    
    const hourCounts = new Array(24).fill(0);
    reports.forEach(report => {
      const hour = new Date(report.created_at).getHours();
      hourCounts[hour]++;
    });
    
    return hourCounts.map((count, hour) => ({
      hour: `${hour}시`,
      count,
      percentage: reports.length > 0 ? (count / reports.length) * 100 : 0
    }));
  }, [reports]);

  // 일별 트렌드 데이터 (최근 7일)
  const dailyTrend = React.useMemo(() => {
    if (!reports) return [];
    
    const today = new Date();
    const dailyCounts = new Array(7).fill(0);
    
    reports.forEach(report => {
      const reportDate = new Date(report.created_at);
      const daysDiff = Math.floor((today.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 7) {
        dailyCounts[6 - daysDiff]++;
      }
    });
    
    return dailyCounts.map((count, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - index));
      return {
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        count,
        accumulated: dailyCounts.slice(0, index + 1).reduce((sum, c) => sum + c, 0)
      };
    });
  }, [reports]);

  // 심각도별 평균 신뢰도
  const confidenceBySevertiy = React.useMemo(() => {
    if (!reports) return [];
    
    const severityGroups = reports.reduce((acc, report) => {
      if (!acc[report.severity]) {
        acc[report.severity] = { total: 0, count: 0 };
      }
      acc[report.severity].total += report.confidence;
      acc[report.severity].count++;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);
    
    return Object.entries(severityGroups).map(([severity, data]) => ({
      severity: severity === 'low' ? '낮음' : severity === 'medium' ? '보통' : 
                severity === 'high' ? '높음' : '심각',
      confidence: (data.total / data.count) * 100,
      count: data.count
    }));
  }, [reports]);

  if (statsLoading || reportsLoading) {
    return <LoadingSpinner text="통계 데이터를 불러오는 중..." />;
  }

  return (
    <StatisticsContainer>
      <PageHeader>
        <PageTitle>📈 통계 분석</PageTitle>
        <TimeFilterSelect
          value={timeFilter}
          onChange={(e) => setTimeFilter(Number(e.target.value))}
        >
          {TIME_FILTERS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TimeFilterSelect>
      </PageHeader>

      <StatsOverview>
        <OverviewCard>
          <OverviewValue>{formatNumber(stats?.total_reports || 0)}</OverviewValue>
          <OverviewLabel>총 신고 건수</OverviewLabel>
        </OverviewCard>
        <OverviewCard>
          <OverviewValue>{formatNumber(stats?.verified_reports || 0)}</OverviewValue>
          <OverviewLabel>검증된 신고</OverviewLabel>
        </OverviewCard>
        <OverviewCard>
          <OverviewValue>
            {stats?.total_reports ? 
              formatPercentage(stats.verified_reports || 0, stats.total_reports) : '0%'}
          </OverviewValue>
          <OverviewLabel>검증률</OverviewLabel>
        </OverviewCard>
        <OverviewCard>
          <OverviewValue>{formatNumber(stats?.pending_reports || 0)}</OverviewValue>
          <OverviewLabel>대기 중</OverviewLabel>
        </OverviewCard>
      </StatsOverview>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>심각도별 분포</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>플랫폼별 분포</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      <TrendSection>
        <FullWidthChart>
          <ChartTitle>일별 신고 트렌드 (최근 7일)</ChartTitle>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="count"
                stackId="1"
                stroke="#e74c3c"
                fill="#e74c3c"
                fillOpacity={0.6}
                name="일별 신고"
              />
              <Line
                type="monotone"
                dataKey="accumulated"
                stroke="#3498db"
                strokeWidth={2}
                name="누적 신고"
              />
            </AreaChart>
          </ResponsiveContainer>
        </FullWidthChart>
      </TrendSection>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>시간대별 신고 분포</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#9b59b6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>심각도별 신뢰도</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceBySevertiy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="severity" />
              <YAxis />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, '평균 신뢰도']} />
              <Bar dataKey="confidence" fill="#f39c12" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      <InsightsSection>
        <InsightCard>
          <InsightTitle>🔍 주요 인사이트</InsightTitle>
          <InsightItem>
            <InsightLabel>가장 활발한 시간대</InsightLabel>
            <InsightValue>
              {hourlyData.length > 0 ? 
                hourlyData.reduce((max, current) => current.count > max.count ? current : max).hour
                : 'N/A'
              }
            </InsightValue>
          </InsightItem>
          <InsightItem>
            <InsightLabel>주요 플랫폼</InsightLabel>
            <InsightValue>
              {platformData.length > 0 ? 
                platformData.reduce((max, current) => current.value > max.value ? current : max).name
                : 'N/A'
              }
            </InsightValue>
          </InsightItem>
          <InsightItem>
            <InsightLabel>평균 신뢰도</InsightLabel>
            <InsightValue>
              {reports && reports.length > 0 ? 
                `${((reports.reduce((sum, r) => sum + r.confidence, 0) / reports.length) * 100).toFixed(1)}%`
                : 'N/A'
              }
            </InsightValue>
          </InsightItem>
        </InsightCard>

        <InsightCard>
          <InsightTitle>📊 데이터 품질</InsightTitle>
          <InsightItem>
            <InsightLabel>검증 완료율</InsightLabel>
            <InsightValue>
              {stats?.total_reports ? 
                formatPercentage(stats.verified_reports || 0, stats.total_reports) : '0%'}
            </InsightValue>
          </InsightItem>
          <InsightItem>
            <InsightLabel>대기 중인 신고</InsightLabel>
            <InsightValue>{formatNumber(stats?.pending_reports || 0)}건</InsightValue>
          </InsightItem>
          <InsightItem>
            <InsightLabel>실시간 연결</InsightLabel>
            <InsightValue>{isConnected ? '🟢 연결됨' : '🔴 끊김'}</InsightValue>
          </InsightItem>
        </InsightCard>
      </InsightsSection>
    </StatisticsContainer>
  );
};

export default StatisticsPage; 