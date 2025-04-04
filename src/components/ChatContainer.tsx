import React, { useRef, useEffect, useState } from 'react';
import { Box, Flex, Text, Spinner, Center } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatSidebar from './ChatSidebar';
import { Message, ChatSession, MessageRole } from '../types/chat';
import useChat from '../hooks/useChat';
import { v4 as uuidv4 } from 'uuid';

const MotionBox = motion(Box);

interface ChatContainerProps {
  initialMessages?: Message[];
}

const ChatContainer: React.FC<ChatContainerProps> = ({ initialMessages = [] }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(uuidv4());
  
  // Initialize chat with the current session
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    error, 
    clearChat,
    session,
    setSession
  } = useChat({ 
    initialMessages,
    sessionId: currentSessionId
  });
  
  // Load saved sessions from localStorage on mount
  useEffect(() => {
    try {
      const savedSessionsJson = localStorage.getItem('chat_sessions');
      if (savedSessionsJson) {
        const savedSessions = JSON.parse(savedSessionsJson) as Record<string, ChatSession>;
        // Convert the object of sessions to an array
        const sessionsArray = Object.values(savedSessions).map((session: any) => ({
          ...session,
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt)
        }));
        
        setSessions(sessionsArray as ChatSession[]);
        
        // If there are sessions, set the most recent one as current
        if (sessionsArray.length > 0) {
          const mostRecent = sessionsArray.sort((a: any, b: any) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          
          setCurrentSessionId(mostRecent.id);
          setSession(mostRecent as ChatSession);
        }
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    }
  }, []);
  
  // Update sessions when the current session changes
  useEffect(() => {
    if (session && session.messages.length > 0) {
      setSessions(prev => {
        const existingIndex = prev.findIndex(s => s.id === session.id);
        if (existingIndex >= 0) {
          // Update existing session
          const updated = [...prev];
          updated[existingIndex] = session;
          return updated;
        } else {
          // Add new session
          return [...prev, session];
        }
      });
      
      // Save to localStorage
      try {
        const sessionsObj = sessions.reduce((acc: Record<string, ChatSession>, session) => {
          return { ...acc, [session.id]: session };
        }, {});
        
        // Add or update the current session
        sessionsObj[session.id] = session;
        
        localStorage.setItem('chat_sessions', JSON.stringify(sessionsObj));
      } catch (err) {
        console.error('Failed to save chat sessions:', err);
      }
    }
  }, [session]);
  
  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle session selection
  const handleSelectSession = (sessionId: string) => {
    const selectedSession = sessions.find(s => s.id === sessionId);
    if (selectedSession) {
      setCurrentSessionId(sessionId);
      setSession(selectedSession);
    }
  };
  
  // Create new session
  const handleCreateNewSession = () => {
    const newSessionId = uuidv4();
    setCurrentSessionId(newSessionId);
    clearChat();
  };
  
  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    // Update localStorage
    try {
      const savedSessionsJson = localStorage.getItem('chat_sessions');
      if (savedSessionsJson) {
        const savedSessions = JSON.parse(savedSessionsJson) as Record<string, ChatSession>;
        delete savedSessions[sessionId];
        localStorage.setItem('chat_sessions', JSON.stringify(savedSessions));
      }
    } catch (err) {
      console.error('Failed to delete chat session:', err);
    }
    
    // If the current session was deleted, create a new one
    if (sessionId === currentSessionId) {
      handleCreateNewSession();
    }
  };
  
  // Rename session
  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, title: newTitle } : s
    ));
    
    // Update current session if it's the one being renamed
    if (sessionId === currentSessionId) {
      setSession(prev => ({ ...prev, title: newTitle }));
    }
    
    // Update localStorage
    try {
      const savedSessionsJson = localStorage.getItem('chat_sessions');
      if (savedSessionsJson) {
        const savedSessions = JSON.parse(savedSessionsJson) as Record<string, ChatSession>;
        if (savedSessions[sessionId]) {
          savedSessions[sessionId].title = newTitle;
          localStorage.setItem('chat_sessions', JSON.stringify(savedSessions));
        }
      }
    } catch (err) {
      console.error('Failed to rename chat session:', err);
    }
  };
  
  return (
    <Flex height="100vh">
      <ChatSidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onCreateNewSession={handleCreateNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
      />
      
      <Flex direction="column" flex="1" height="100vh">
        <Box 
          flex="1" 
          overflowY="auto" 
          p={4} 
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              width: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray',
              borderRadius: '24px',
            },
          }}
        >
          {messages.length === 0 ? (
            <Center height="100%">
              <Text color="gray.500">Start a new conversation</Text>
            </Center>
          ) : (
            <Flex direction="column" gap={4}>
              <AnimatePresence>
                {messages.map((message, index) => (
                  <MotionBox
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatMessage 
                      message={message} 
                      isLatest={index === messages.length - 1 && message.role === MessageRole.ASSISTANT}
                    />
                  </MotionBox>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Center py={4}>
                    <Spinner size="sm" mr={2} />
                    <Text>TypeAI is thinking...</Text>
                  </Center>
                </MotionBox>
              )}
              
              {error && (
                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box p={4} bg="red.100" color="red.800" borderRadius="md">
                    <Text fontWeight="bold">Error:</Text>
                    <Text>{error.message}</Text>
                  </Box>
                </MotionBox>
              )}
              <div ref={messagesEndRef} />
            </Flex>
          )}
        </Box>
        
        <ChatInput 
          onSendMessage={sendMessage} 
          isLoading={isLoading} 
        />
      </Flex>
    </Flex>
  );
};

export default ChatContainer;
