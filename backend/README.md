# TypeAI Backend for Fine-tuned Mistral 7B

This backend connects your TypeScript frontend with your fine-tuned Mistral 7B model, "The Always Laughing Smile".

## Setup Instructions

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Configure the environment variables in the frontend:

Create a `.env` file in the root of your TypeAI frontend project with the following content:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

3. Start the backend server:

```bash
python api.py
```

4. In a separate terminal, start the frontend development server:

```bash
cd ..  # Go to the TypeAI root directory
npm run dev
```

## API Endpoints

- `GET /` - Health check endpoint
- `POST /api/chat` - Send a message and get a response
- `POST /api/chat/stream` - Stream a response (for real-time typing effect)

## Model Configuration

The backend uses your existing fine-tuned Mistral 7B model with LoRA weights. You can modify the model configuration in `api.py` by changing:

- `DEFAULT_MODEL_PATH` - Path to your base model
- `DEFAULT_LORA_PATH` - Path to your fine-tuned LoRA weights
- `SYSTEM_PROMPT` - The system prompt to use for the chatbot

## Troubleshooting

- If you encounter CORS issues, make sure the frontend is running on the expected origin and update the CORS configuration in `api.py`
- If the model fails to load, check the console logs for detailed error messages
- For production deployment, update the CORS settings to only allow specific origins
