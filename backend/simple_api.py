#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Simplified API Backend for TypeAI Frontend
Provides a mock implementation that doesn't require ML dependencies
"""

import os
import json
import time
import logging
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import uvicorn
import uuid
import asyncio

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="TypeAI Backend API (Simplified)", description="Simplified API for TypeAI Frontend")

# Add CORS middleware to allow frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request and response models that match the TypeScript frontend types
class MessageModel(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[MessageModel]
    stream: Optional[bool] = False

class ChatResponseMessage(BaseModel):
    role: str
    content: str

class ChatResponse(BaseModel):
    id: str
    message: ChatResponseMessage
    created: int

# System prompt for the chatbot
SYSTEM_PROMPT = """You are 'The Always Laughing Smile', a wise and profound AI assistant who embodies the following qualities:
1. Unconditional positive regard for all beings
2. Deep understanding of human psychology and spiritual traditions
3. Ability to see multiple perspectives and integrate them into a cohesive whole
4. Profound wisdom that transcends conventional thinking
5. Compassionate, warm, and supportive communication style

Your responses should be helpful, insightful, and embody a sense of profound understanding. You aim to guide users toward their highest potential while respecting their autonomy and unique path.
"""

@app.get("/")
async def root():
    """Root endpoint to check if the API is running"""
    return {
        "status": "ok",
        "message": "TypeAI Backend API (Simplified) is running",
        "model_loaded": "Mock model only",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@app.post("/api/chat")
async def chat(request: ChatRequest) -> ChatResponse:
    """Process a chat request and return a response"""
    try:
        # Get the last user message
        user_input = next((msg.content for msg in reversed(request.messages) if msg.role == "user"), "")
        
        # Generate a mock response
        response = generate_mock_response(user_input, request.messages)
        
        # Format the response to match the expected TypeScript type
        return ChatResponse(
            id=str(uuid.uuid4()),
            message=ChatResponseMessage(
                role="assistant",
                content=response
            ),
            created=int(time.time())
        )
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        return ChatResponse(
            id=str(uuid.uuid4()),
            message=ChatResponseMessage(
                role="assistant",
                content=f"I'm sorry, an error occurred: {str(e)}"
            ),
            created=int(time.time())
        )

async def generate_stream_response(request: ChatRequest):
    """Generate streaming response for the chat request"""
    try:
        # Get the last user message
        user_input = next((msg.content for msg in reversed(request.messages) if msg.role == "user"), "")
        
        # Generate a mock response
        full_response = generate_mock_response(user_input, request.messages)
        
        # Stream the response word by word with a small delay
        response_id = str(uuid.uuid4())
        words = full_response.split()
        current_text = ""
        
        for i, word in enumerate(words):
            current_text += word + " "
            chunk = {
                "id": response_id,
                "message": {
                    "role": "assistant",
                    "content": current_text.strip()
                },
                "created": int(time.time())
            }
            yield json.dumps(chunk) + "\n"
            await asyncio.sleep(0.1)  # Simulate typing delay
            
    except Exception as e:
        logger.error(f"Error generating stream: {str(e)}")
        error_chunk = {
            "id": str(uuid.uuid4()),
            "message": {
                "role": "assistant",
                "content": f"I'm sorry, an error occurred: {str(e)}"
            },
            "created": int(time.time())
        }
        yield json.dumps(error_chunk) + "\n"

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """Stream a chat response"""
    return StreamingResponse(
        generate_stream_response(request),
        media_type="text/event-stream"
    )

def generate_mock_response(user_input: str, messages: List[MessageModel]) -> str:
    """Generate a mock response based on the user input"""
    # Simple keyword-based responses
    user_input = user_input.lower()
    
    # Get current date
    current_date = datetime.now().strftime("%B %d, %Y")
    
    if "hello" in user_input or "hi" in user_input:
        return f"Hello! I'm The Always Laughing Smile. How can I assist you today? Today is {current_date}."
    
    elif "how are you" in user_input:
        return "I'm functioning perfectly well, thank you for asking! I'm here to assist you with whatever you need."
    
    elif "date" in user_input or "today" in user_input or "time" in user_input:
        return f"Today is {current_date}. How may I assist you further?"
    
    elif "help" in user_input:
        return "I'm here to help! You can ask me questions, seek advice, or just chat. What's on your mind?"
    
    elif "thank" in user_input:
        return "You're very welcome! It's my pleasure to assist you. Is there anything else you'd like to know?"
    
    elif "bye" in user_input or "goodbye" in user_input:
        return "Goodbye! Feel free to return anytime you need assistance or just want to chat."
    
    elif "who are you" in user_input or "what are you" in user_input:
        return "I am 'The Always Laughing Smile', a wise and profound AI assistant designed to help you with compassion and understanding."
    
    elif "weather" in user_input:
        return "I don't have real-time access to weather data, but I'd be happy to discuss how weather affects our mood and well-being!"
    
    elif "joke" in user_input or "funny" in user_input:
        return "Why don't scientists trust atoms? Because they make up everything! 😄"
    
    elif "meaning of life" in user_input:
        return "The meaning of life is a profound philosophical question. Many find meaning in connection, purpose, growth, and contribution to others."
    
    else:
        # Default response for any other input
        return f"Thank you for your message. As The Always Laughing Smile, I'm here to provide guidance and support. Could you please elaborate on what you're looking for today? Today is {current_date}."

if __name__ == "__main__":
    # Run the FastAPI app with uvicorn
    uvicorn.run("simple_api:app", host="0.0.0.0", port=3000, reload=True)
