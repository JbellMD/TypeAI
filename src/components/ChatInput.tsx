import React, { useState, useRef, KeyboardEvent } from 'react';
import { 
  Box, 
  Textarea, 
  Button, 
  Flex, 
  IconButton,
  useColorModeValue
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
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
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
      bg={bgColor}
      borderTop="1px" 
      borderColor={borderColor}
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
                leftIcon={<FaStop />}
                onClick={onStopGeneration}
                colorScheme="red"
                variant="outline"
                size="sm"
              >
                Stop generating
              </Button>
            )}
          </Box>
          
          <IconButton
            icon={<FaPaperPlane />}
            aria-label="Send message"
            colorScheme="blue"
            isLoading={isLoading}
            onClick={handleSubmit}
            isDisabled={!message.trim() || isLoading}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default ChatInput;
