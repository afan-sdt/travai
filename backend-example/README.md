# Travai Backend - Token Server

This is a simple Express.js server that generates LiveKit access tokens for the Travai mobile app.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
export LIVEKIT_API_KEY=your-api-key
export LIVEKIT_API_SECRET=your-api-secret
```

Or create a `.env` file (requires dotenv package):
```
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
PORT=3000
```

3. Run the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### POST /api/token

Generate a LiveKit access token.

**Request:**
```json
{
  "roomName": "onboarding",
  "participantName": "user_123",
  "metadata": "{\"type\":\"onboarding\"}"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Deployment

Deploy this server to any Node.js hosting platform:
- Heroku
- Railway
- Render
- AWS Lambda
- Google Cloud Run
- Vercel (serverless function)

## Security Notes

- Never expose your API secret in the mobile app
- Always generate tokens on the server side
- Implement authentication before generating tokens in production
- Use HTTPS in production
- Consider rate limiting to prevent abuse
