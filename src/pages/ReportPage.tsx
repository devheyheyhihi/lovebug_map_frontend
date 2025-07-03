import React, { useState } from 'react';
import styled from 'styled-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReport } from '../api/lovebugApi';
import { useWebSocket } from '../contexts/WebSocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { LovebugReport } from '../types';

const ReportContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
`;

const Form = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #ff5722;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #ff5722;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #ff5722;
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #ff5722;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #ff5722;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #e64a19;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: #4caf50;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const ReportPage: React.FC = () => {
  const [formData, setFormData] = useState({
    address: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    platform: 'google' as 'google' | 'naver' | 'kakao',
    description: '',
    photos: null as FileList | null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { isConnected } = useWebSocket();
  const queryClient = useQueryClient();

  const createReportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      setSuccess(true);
      setError('');
      setFormData({
        address: '',
        severity: 'medium',
        platform: 'google',
        description: '',
        photos: null,
      });
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['hotspots'] });
    },
    onError: (error: Error) => {
      setError(error.message || '신고 제출 중 오류가 발생했습니다.');
      setSuccess(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.address.trim()) {
      setError('주소를 입력해주세요.');
      return;
    }

    if (!formData.description.trim()) {
      setError('상세 설명을 입력해주세요.');
      return;
    }

    const reportData: Omit<LovebugReport, 'id' | 'reported_at' | 'verified' | 'verification_count'> = {
      content: formData.description,
      description: formData.description,
      location: {
        latitude: 37.5665, // 임시 좌표 (실제로는 주소를 좌표로 변환해야 함)
        longitude: 126.9780,
        address: formData.address,
      },
      address: formData.address,
      severity: formData.severity,
      platform: formData.platform,
      created_at: new Date().toISOString(),
      keywords: ['러브버그', '신고'],
      confidence: 0.8,
      sentiment: 0.0,
      intensity: formData.severity,
      relevance: 0.9,
      photos: formData.photos ? Array.from(formData.photos).map(file => file.name) : [],
    };

    createReportMutation.mutate(reportData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      photos: e.target.files
    }));
  };

  return (
    <ReportContainer>
      <PageTitle>🐛 러브버그 신고하기</PageTitle>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="address">발견 위치 *</Label>
          <Input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="예: 서울시 강남구 역삼동 123-45"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="severity">심각도 *</Label>
          <Select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleInputChange}
            required
          >
            <option value="low">낮음 - 소수 발견</option>
            <option value="medium">보통 - 일반적인 수준</option>
            <option value="high">높음 - 많은 수의 발견</option>
            <option value="critical">심각 - 대량 발견</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="platform">발견 플랫폼 *</Label>
          <Select
            id="platform"
            name="platform"
            value={formData.platform}
            onChange={handleInputChange}
            required
          >
            <option value="google">구글 맵</option>
            <option value="naver">네이버 맵</option>
            <option value="kakao">카카오 맵</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">상세 설명 *</Label>
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="러브버그 발견 상황을 자세히 설명해주세요..."
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="photos">사진 첨부 (선택)</Label>
          <FileInput
            id="photos"
            name="photos"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            multiple
          />
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>신고가 성공적으로 제출되었습니다!</SuccessMessage>}

        <SubmitButton 
          type="submit" 
          disabled={createReportMutation.isPending}
        >
          {createReportMutation.isPending ? '제출 중...' : '신고 제출'}
        </SubmitButton>
      </Form>

      {!isConnected && (
        <ErrorMessage style={{ textAlign: 'center', marginTop: '1rem' }}>
          🔴 실시간 연결이 끊어졌습니다. 신고는 여전히 가능합니다.
        </ErrorMessage>
      )}
    </ReportContainer>
  );
};

export default ReportPage; 