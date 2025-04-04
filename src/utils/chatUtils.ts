import { v4 as uuidv4 } from 'uuid';
import { Message, MessageRole } from '../types/chat';

/**
 * Generate a unique ID for messages
 * @returns A unique UUID string
 */
export const generateMessageId = (): string => {
  return uuidv4();
};

/**
 * Create a new message object
 * @param role The role of the message sender (user, assistant, system)
 * @param content The content of the message
 * @returns A new Message object
 */
export const createMessage = (role: MessageRole, content: string): Message => {
  return {
    id: generateMessageId(),
    role,
    content,
    timestamp: new Date(),
  };
};

/**
 * Format code blocks in markdown
 * @param text Text that may contain code blocks
 * @returns Formatted text with proper markdown code blocks
 */
export const formatCodeBlocks = (text: string): string => {
  // Replace single backtick code blocks with triple backtick blocks
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const inlineCodeRegex = /`([^`]+)`/g;
  
  // First handle triple backtick blocks
  let formattedText = text.replace(codeBlockRegex, (match, code) => {
    // Try to detect the language
    const firstLine = code.trim().split('\n')[0];
    const language = firstLine.match(/^[a-zA-Z0-9#]+$/) ? firstLine : '';
    const codeContent = language ? code.substring(firstLine.length).trim() : code;
    
    return '```' + language + '\n' + codeContent + '\n```';
  });
  
  // Then handle inline code blocks that aren't part of a triple backtick block
  formattedText = formattedText.replace(inlineCodeRegex, (match, code) => {
    // Make sure this isn't part of a code block we already processed
    if (match.includes('```')) return match;
    return '`' + code + '`';
  });
  
  return formattedText;
};

/**
 * Truncate a string to a specified length
 * @param str The string to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};

/**
 * Extract a title from the first user message
 * @param content The content of the first user message
 * @returns A generated title based on the content
 */
export const generateTitleFromContent = (content: string): string => {
  // Get first line or first 50 characters
  const firstLine = content.split('\n')[0];
  return truncateString(firstLine, 50);
};
