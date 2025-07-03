import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '../api/lovebugApi';
import { SearchFilter, LovebugReport } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatRelativeTime, formatSeverity, formatPlatform, formatAddress, truncateText } from '../utils/formatters';
import { SEVERITY_COLORS, PLATFORM_COLORS, TIME_FILTERS, SEVERITY_FILTERS, PLATFORM_FILTERS } from '../utils/constants';
import { useWebSocket } from '../contexts/WebSocketContext';

const ReportsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 1.8rem;
`;

const FilterSection = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-weight: bold;
  color: #2c3e50;
  font-size: 0.9rem;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #e74c3c;
  }
`;

const FilterInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #e74c3c;
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.variant === 'primary' ? '#e74c3c' : '#ddd'};
  border-radius: 4px;
  background-color: ${props => props.variant === 'primary' ? '#e74c3c' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#666'};
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? '#c0392b' : '#f8f9fa'};
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ResultsCount = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const SortSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const ReportsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ReportCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e74c3c;
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ReportMeta = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const Badge = styled.span<{ color: string }>`
  background-color: ${props => props.color};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
`;

const ReportContent = styled.div`
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #333;
`;

const ReportFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #666;
  border-top: 1px solid #eee;
  padding-top: 1rem;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#e74c3c' : '#ddd'};
  border-radius: 4px;
  background-color: ${props => props.active ? '#e74c3c' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? '#c0392b' : '#f8f9fa'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ReportsPage: React.FC = () => {
  const [filter, setFilter] = useState<SearchFilter>({
    hours: 24,
    severity: undefined,
    platform: undefined,
    limit: 20,
    offset: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'severity'>('created_at');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', filter, searchTerm, sortBy, currentPage],
    queryFn: () => getReports({
      ...filter,
      offset: (currentPage - 1) * (filter.limit || 20),
      search: searchTerm || undefined
    }),
    refetchInterval: 30000
  });

  const handleFilterChange = (key: keyof SearchFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilter({
      hours: 24,
      severity: undefined,
      platform: undefined,
      limit: 20,
      offset: 0
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((reports?.length || 0) / (filter.limit || 20));

  if (isLoading) {
    return <LoadingSpinner text="신고 목록을 불러오는 중..." />;
  }

  return (
    <ReportsContainer>
      <Header>
        <Title>📋 신고 목록</Title>
      </Header>

      <FilterSection>
        <FilterGrid>
          <FilterGroup>
            <FilterLabel>시간 범위</FilterLabel>
            <FilterSelect
              value={filter.hours}
              onChange={(e) => handleFilterChange('hours', Number(e.target.value))}
            >
              {TIME_FILTERS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>심각도</FilterLabel>
            <FilterSelect
              value={filter.severity || ''}
              onChange={(e) => handleFilterChange('severity', e.target.value || undefined)}
            >
              <option value="">모든 심각도</option>
              {SEVERITY_FILTERS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>플랫폼</FilterLabel>
            <FilterSelect
              value={filter.platform || ''}
              onChange={(e) => handleFilterChange('platform', e.target.value || undefined)}
            >
              <option value="">모든 플랫폼</option>
              {PLATFORM_FILTERS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>검색어</FilterLabel>
            <FilterInput
              type="text"
              placeholder="내용 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FilterGroup>
        </FilterGrid>

        <FilterActions>
          <Button variant="secondary" onClick={handleReset}>
            초기화
          </Button>
          <Button variant="primary" onClick={handleSearch}>
            검색
          </Button>
        </FilterActions>
      </FilterSection>

      <ResultsHeader>
        <ResultsCount>
          총 {reports?.length || 0}개의 신고
        </ResultsCount>
        <SortSelect
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'created_at' | 'severity')}
        >
          <option value="created_at">최신순</option>
          <option value="severity">심각도순</option>
        </SortSelect>
      </ResultsHeader>

      <ReportsList>
        {reports && reports.length > 0 ? (
          reports.map((report) => (
            <ReportCard key={report.id}>
              <ReportHeader>
                <ReportMeta>
                  <Badge color={SEVERITY_COLORS[report.severity]}>
                    {formatSeverity(report.severity)}
                  </Badge>
                  <Badge color={PLATFORM_COLORS[report.platform]}>
                    {report.platform}
                  </Badge>
                </ReportMeta>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                  {formatRelativeTime(report.created_at)}
                </span>
              </ReportHeader>

              <ReportContent>
                {truncateText(report.content, 200)}
              </ReportContent>

              <ReportFooter>
                <LocationInfo>
                  <span>📍</span>
                  <span>{formatAddress(report.location.address)}</span>
                </LocationInfo>
                <div>
                  <span>신뢰도: {(report.confidence * 100).toFixed(0)}%</span>
                </div>
              </ReportFooter>
            </ReportCard>
          ))
        ) : (
          <ReportCard>
            <div style={{ textAlign: 'center', color: '#666' }}>
              조건에 맞는 신고가 없습니다.
            </div>
          </ReportCard>
        )}
      </ReportsList>

      {totalPages > 1 && (
        <Pagination>
          <PageButton
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            이전
          </PageButton>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <PageButton
                key={pageNum}
                active={pageNum === currentPage}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </PageButton>
            );
          })}
          
          <PageButton
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </PageButton>
        </Pagination>
      )}
    </ReportsContainer>
  );
};

export default ReportsPage;