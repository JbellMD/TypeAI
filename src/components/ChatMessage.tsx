import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { FaUser, FaRobot } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole } from '../types/chat';
import { formatCodeBlocks } from '../utils/chatUtils';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // Define colors based on role
  const getBgColor = () => {
    switch (message.role) {
      case MessageRole.USER:
        return 'gray.100';
      case MessageRole.ASSISTANT:
        return 'blue.50';
      case MessageRole.SYSTEM:
        return 'purple.50';
      default:
        return 'transparent';
    }
  };
  
  const getIconElement = () => {
    switch (message.role) {
      case MessageRole.USER:
        return <FaUser />;
      case MessageRole.ASSISTANT:
        return <FaRobot />;
      default:
        return null;
    }
  };
  
  const getName = () => {
    switch (message.role) {
      case MessageRole.USER:
        return 'You';
      case MessageRole.ASSISTANT:
        return 'TypeAI';
      case MessageRole.SYSTEM:
        return 'System';
      default:
        return '';
    }
  };
  
  // Format the content to properly display code blocks
  const formattedContent = formatCodeBlocks(message.content);
  
  return (
    <Box 
      p={4} 
      bg={getBgColor()} 
      borderRadius="md" 
      mb={4}
      width="100%"
    >
      <Flex alignItems="center" mb={2}>
        <Box 
          bg={message.role === MessageRole.USER ? 'blue.500' : 'green.500'} 
          color="white"
          borderRadius="full"
          p={2}
          mr={2}
          fontSize="sm"
        >
          {getIconElement()}
        </Box>
        <Flex justifyContent="space-between" width="100%">
          <Text fontWeight="bold">{getName()}</Text>
          <Text fontSize="sm" color="gray.500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </Text>
        </Flex>
      </Flex>
      
      <Box className="markdown-content" pl={10}>
        <ReactMarkdown>{formattedContent}</ReactMarkdown>
      </Box>
    </Box>
  );
};

export default ChatMessage;
