import React, { useRef, useEffect } from 'react';
import { Box, Flex, Text, Spinner, Center } from '@chakra-ui/react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Message } from '../types/chat';
import useChat from '../hooks/useChat';

interface ChatContainerProps {
  initialMessages?: Message[];
}

const ChatContainer: React.FC<ChatContainerProps> = ({ initialMessages = [] }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, error } = useChat({ initialMessages });
  
  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  return (
    <Flex direction="column" height="100vh">
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
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <Center py={4}>
                <Spinner size="sm" mr={2} />
                <Text>TypeAI is thinking...</Text>
              </Center>
            )}
            {error && (
              <Box p={4} bg="red.100" color="red.800" borderRadius="md">
                <Text fontWeight="bold">Error:</Text>
                <Text>{error.message}</Text>
              </Box>
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
  );
};

export default ChatContainer;
