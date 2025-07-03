import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { getReports, getHotspots } from '../api/lovebugApi';
import { useWebSocket } from '../contexts/WebSocketContext';
import MapView from '../components/MapView';
import LoadingSpinner from '../components/LoadingSpinner';
import { LovebugReport, HotSpot, SearchFilter } from '../types';

const MapContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.div`
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #ff5722;
  }
`;

const FilterInput = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #ff5722;
  }
`;

const StatusBar = styled.div`
  background: #f8f9fa;
  padding: 0.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ConnectionStatus = styled.div<{ connected: boolean }>`
  color: ${props => props.connected ? '#4caf50' : '#f44336'};
  font-weight: 600;
`;

const MapContent = styled.div`
  flex: 1;
  position: relative;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const MapPage: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilter>({
    hours: 24,
    severity: undefined,
    platform: undefined,
    search: '',
    limit: 100,
    offset: 0,
  });

  const { isConnected } = useWebSocket();

  // 신고 데이터 조회
  const { data: reports, isLoading: reportsLoading, refetch: refetchReports } = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => getReports(filters),
    refetchInterval: 30000, // 30초마다 자동 갱신
  });

  // 핫스팟 데이터 조회
  const { data: hotspots, isLoading: hotspotsLoading, refetch: refetchHotspots } = useQuery({
    queryKey: ['hotspots', filters],
    queryFn: () => getHotspots({ 
      hours: filters.hours, 
      limit: 20 
    }),
    refetchInterval: 30000,
  });

  const handleFilterChange = (key: keyof SearchFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const handleReportClick = (report: LovebugReport) => {
    console.log('신고 클릭:', report);
    // 신고 상세 정보 표시 로직
  };

  const handleHotspotClick = (hotspot: HotSpot) => {
    console.log('핫스팟 클릭:', hotspot);
    // 핫스팟 상세 정보 표시 로직
  };

  if (reportsLoading || hotspotsLoading) {
    return (
      <MapContainer>
        <Header>
          <Title>🗺️ 러브버그 지도</Title>
        </Header>
        <LoadingContainer>
          <LoadingSpinner text="지도 데이터를 불러오는 중..." />
        </LoadingContainer>
      </MapContainer>
    );
  }

  return (
    <MapContainer>
      <Header>
        <Title>🗺️ 러브버그 지도</Title>
        <FilterContainer>
          <FilterSelect
            value={filters.hours || ''}
            onChange={(e) => handleFilterChange('hours', Number(e.target.value))}
          >
            <option value="">전체 기간</option>
            <option value={1}>최근 1시간</option>
            <option value={6}>최근 6시간</option>
            <option value={24}>최근 24시간</option>
            <option value={168}>최근 1주일</option>
          </FilterSelect>
          
          <FilterSelect
            value={filters.severity || ''}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
          >
            <option value="">모든 심각도</option>
            <option value="low">낮음</option>
            <option value="medium">보통</option>
            <option value="high">높음</option>
            <option value="critical">심각</option>
          </FilterSelect>
          
          <FilterSelect
            value={filters.platform || ''}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
          >
            <option value="">모든 플랫폼</option>
            <option value="google">구글</option>
            <option value="naver">네이버</option>
            <option value="kakao">카카오</option>
          </FilterSelect>
          
          <FilterInput
            type="text"
            placeholder="주소 검색..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </FilterContainer>
      </Header>

      <StatusBar>
        <StatusItem>
          <span>신고 수: {reports?.length || 0}건</span>
          <span>핫스팟: {hotspots?.length || 0}개</span>
        </StatusItem>
        <StatusItem>
          <ConnectionStatus connected={isConnected}>
            {isConnected ? '🟢 실시간 연결됨' : '🔴 연결 끊김'}
          </ConnectionStatus>
        </StatusItem>
      </StatusBar>

      <MapContent>
        <MapView
          reports={reports || []}
          hotspots={hotspots || []}
          showHotspots={true}
          onReportClick={handleReportClick}
          onHotspotClick={handleHotspotClick}
        />
      </MapContent>
    </MapContainer>
  );
};

export default MapPage;