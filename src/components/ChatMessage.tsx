import React from 'react';
import { Box, Flex, Text, Avatar, useColorModeValue } from '@chakra-ui/react';
import { FaUser, FaRobot } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole } from '../types/chat';
import { formatCodeBlocks } from '../utils/chatUtils';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const userBgColor = useColorModeValue('gray.100', 'gray.700');
  const assistantBgColor = useColorModeValue('blue.50', 'blue.900');
  const systemBgColor = useColorModeValue('purple.50', 'purple.900');
  
  const getBgColor = () => {
    switch (message.role) {
      case MessageRole.USER:
        return userBgColor;
      case MessageRole.ASSISTANT:
        return assistantBgColor;
      case MessageRole.SYSTEM:
        return systemBgColor;
      default:
        return 'transparent';
    }
  };
  
  const getIcon = () => {
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
        <Avatar 
          size="sm" 
          icon={getIcon()} 
          bg={message.role === MessageRole.USER ? 'blue.500' : 'green.500'} 
          color="white"
          mr={2}
        />
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
