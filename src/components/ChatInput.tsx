import React, { useState, useRef, KeyboardEvent } from 'react';
import { 
  Box, 
  Textarea, 
  Button, 
  Flex,
  IconButton
} from '@chakra-ui/react';
import { FaPaperPlane, FaStop } from 'react-icons/fa';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  onStopGeneration,
  placeholder = 'Type your message here...'
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Focus back on textarea after sending
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <Box 
      position="sticky" 
      bottom={0} 
      width="100%" 
      p={4} 
      bg="white"
      borderTop="1px" 
      borderColor="gray.200"
    >
      <Flex direction="column">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          resize="none"
          rows={3}
          mb={2}
          borderRadius="md"
          disabled={isLoading}
        />
        
        <Flex justifyContent="space-between">
          <Box>
            {isLoading && onStopGeneration && (
              <Button
                onClick={onStopGeneration}
                colorScheme="red"
                variant="outline"
                size="sm"
              >
                <Box mr={2}><FaStop /></Box>
                Stop generating
              </Button>
            )}
          </Box>
          
          <IconButton
            aria-label="Send message"
            colorScheme="blue"
            loading={isLoading}
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
          >
            <FaPaperPlane />
          </IconButton>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ChatInput;
