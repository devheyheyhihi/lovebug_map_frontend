import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useWebSocket } from '../contexts/WebSocketContext';
import { formatRelativeTime, formatSeverity, formatAddress } from '../utils/formatters';
import { SEVERITY_COLORS } from '../utils/constants';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  
  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

const Toast = styled.div<{ severity: string; isExiting?: boolean }>`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-left: 4px solid ${props => SEVERITY_COLORS[props.severity as keyof typeof SEVERITY_COLORS]};
  animation: ${props => props.isExiting ? slideOut : slideIn} 0.3s ease-out;
`;

const ToastHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ToastTitle = styled.h4`
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
`;

const SeverityBadge = styled.span<{ severity: string }>`
  background-color: ${props => SEVERITY_COLORS[props.severity as keyof typeof SEVERITY_COLORS]};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
`;

const ToastContent = styled.div`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ToastMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #999;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  
  &:hover {
    color: #666;
  }
`;

const NotificationToast: React.FC = () => {
  const { newReport } = useWebSocket();
  const [isExiting, setIsExiting] = React.useState(false);

  useEffect(() => {
    if (newReport) {
      setIsExiting(false);
      // 2.5초 후 종료 애니메이션 시작
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [newReport]);

  const handleClose = () => {
    setIsExiting(true);
  };

  if (!newReport) return null;

  return (
    <ToastContainer>
      <Toast severity={newReport.severity} isExiting={isExiting}>
        <ToastHeader>
          <ToastTitle>🐛 새로운 러브버그 신고</ToastTitle>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </ToastHeader>
        <ToastContent>
          <div>{newReport.content}</div>
          <ToastMeta>
            <span>{formatAddress(newReport.location.address)}</span>
            <SeverityBadge severity={newReport.severity}>
              {formatSeverity(newReport.severity)}
            </SeverityBadge>
          </ToastMeta>
          <ToastMeta>
            <span>{formatRelativeTime(newReport.created_at)}</span>
            <span>{newReport.platform}</span>
          </ToastMeta>
        </ToastContent>
      </Toast>
    </ToastContainer>
  );
};

export default NotificationToast;