import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { LovebugReport, HotSpot } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  reports: LovebugReport[];
  hotspots: HotSpot[];
  showHotspots: boolean;
  onReportClick: (report: LovebugReport) => void;
  onHotspotClick: (hotspot: HotSpot) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
  font-size: 18px;
  font-weight: 500;
`;

const MarkerList = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  min-width: 200px;
  z-index: 1000;
`;

const MarkerItem = styled.div<{ severity: string }>`
  padding: 8px;
  margin: 4px 0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  background: ${props => {
    switch (props.severity) {
      case 'critical': return '#ffebee';
      case 'high': return '#fff3e0';
      case 'medium': return '#fff8e1';
      case 'low': return '#f3e5f5';
      default: return '#f5f5f5';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#7b1fa2';
      default: return '#757575';
    }
  }};
  
  &:hover {
    opacity: 0.8;
  }
`;

const HotspotItem = styled.div`
  padding: 8px;
  margin: 4px 0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  background: #ffebee;
  border-left: 4px solid #d32f2f;
  
  &:hover {
    opacity: 0.8;
  }
`;

// Leaflet 기본 아이콘 설정
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapView: React.FC<MapViewProps> = ({
  reports,
  hotspots,
  showHotspots,
  onReportClick,
  onHotspotClick,
  center = { lat: 37.5665, lng: 126.9780 },
  zoom = 12,
  className
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef<L.Marker[]>([]);
  const circlesRef = useRef<L.Circle[]>([]);

  // 지도 초기화
  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined' || !mapRef.current) return;

    try {
      // 지도 생성
      const mapInstance = L.map(mapRef.current).setView([center.lat, center.lng], zoom);

      // 타일 레이어 추가
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);

      // 지도가 완전히 로드되었을 때 이벤트 리스너 추가
      mapInstance.whenReady(() => {
        setTimeout(() => {
          setMapReady(true);
        }, 500); // 추가 지연
      });

      setMap(mapInstance);
      setIsLoading(false);

      // 컴포넌트 언마운트 시 지도 정리
      return () => {
        mapInstance.remove();
      };
    } catch (error) {
      console.error('지도 초기화 실패:', error);
      setIsLoading(false);
    }
  }, [center.lat, center.lng, zoom]);

  // 마커 추가 함수
  const addMarkers = useCallback(() => {
    if (!map || !mapReady) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => {
      try {
        map.removeLayer(marker);
      } catch (e) {
        console.warn('마커 제거 실패:', e);
      }
    });
    markersRef.current = [];

    // 신고 마커 추가
    reports.forEach(report => {
      try {
        const colors = {
          low: '#7b1fa2',
          medium: '#fbc02d',
          high: '#f57c00',
          critical: '#d32f2f'
        };

        const icon = L.divIcon({
          html: `<div style="
            background-color: ${colors[report.severity as keyof typeof colors] || '#757575'};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([report.location.latitude, report.location.longitude], { icon });
        
        marker.bindPopup(`
          <div>
            <h4>${getSeverityText(report.severity)} | ${getPlatformText(report.platform)}</h4>
            <p>${report.content}</p>
            <p><strong>위치:</strong> ${report.location.address}</p>
            <p><strong>시간:</strong> ${new Date(report.created_at).toLocaleString()}</p>
            <p><strong>신뢰도:</strong> ${(report.confidence * 100).toFixed(0)}%</p>
          </div>
        `);

        marker.on('click', () => {
          onReportClick(report);
        });

        marker.addTo(map);
        markersRef.current.push(marker);
      } catch (error) {
        console.warn('마커 추가 실패:', error);
      }
    });
  }, [map, reports, mapReady, onReportClick]);

  // 핫스팟 추가 함수
  const addHotspots = useCallback(() => {
    if (!map || !showHotspots || !mapReady) return;

    // 기존 원형 제거
    circlesRef.current.forEach(circle => {
      try {
        map.removeLayer(circle);
      } catch (e) {
        console.warn('원형 제거 실패:', e);
      }
    });
    circlesRef.current = [];

    // 핫스팟 원형 추가
    hotspots.forEach(hotspot => {
      try {
        const color = getHotspotColor(hotspot.report_count);
        
        const circle = L.circle([hotspot.location.latitude, hotspot.location.longitude], {
          color: color,
          fillColor: color,
          fillOpacity: 0.3,
          radius: hotspot.radius,
          weight: 2
        });

        circle.bindPopup(`
          <div>
            <h4>🔥 핫스팟 (${hotspot.report_count}건)</h4>
            <p><strong>위치:</strong> ${hotspot.location.address || hotspot.location.district || '위치 정보 없음'}</p>
            <p><strong>최근 활동:</strong> ${new Date(hotspot.last_activity).toLocaleString()}</p>
            <p><strong>반경:</strong> ${hotspot.radius}m</p>
            ${hotspot.severity_distribution ? `
              <div>
                <strong>심각도 분포:</strong>
                <ul style="margin: 5px 0; padding-left: 20px;">
                  <li>심각: ${hotspot.severity_distribution.critical}건</li>
                  <li>높음: ${hotspot.severity_distribution.high}건</li>
                  <li>보통: ${hotspot.severity_distribution.medium}건</li>
                  <li>낮음: ${hotspot.severity_distribution.low}건</li>
                </ul>
              </div>
            ` : ''}
          </div>
        `);

        circle.on('click', () => {
          onHotspotClick(hotspot);
        });

        circle.addTo(map);
        circlesRef.current.push(circle);
      } catch (error) {
        console.warn('핫스팟 추가 실패:', error);
      }
    });
  }, [map, hotspots, showHotspots, mapReady, onHotspotClick]);

  // 마커 추가 effect
  useEffect(() => {
    if (mapReady) {
      setTimeout(addMarkers, 100);
    }
  }, [addMarkers, mapReady]);

  // 핫스팟 추가 effect
  useEffect(() => {
    if (mapReady) {
      setTimeout(addHotspots, 100);
    }
  }, [addHotspots, mapReady]);

  const handleReportClick = useCallback((report: LovebugReport) => {
    if (map) {
      map.setView([report.location.latitude, report.location.longitude], 15);
    }
    onReportClick(report);
  }, [map, onReportClick]);

  const handleHotspotClick = useCallback((hotspot: HotSpot) => {
    if (map) {
      map.setView([hotspot.location.latitude, hotspot.location.longitude], 14);
    }
    onHotspotClick(hotspot);
  }, [map, onHotspotClick]);

  const getSeverityText = (severity: string): string => {
    switch (severity) {
      case 'critical': return '심각';
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '알 수 없음';
    }
  };

  const getPlatformText = (platform: string): string => {
    switch (platform) {
      case 'google': return '구글';
      case 'naver': return '네이버';
      case 'kakao': return '카카오';
      case 'twitter': return '트위터';
      default: return platform;
    }
  };

  const getHotspotColor = (reportCount: number): string => {
    if (reportCount >= 20) return '#d32f2f';
    if (reportCount >= 10) return '#f57c00';
    if (reportCount >= 5) return '#fbc02d';
    return '#7b1fa2';
  };

  if (isLoading) {
    return (
      <MapWrapper>
        <LoadingContainer>
          🗺️ 지도를 불러오는 중...
          <div style={{ fontSize: '14px', marginTop: '10px' }}>
            잠시만 기다려주세요
          </div>
        </LoadingContainer>
      </MapWrapper>
    );
  }

  return (
    <MapWrapper>
      <MapContainer ref={mapRef} />
      
      {!mapReady && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}>
          🗺️ 지도 초기화 중...
        </div>
      )}
      
      {mapReady && (reports.length > 0 || (showHotspots && hotspots.length > 0)) && (
        <MarkerList>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>지도 마커</h4>
          
          {reports.map((report) => (
            <MarkerItem
              key={report.id}
              severity={report.severity}
              onClick={() => handleReportClick(report)}
            >
              <div style={{ fontWeight: 'bold' }}>
                {getSeverityText(report.severity)} | {getPlatformText(report.platform)}
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                {report.location.address}
              </div>
              <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                {new Date(report.created_at).toLocaleString()}
              </div>
            </MarkerItem>
          ))}

          {showHotspots && hotspots.map((hotspot, index) => (
            <HotspotItem
              key={index}
              onClick={() => handleHotspotClick(hotspot)}
            >
              <div style={{ fontWeight: 'bold' }}>
                🔥 핫스팟 ({hotspot.report_count}건)
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                {hotspot.location.address || hotspot.location.district || '위치 정보 없음'}
              </div>
              <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                최근: {new Date(hotspot.last_activity).toLocaleString()}
              </div>
            </HotspotItem>
          ))}
        </MarkerList>
      )}
    </MapWrapper>
  );
};

export default MapView;