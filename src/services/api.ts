import axios from 'axios';
import { ChatRequest, ChatResponse } from '../types/chat';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatApi = {
  /**
   * Send a message to the chatbot API
   * @param request The chat request containing messages
   * @returns Promise with the chat response
   */
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    try {
      const response = await api.post<ChatResponse>('/chat', request);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Stream a message from the chatbot API
   * @param request The chat request containing messages
   * @param onChunk Callback function for each chunk of the stream
   * @returns Promise that resolves when the stream is complete
   */
  streamMessage: async (
    request: ChatRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    try {
      const response = await api.post('/chat/stream', request, {
        responseType: 'stream',
        onDownloadProgress: (progressEvent) => {
          const chunk = progressEvent.event.target?.response;
          if (chunk) {
            onChunk(chunk);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error streaming message:', error);
      throw error;
    }
  },
};

export default api;
