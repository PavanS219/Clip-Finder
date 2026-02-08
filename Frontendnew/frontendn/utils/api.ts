import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SearchResult {
  timestamp: number;
  text: string;
  score: number;
  frame_url?: string;
}

export interface ProcessingStatus {
  status: 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
}

export const uploadVideo = async (file: File): Promise<{ video_id: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const uploadYouTubeUrl = async (url: string): Promise<{ video_id: string }> => {
  const response = await api.post(`/upload-url?url=${encodeURIComponent(url)}`);
  return response.data;
};

export const getProcessingStatus = async (videoId: string): Promise<ProcessingStatus> => {
  const response = await api.get(`/status/${videoId}`);
  return response.data;
};

export const searchVideo = async (videoId: string, query: string): Promise<{ results: SearchResult[] }> => {
  const response = await api.post('/search', {
    video_id: videoId,
    query: query,
  });
  return response.data;
};

export const createClip = async (
  videoId: string,
  startTime: number,
  endTime: number
): Promise<{ clip_url: string }> => {
  const response = await api.post('/create-clip', {
    video_id: videoId,
    start_time: startTime,
    end_time: endTime,
  });
  return response.data;
};

export const getVideoUrl = (videoId: string): string => {
  return `${API_BASE_URL}/video/${videoId}`;
};

export const getClipDownloadUrl = (clipUrl: string): string => {
  return `${API_BASE_URL}${clipUrl}`;
};

export const deleteVideo = async (videoId: string): Promise<void> => {
  await api.delete(`/video/${videoId}`);
};

export default api;
