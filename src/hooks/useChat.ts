import { useState, useCallback, useEffect } from 'react';
import { Message, MessageRole, ChatSession } from '../types/chat';
import { chatApi } from '../services/api';
import { createMessage, generateTitleFromContent } from '../utils/chatUtils';
import { v4 as uuidv4 } from 'uuid';

interface UseChatOptions {
  initialMessages?: Message[];
  onError?: (error: Error) => void;
  sessionId?: string;
}

export const useChat = (options: UseChatOptions = {}) => {
  const { initialMessages = [], onError, sessionId = uuidv4() } = options;
  
  // State for the current chat session
  const [session, setSession] = useState<ChatSession>({
    id: sessionId,
    title: 'New Chat',
    messages: initialMessages,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Loading state for API calls
  const [isLoading, setIsLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<Error | null>(null);

  // Function to add a message to the chat
  const addMessage = useCallback((role: MessageRole, content: string) => {
    const newMessage = createMessage(role, content);
    
    setSession(prev => {
      // If this is the first user message, generate a title
      let newTitle = prev.title;
      if (role === MessageRole.USER && prev.messages.length === 0) {
        newTitle = generateTitleFromContent(content);
      }
      
      return {
        ...prev,
        title: newTitle,
        messages: [...prev.messages, newMessage],
        updatedAt: new Date()
      };
    });
    
    return newMessage;
  }, []);

  // Function to send a message to the API
  const sendMessage = useCallback(async (content: string) => {
    try {
      // Add user message to the chat
      addMessage(MessageRole.USER, content);
      
      setIsLoading(true);
      setError(null);
      
      // Prepare the request with all previous messages for context
      const messages = [
        ...session.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: MessageRole.USER, content }
      ];
      
      // Send the request to the API
      const response = await chatApi.sendMessage({ messages });
      
      // Add the assistant's response to the chat
      addMessage(MessageRole.ASSISTANT, response.message.content);
      
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [session.messages, addMessage, onError]);

  // Function to clear the chat
  const clearChat = useCallback(() => {
    setSession({
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }, []);

  // Save chat sessions to local storage
  useEffect(() => {
    try {
      // Only save if we have messages
      if (session.messages.length > 0) {
        // Get existing sessions
        const savedSessionsJson = localStorage.getItem('chat_sessions');
        const savedSessions = savedSessionsJson 
          ? JSON.parse(savedSessionsJson) 
          : {};
        
        // Update the current session
        savedSessions[session.id] = {
          ...session,
          messages: session.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          }))
        };
        
        // Save back to local storage
        localStorage.setItem('chat_sessions', JSON.stringify(savedSessions));
      }
    } catch (err) {
      console.error('Failed to save chat session:', err);
    }
  }, [session]);

  return {
    messages: session.messages,
    isLoading,
    error,
    sendMessage,
    addMessage,
    clearChat,
    session,
    setSession
  };
};

export default useChat;
