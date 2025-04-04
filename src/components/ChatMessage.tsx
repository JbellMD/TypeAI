import React, { useState, useEffect } from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import { FaUser, FaRobot } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { formatCodeBlocks } from '../utils/chatUtils';
import TypingAnimation from './TypingAnimation';
import { Message, MessageRole } from '../types/chat';

const MotionBox = motion(Box);

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest = false }) => {
  const [showTyping, setShowTyping] = useState(false);
  const [formattedContent, setFormattedContent] = useState('');
  
  // Format code blocks in the message
  useEffect(() => {
    const formatted = formatCodeBlocks(message.content);
    setFormattedContent(formatted);
    
    // Only show typing animation for the latest assistant message
    if (message.role === MessageRole.ASSISTANT && isLatest) {
      setShowTyping(true);
    }
  }, [message, isLatest]);

  const handleTypingComplete = () => {
    setShowTyping(false);
  };

  const getBgColor = () => {
    switch (message.role) {
      case MessageRole.USER:
        return 'var(--message-user-bg)';
      case MessageRole.ASSISTANT:
        return 'var(--message-assistant-bg)';
      case MessageRole.SYSTEM:
        return 'var(--message-system-bg, gray.100)';
      default:
        return 'gray.100';
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

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      mb={4}
      className={`message ${message.role === MessageRole.USER ? 'user-message' : 'assistant-message'}`}
    >
      <Flex>
        <Box
          bg={message.role === MessageRole.USER ? 'blue.500' : 'gray.300'}
          color="white"
          borderRadius="full"
          p={2}
          mr={3}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="lg"
        >
          {getIconElement()}
        </Box>
        
        <Box
          flex="1"
          bg={getBgColor()}
          p={4}
          borderRadius="lg"
          className="markdown-content"
        >
          {showTyping ? (
            <TypingAnimation 
              text={message.content} 
              speed={20} 
              onComplete={handleTypingComplete} 
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
          )}
        </Box>
      </Flex>
      <Flex justifyContent="space-between" width="100%" mt={2}>
        <Text fontWeight="bold">{getName()}</Text>
        <Text fontSize="sm" color="gray.500">
          {message.timestamp.toLocaleTimeString()}
        </Text>
      </Flex>
    </MotionBox>
  );
};

export default ChatMessage;
