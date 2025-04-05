#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
API Backend for TypeAI Frontend
Connects the TypeScript frontend with the fine-tuned Mistral 7B model
"""

import os
import sys
import json
import time
import logging
import torch
import asyncio
from datetime import datetime
from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import uvicorn
import uuid
from pathlib import Path

# Add the parent directory to sys.path to import from the chatbot module
parent_dir = str(Path(__file__).resolve().parent.parent.parent)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# Import the chatbot code from your existing implementation
from psych_model_13b.scripts.minimal_cosmic_chatbot import (
    ChatInterface, DEFAULT_MODEL_PATH, DEFAULT_LORA_PATH, 
    SYSTEM_PROMPT, DEVICE
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="TypeAI Backend API", description="API for TypeAI Frontend")

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

# Initialize the chat interface
chat_interface = None

@app.on_event("startup")
async def startup_event():
    """Initialize the chat interface when the API starts"""
    global chat_interface
    try:
        # Initialize the chat interface with your fine-tuned model
        chat_interface = ChatInterface(
            model_path=DEFAULT_MODEL_PATH,
            lora_path=DEFAULT_LORA_PATH,
            device=DEVICE,
            bit_width=4,
            enable_fallback_ui=True
        )
        logger.info("Chat interface initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize chat interface: {str(e)}")
        # Continue running even if model fails to load - useful for testing API without model

@app.get("/")
async def root():
    """Root endpoint to check if the API is running"""
    return {
        "status": "ok",
        "message": "TypeAI Backend API is running",
        "model_loaded": chat_interface is not None and not chat_interface.ui_only_mode,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@app.post("/api/chat")
async def chat(request: ChatRequest) -> ChatResponse:
    """Process a chat request and return a response"""
    if not chat_interface or chat_interface.ui_only_mode:
        # Fallback response if model isn't loaded
        return ChatResponse(
            id=str(uuid.uuid4()),
            message=ChatResponseMessage(
                role="assistant",
                content="I'm sorry, the model is not currently loaded. Please check the server logs."
            ),
            created=int(time.time())
        )
    
    try:
        # Format the conversation history from the request
        conversation_history = []
        system_message = None
        
        for msg in request.messages:
            if msg.role == "system":
                # Use the latest system message as the system prompt
                system_message = msg.content
            else:
                conversation_history.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        # Use the provided system message or the default one
        system_prompt = system_message if system_message else SYSTEM_PROMPT
        
        # Get the last user message
        user_input = conversation_history[-1]["content"] if conversation_history and conversation_history[-1]["role"] == "user" else ""
        
        # Generate response using the chat interface
        response = chat_interface.get_chat_response(
            user_input=user_input,
            conversation_history=conversation_history[:-1] if conversation_history else [],
            system_prompt=system_prompt,
            max_tokens=600,
            temperature=0.7,
            top_p=0.9
        )
        
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

async def generate_stream(request: ChatRequest):
    """Generate streaming response for the chat request"""
    if not chat_interface or chat_interface.ui_only_mode:
        yield json.dumps({
            "id": str(uuid.uuid4()),
            "message": {
                "role": "assistant",
                "content": "I'm sorry, the model is not currently loaded. Please check the server logs."
            },
            "created": int(time.time())
        })
        return
    
    try:
        # Format the conversation history from the request
        conversation_history = []
        system_message = None
        
        for msg in request.messages:
            if msg.role == "system":
                system_message = msg.content
            else:
                conversation_history.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        # Use the provided system message or the default one
        system_prompt = system_message if system_message else SYSTEM_PROMPT
        
        # Get the last user message
        user_input = conversation_history[-1]["content"] if conversation_history and conversation_history[-1]["role"] == "user" else ""
        
        # Generate response using the chat interface with streaming
        # Note: This is a simplified version - you may need to adapt your model to stream tokens
        response = chat_interface.get_chat_response(
            user_input=user_input,
            conversation_history=conversation_history[:-1] if conversation_history else [],
            system_prompt=system_prompt,
            max_tokens=600,
            temperature=0.7,
            top_p=0.9
        )
        
        # Simulate streaming by sending chunks of the response
        # In a real implementation, you would stream tokens directly from the model
        response_id = str(uuid.uuid4())
        words = response.split()
        chunk_size = 3  # Number of words per chunk
        
        for i in range(0, len(words), chunk_size):
            chunk = " ".join(words[i:i+chunk_size])
            yield json.dumps({
                "id": response_id,
                "message": {
                    "role": "assistant",
                    "content": chunk
                },
                "created": int(time.time())
            })
            await asyncio.sleep(0.1)  # Simulate generation time
    except Exception as e:
        logger.error(f"Error processing streaming chat request: {str(e)}")
        yield json.dumps({
            "id": str(uuid.uuid4()),
            "message": {
                "role": "assistant",
                "content": f"I'm sorry, an error occurred: {str(e)}"
            },
            "created": int(time.time())
        })

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """Stream a chat response"""
    return StreamingResponse(
        generate_stream(request),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    # Run the FastAPI app with uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=3000, reload=True)
