import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import StatisticsPage from './pages/StatisticsPage';
import DashboardPage from './pages/DashboardPage';
import ReportPage from './pages/ReportPage';
import ReportsPage from './pages/ReportsPage';
import HotspotsPage from './pages/HotspotsPage';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <WebSocketProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/map" element={<Layout><MapPage /></Layout>} />
                <Route path="/statistics" element={<Layout><StatisticsPage /></Layout>} />
                <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
                <Route path="/report" element={<Layout><ReportPage /></Layout>} />
                <Route path="/reports" element={<Layout><ReportsPage /></Layout>} />
                <Route path="/hotspots" element={<Layout><HotspotsPage /></Layout>} />
              </Routes>
            </Router>
          </WebSocketProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;