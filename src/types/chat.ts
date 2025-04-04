export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRequest {
  messages: Pick<Message, 'role' | 'content'>[];
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  message: Pick<Message, 'role' | 'content'>;
  created: number;
}
