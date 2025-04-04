import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  IconButton,
  Input
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ChatSession } from '../types/chat';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Custom Divider component
const Divider = ({ mb }: { mb?: number }) => (
  <Box borderBottom="1px solid" borderColor="var(--border-color)" mb={mb} />
);

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onCreateNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateNewSession,
  onDeleteSession,
  onRenameSession
}) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleStartEdit = (session: ChatSession) => {
    setIsEditing(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = (sessionId: string) => {
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle);
    }
    setIsEditing(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
  };

  // Sort sessions by most recently updated
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <MotionBox
      width={isCollapsed ? "60px" : "250px"}
      height="100vh"
      bg="gray.50"
      borderRight="1px"
      borderColor="gray.200"
      transition={{ duration: 0.3 }}
      position="relative"
    >
      <Flex 
        direction="column" 
        height="100%" 
        p={isCollapsed ? 2 : 4}
        overflow="hidden"
      >
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          {!isCollapsed && <Text fontWeight="bold">Chat History</Text>}
          <IconButton
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? "→" : "←"}
          </IconButton>
        </Flex>

        <Button
          colorScheme="blue"
          mb={4}
          onClick={onCreateNewSession}
          size={isCollapsed ? "sm" : "md"}
        >
          {isCollapsed ? "+" : <Flex alignItems="center"><Box mr={2}><FaPlus /></Box>New Chat</Flex>}
        </Button>

        <Divider mb={4} />

        <Box overflowY="auto" flex="1">
          {sortedSessions.map(session => (
            <MotionFlex
              key={session.id}
              direction="column"
              mb={2}
              p={2}
              borderRadius="md"
              bg={currentSessionId === session.id ? "blue.100" : "transparent"}
              cursor="pointer"
              onClick={() => onSelectSession(session.id)}
              whileHover={{ backgroundColor: currentSessionId === session.id ? "#bee3f8" : "#edf2f7" }}
              transition={{ duration: 0.2 }}
            >
              {isEditing === session.id ? (
                <Flex mb={2}>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    size="sm"
                    autoFocus
                    mr={1}
                  />
                  <IconButton
                    aria-label="Save"
                    size="sm"
                    colorScheme="green"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveEdit(session.id);
                    }}
                  >
                    <FaCheck />
                  </IconButton>
                  <IconButton
                    aria-label="Cancel"
                    size="sm"
                    ml={1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelEdit();
                    }}
                  >
                    <FaTimes />
                  </IconButton>
                </Flex>
              ) : (
                <Flex justifyContent="space-between" alignItems="center">
                  {!isCollapsed && (
                    <Text 
                      fontWeight={currentSessionId === session.id ? "bold" : "normal"}
                      fontSize="sm"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      maxWidth="160px"
                    >
                      {session.title}
                    </Text>
                  )}
                  {!isCollapsed && currentSessionId === session.id && (
                    <Flex>
                      <IconButton
                        aria-label="Edit"
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(session);
                        }}
                      >
                        <FaEdit />
                      </IconButton>
                      <IconButton
                        aria-label="Delete"
                        size="xs"
                        variant="ghost"
                        ml={1}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                      >
                        <FaTrash />
                      </IconButton>
                    </Flex>
                  )}
                </Flex>
              )}
              
              {!isCollapsed && !isEditing && (
                <Text fontSize="xs" color="gray.500">
                  {format(new Date(session.updatedAt), 'MMM d, h:mm a')}
                  {' • '}
                  {session.messages.length} messages
                </Text>
              )}
            </MotionFlex>
          ))}
        </Box>
      </Flex>
    </MotionBox>
  );
};

export default ChatSidebar;
