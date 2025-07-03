import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { getHotspots } from '../api/lovebugApi';
import { useWebSocket } from '../contexts/WebSocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MapView from '../components/MapView';
import { HotSpot } from '../types';
import { TIME_FILTERS } from '../utils/constants';
import { formatNumber, formatRelativeTime } from '../utils/formatters';

const HotspotsContainer = styled.div`
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

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
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

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  height: 600px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const MapSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    height: 400px;
  }
  
  @media (max-width: 768px) {
    height: 300px;
  }
`;

const HotspotsList = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    height: 400px;
  }
  
  @media (max-width: 768px) {
    height: 300px;
  }
`;

const ListTitle = styled.h3`
  color: #333;
  margin: 0 0 1rem 0;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  font-size: 1.1rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1rem;
  }
`;

const HotspotItem = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HotspotHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const HotspotTitle = styled.h3`
  color: #333;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const HotspotInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const ReportCount = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #e74c3c;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const LastActivity = styled.span`
  color: #666;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const HotspotDetails = styled.div`
  color: #666;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const HotspotAddress = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const SeverityDistribution = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const SeverityBadge = styled.span<{ severity: string }>`
  background: ${props => {
    switch (props.severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      default: return '#666';
    }
  }};
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 500;
`;

const HotspotsPage: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState(24);
  const [selectedHotspot, setSelectedHotspot] = useState<HotSpot | null>(null);
  const { isConnected } = useWebSocket();

  // 핫스팟 데이터 조회
  const { data: hotspots, isLoading } = useQuery({
    queryKey: ['hotspots', timeFilter],
    queryFn: () => getHotspots({ hours: timeFilter, limit: 50 }),
    refetchInterval: 30000,
  });

  const handleHotspotClick = (hotspot: HotSpot) => {
    setSelectedHotspot(hotspot);
  };

  const totalReports = hotspots?.reduce((sum, hotspot) => sum + hotspot.report_count, 0) || 0;
  const avgReportsPerHotspot = hotspots?.length ? Math.round(totalReports / hotspots.length) : 0;
  const mostActiveHotspot = hotspots?.reduce((max, current) => 
    current.report_count > max.report_count ? current : max
  , hotspots[0]);

  if (isLoading) {
    return <LoadingSpinner text="핫스팟 데이터를 불러오는 중..." />;
  }

  return (
    <HotspotsContainer>
      <PageHeader>
        <PageTitle>🔥 핫스팟 분석</PageTitle>
        <FilterSection>
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
        </FilterSection>
      </PageHeader>

      <StatsOverview>
        <StatCard>
          <StatValue>{formatNumber(hotspots?.length || 0)}</StatValue>
          <StatLabel>총 핫스팟 수</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{formatNumber(totalReports)}</StatValue>
          <StatLabel>총 신고 건수</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{avgReportsPerHotspot}</StatValue>
          <StatLabel>평균 신고/핫스팟</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{mostActiveHotspot?.report_count || 0}</StatValue>
          <StatLabel>최고 신고 건수</StatLabel>
        </StatCard>
      </StatsOverview>

      <ContentGrid>
        <MapSection>
          <MapView
            reports={[]}
            hotspots={hotspots || []}
            showHotspots={true}
            onReportClick={() => {}}
            onHotspotClick={handleHotspotClick}
            center={selectedHotspot ? {
              lat: selectedHotspot.location.latitude,
              lng: selectedHotspot.location.longitude
            } : undefined}
            zoom={selectedHotspot ? 14 : 12}
          />
        </MapSection>

        <HotspotsList>
          <ListTitle>핫스팟 목록 ({hotspots?.length || 0}개)</ListTitle>
          {hotspots?.map((hotspot) => (
            <HotspotItem
              key={hotspot.id}
              onClick={() => handleHotspotClick(hotspot)}
            >
              <HotspotHeader>
                <HotspotTitle>🔥 핫스팟</HotspotTitle>
                <ReportCount>
                  {hotspot.report_count}건
                </ReportCount>
              </HotspotHeader>
              
              <HotspotAddress>
                {hotspot.location.address || hotspot.location.district || '위치 정보 없음'}
              </HotspotAddress>
              
              {hotspot.severity_distribution && (
                <SeverityDistribution>
                  {hotspot.severity_distribution.critical > 0 && (
                    <SeverityBadge severity="critical">
                      심각 {hotspot.severity_distribution.critical}
                    </SeverityBadge>
                  )}
                  {hotspot.severity_distribution.high > 0 && (
                    <SeverityBadge severity="high">
                      높음 {hotspot.severity_distribution.high}
                    </SeverityBadge>
                  )}
                  {hotspot.severity_distribution.medium > 0 && (
                    <SeverityBadge severity="medium">
                      보통 {hotspot.severity_distribution.medium}
                    </SeverityBadge>
                  )}
                  {hotspot.severity_distribution.low > 0 && (
                    <SeverityBadge severity="low">
                      낮음 {hotspot.severity_distribution.low}
                    </SeverityBadge>
                  )}
                </SeverityDistribution>
              )}
              
              <HotspotDetails>
                <span>반경: {hotspot.radius}m</span>
                <span>{formatRelativeTime(hotspot.last_activity)}</span>
              </HotspotDetails>
            </HotspotItem>
          ))}
          
          {!hotspots?.length && (
            <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              선택한 기간에 핫스팟이 없습니다.
            </div>
          )}
        </HotspotsList>
      </ContentGrid>
    </HotspotsContainer>
  );
};

export default HotspotsPage; 