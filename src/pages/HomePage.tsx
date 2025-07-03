import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 1rem;
    min-height: 60vh;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 3rem;
  max-width: 600px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
    padding: 0 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    gap: 0.5rem;
  }
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #e74c3c;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: #c0392b;
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
    justify-content: center;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: #3498db;
  
  &:hover {
    background: #2980b9;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
  max-width: 1200px;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 2rem;
    padding: 0 1rem;
  }
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: left;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const FeatureTitle = styled.h3`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const HomePage: React.FC = () => {
  return (
    <HomeContainer>
      <Title>🐛 러브버그 지도</Title>
      <Subtitle>
        실시간 러브버그 출현 정보를 확인하고 신고할 수 있는 플랫폼입니다.
        커뮤니티와 함께 러브버그 발생 현황을 모니터링하세요.
      </Subtitle>
      
      <ButtonGroup>
        <ActionButton to="/map">
          🗺️ 지도 보기
        </ActionButton>
        <SecondaryButton to="/report">
          📝 신고하기
        </SecondaryButton>
        <SecondaryButton to="/statistics">
          📊 통계 보기
        </SecondaryButton>
      </ButtonGroup>

      <FeatureGrid>
        <FeatureCard>
          <FeatureIcon>🗺️</FeatureIcon>
          <FeatureTitle>실시간 지도</FeatureTitle>
          <FeatureDescription>
            실시간으로 업데이트되는 러브버그 출현 지역을 지도에서 확인하세요.
            심각도별로 색상이 구분되어 한눈에 파악할 수 있습니다.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>📊</FeatureIcon>
          <FeatureTitle>상세 통계</FeatureTitle>
          <FeatureDescription>
            시간대별, 지역별, 심각도별 러브버그 발생 통계를 차트로 확인하세요.
            트렌드 분석을 통해 패턴을 파악할 수 있습니다.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🔥</FeatureIcon>
          <FeatureTitle>핫스팟 분석</FeatureTitle>
          <FeatureDescription>
            러브버그 발생이 집중되는 핫스팟 지역을 식별하고,
            해당 지역의 상세 정보를 제공합니다.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>📱</FeatureIcon>
          <FeatureTitle>쉬운 신고</FeatureTitle>
          <FeatureDescription>
            간단한 양식으로 러브버그 발견 신고를 할 수 있습니다.
            사진과 위치 정보를 포함하여 정확한 정보를 제공하세요.
          </FeatureDescription>
        </FeatureCard>
      </FeatureGrid>
    </HomeContainer>
  );
};

export default HomePage; 