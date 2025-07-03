import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { WebSocketManager } from '../utils/websocket';
import { WEBSOCKET_URL } from '../utils/constants';
import { LovebugReport, LovebugStats } from '../types';

interface WebSocketContextType {
  isConnected: boolean;
  newReport: LovebugReport | null;
  statsUpdate: LovebugStats | null;
  subscribe: (type: string, callback: (data: any) => void) => void;
  unsubscribe: (type: string, callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [wsManager] = useState(() => new WebSocketManager(WEBSOCKET_URL));
  const [isConnected, setIsConnected] = useState(false);
  const [newReport, setNewReport] = useState<LovebugReport | null>(null);
  const [statsUpdate, setStatsUpdate] = useState<LovebugStats | null>(null);

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await wsManager.connect();
        setIsConnected(true);

        // 새로운 신고 수신
        wsManager.subscribe('new_report', (data: LovebugReport) => {
          setNewReport(data);
          // 3초 후 알림 제거
          setTimeout(() => setNewReport(null), 3000);
        });

        // 통계 업데이트 수신
        wsManager.subscribe('stats_update', (data: LovebugStats) => {
          setStatsUpdate(data);
        });

      } catch (error) {
        // WebSocket 연결 실패를 조용히 처리 (개발 환경에서는 정상적인 상황)
        console.log('WebSocket 연결 실패 - 실시간 기능이 비활성화됩니다.');
        setIsConnected(false);
      }
    };

    connectWebSocket();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      wsManager.disconnect();
    };
  }, [wsManager]);

  const subscribe = (type: string, callback: (data: any) => void) => {
    wsManager.subscribe(type, callback);
  };

  const unsubscribe = (type: string, callback: (data: any) => void) => {
    wsManager.unsubscribe(type, callback);
  };

  const value: WebSocketContextType = {
    isConnected,
    newReport,
    statsUpdate,
    subscribe,
    unsubscribe
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};