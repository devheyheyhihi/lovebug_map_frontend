import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { getStats, getHotspots } from '../api/lovebugApi';
import { useWebSocket } from '../contexts/WebSocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { SEVERITY_COLORS, PLATFORM_COLORS, TIME_FILTERS } from '../utils/constants';
import { LovebugStats, HotSpot } from '../types';

interface Stats {
  total_reports: number;
  verified_reports: number;
  pending_reports: number;
  by_severity: Record<string, number>;
  by_platform: Record<string, number>;
}

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StatTitle = styled.h3`
  color: #666;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatIcon = styled.div`
  font-size: 1.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
`;

const StatSubtext = styled.div`
  color: #888;
  font-size: 0.85rem;
`;

const StatTrend = styled.div<{ positive: boolean }>`
  color: ${props => props.positive ? '#4caf50' : '#f44336'};
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.5rem;
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
`;

const ChartTitle = styled.h3`
  color: #333;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const BreakdownList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const BreakdownLabel = styled.span`
  font-weight: 500;
  color: #333;
`;

const BreakdownValue = styled.span`
  font-weight: 600;
  color: #666;
`;

const HotspotsSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
`;

const HotspotsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const HotspotItem = styled.div`
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #ff5722;
`;

const HotspotAddress = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const HotspotStats = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.9rem;
`;

const DashboardPage: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState(24);
  const { isConnected } = useWebSocket();

  // 통계 데이터 조회
  const { data: currentStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['stats', timeFilter],
    queryFn: () => getStats({ hours: timeFilter }),
    refetchInterval: 30000, // 30초마다 자동 갱신
  });

  // 핫스팟 데이터 조회
  const { data: hotspots, isLoading: hotspotsLoading, refetch: refetchHotspots } = useQuery({
    queryKey: ['hotspots', timeFilter],
    queryFn: () => getHotspots({ hours: timeFilter, limit: 6 }),
    refetchInterval: 30000,
  });

  if (statsLoading || hotspotsLoading) {
    return <LoadingSpinner text="대시보드 데이터를 불러오는 중..." />;
  }

  const verificationRate = currentStats ? 
    (currentStats.verified_reports / currentStats.total_reports) * 100 : 0;

  return (
    <DashboardContainer>
      <PageTitle>📊 러브버그 대시보드</PageTitle>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatTitle>전체 신고</StatTitle>
            <StatIcon>📊</StatIcon>
          </StatHeader>
          <StatValue>{formatNumber(currentStats?.total_reports || 0)}</StatValue>
          <StatSubtext>지난 {timeFilter}시간</StatSubtext>
          <StatTrend positive={true}>
            {isConnected ? '🟢 실시간 연결됨' : '🔴 연결 끊김'}
          </StatTrend>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>검증된 신고</StatTitle>
            <StatIcon>✅</StatIcon>
          </StatHeader>
          <StatValue>{formatNumber(currentStats?.verified_reports || 0)}</StatValue>
          <StatSubtext>
            검증률: {formatPercentage(currentStats?.verified_reports || 0, currentStats?.total_reports || 1)}
          </StatSubtext>
          <StatTrend positive={verificationRate > 70}>
            {verificationRate > 70 ? '📈 양호' : '📉 주의'}
          </StatTrend>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>대기 중인 신고</StatTitle>
            <StatIcon>⏳</StatIcon>
          </StatHeader>
          <StatValue>{formatNumber(currentStats?.pending_reports || 0)}</StatValue>
          <StatSubtext>검증 대기 중</StatSubtext>
          <StatTrend positive={false}>
            처리 필요
          </StatTrend>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>주요 플랫폼</StatTitle>
            <StatIcon>🌐</StatIcon>
          </StatHeader>
          <StatValue>
            {currentStats?.by_platform ? 
              Object.entries(currentStats.by_platform)
                .sort(([,a], [,b]) => Number(b) - Number(a))[0]?.[0] || 'N/A'
              : 'N/A'
            }
          </StatValue>
          <StatSubtext>
            {currentStats?.by_platform ? 
              formatNumber(Math.max(...Object.values(currentStats.by_platform).map(v => Number(v))))
              : 0
            } 건
          </StatSubtext>
        </StatCard>
      </StatsGrid>

      <ChartsSection>
        <ChartCard>
          <ChartTitle>심각도별 분포</ChartTitle>
            <BreakdownList>
            {currentStats?.by_severity && Object.entries(currentStats.by_severity).map(([severity, count]) => (
                <BreakdownItem key={severity}>
                  <BreakdownLabel>
                    {severity === 'low' ? '낮음' : 
                     severity === 'medium' ? '보통' : 
                     severity === 'high' ? '높음' : '심각'}
                  </BreakdownLabel>
                  <BreakdownValue>
                  {String(count)} ({formatPercentage(Number(count), currentStats.total_reports)})
                  </BreakdownValue>
                </BreakdownItem>
              ))}
            </BreakdownList>
        </ChartCard>

        <ChartCard>
          <ChartTitle>플랫폼별 분포</ChartTitle>
            <BreakdownList>
            {currentStats?.by_platform && Object.entries(currentStats.by_platform).map(([platform, count]) => (
                <BreakdownItem key={platform}>
                  <BreakdownLabel>
                  {platform === 'google' ? '구글' : 
                     platform === 'naver' ? '네이버' : '카카오'}
                  </BreakdownLabel>
                  <BreakdownValue>
                  {String(count)} ({formatPercentage(Number(count), currentStats.total_reports)})
                  </BreakdownValue>
                </BreakdownItem>
              ))}
            </BreakdownList>
        </ChartCard>
      </ChartsSection>

      <HotspotsSection>
        <ChartTitle>🔥 주요 핫스팟</ChartTitle>
        <HotspotsList>
          {hotspots?.map((hotspot) => (
            <HotspotItem key={hotspot.id}>
              <HotspotAddress>{hotspot.address}</HotspotAddress>
              <HotspotStats>
                <span>신고 {hotspot.report_count}건</span>
                <span>반경 {hotspot.radius}m</span>
              </HotspotStats>
            </HotspotItem>
          ))}
        </HotspotsList>
      </HotspotsSection>
    </DashboardContainer>
  );
};

export default DashboardPage;