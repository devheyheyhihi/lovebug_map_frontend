import React from 'react';
import styled from 'styled-components';
import { useWebSocket } from '../contexts/WebSocketContext';

const HeaderContainer = styled.header`
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: #e74c3c;
`;

const StatusIndicator = styled.div<{ connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const StatusDot = styled.div<{ connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.connected ? '#27ae60' : '#e74c3c'};
`;

const Header: React.FC = () => {
  const { isConnected } = useWebSocket();

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>🐛 러브버그 맵</Logo>
        <StatusIndicator connected={isConnected}>
          <StatusDot connected={isConnected} />
          {isConnected ? '실시간 연결됨' : '연결 끊김'}
        </StatusIndicator>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;