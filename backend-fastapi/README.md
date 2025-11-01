# Travai Backend - FastAPI Server

FastAPI backend server for the Travai mobile app, handling LiveKit token generation and webhook events.

## Features

- **Token Generation**: Secure JWT token creation for LiveKit room access
- **Webhook Handlers**: Process LiveKit events (room events, participant events, recordings)
- **CORS Support**: Configured for mobile app access
- **Type Safety**: Full Pydantic models for request/response validation
- **Production Ready**: Environment-based configuration and error handling

## Setup

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your LiveKit credentials:

```env
LIVEKIT_API_KEY=your-api-key-here
LIVEKIT_API_SECRET=your-api-secret-here
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_WEBHOOK_SECRET=your-webhook-secret
```

**Get LiveKit Credentials:**
1. Go to [cloud.livekit.io](https://cloud.livekit.io)
2. Create a project
3. Copy API Key, API Secret, and WebSocket URL
4. For webhooks, go to Settings > Webhooks and copy the secret

### 3. Run the Server

**Development:**
```bash
# With auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Production:**
```bash
# Using gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

The server will be available at `http://localhost:8000`

## API Endpoints

### GET /
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "service": "Travai Backend",
  "version": "1.0.0",
  "timestamp": "2025-11-01T12:00:00.000000"
}
```

### GET /health
Simple health check

**Response:**
```json
{
  "status": "healthy"
}
```

### POST /api/token
Generate LiveKit access token for a participant

**Request:**
```json
{
  "room_name": "onboarding",
  "participant_name": "user_123",
  "metadata": "{\"type\":\"onboarding\"}"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "url": "wss://your-project.livekit.cloud"
}
```

**Error Response:**
```json
{
  "detail": "Failed to generate token: <error message>"
}
```

### POST /api/webhooks/livekit
Webhook endpoint for LiveKit events

**Headers:**
```
Authorization: sha256=<signature>
Content-Type: application/json
```

**Payload Example (participant_joined):**
```json
{
  "event": "participant_joined",
  "room": {
    "sid": "RM_xxxxx",
    "name": "onboarding",
    "createdAt": "1234567890"
  },
  "participant": {
    "sid": "PA_xxxxx",
    "identity": "user_123",
    "name": "user_123"
  }
}
```

## Webhook Events

The server handles these LiveKit webhook events:

| Event | Description | Handler Function |
|-------|-------------|------------------|
| `room_started` | Room created | `handle_room_started()` |
| `room_finished` | Room ended | `handle_room_finished()` |
| `participant_joined` | User joined room | `handle_participant_joined()` |
| `participant_left` | User left room | `handle_participant_left()` |
| `track_published` | Audio/video started | `handle_track_published()` |
| `track_unpublished` | Audio/video stopped | `handle_track_unpublished()` |
| `recording_finished` | Recording completed | `handle_recording_finished()` |

### Customizing Webhook Handlers

Edit the handler functions in `main.py` to add your business logic:

```python
async def handle_participant_joined(payload: Dict[str, Any]):
    """Handle participant joined event"""
    room = payload.get("room", {})
    participant = payload.get("participant", {})

    # Your custom logic:
    # - Save to database
    # - Trigger voice agent
    # - Send notifications
    # - Update analytics
```

## Setting Up LiveKit Webhooks

1. Go to [cloud.livekit.io](https://cloud.livekit.io)
2. Navigate to your project
3. Go to **Settings** > **Webhooks**
4. Add webhook URL: `https://your-backend.com/api/webhooks/livekit`
5. Copy the webhook secret to your `.env` file

**For local development**, use a tunnel service:
```bash
# Using ngrok
ngrok http 8000

# Use the ngrok URL in LiveKit webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/livekit
```

## Deployment

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Deploy to Render

1. Create new Web Service on [render.com](https://render.com)
2. Connect your repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

### Deploy to AWS Lambda (Serverless)

```bash
# Install Mangum for Lambda adapter
pip install mangum

# Update main.py
from mangum import Mangum
handler = Mangum(app)

# Deploy with AWS SAM or Serverless Framework
```

### Deploy to Google Cloud Run

```bash
# Create Dockerfile (see below)
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/travai-backend
gcloud run deploy travai-backend --image gcr.io/PROJECT_ID/travai-backend
```

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

## Integrating with Mobile App

Update the mobile app's token service:

```typescript
// src/services/tokenService.ts
async requestToken(request: TokenRequest): Promise<string> {
  const response = await fetch('https://your-backend.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to get token');
  }

  const data = await response.json();
  return data.token;
}
```

## Testing

### Test Token Generation

```bash
curl -X POST http://localhost:8000/api/token \
  -H "Content-Type: application/json" \
  -d '{
    "room_name": "onboarding",
    "participant_name": "test_user",
    "metadata": "{\"type\":\"test\"}"
  }'
```

### Test Webhook (Local)

```bash
curl -X POST http://localhost:8000/api/webhooks/livekit \
  -H "Content-Type: application/json" \
  -d '{
    "event": "participant_joined",
    "room": {"name": "test-room"},
    "participant": {"identity": "test_user"}
  }'
```

## API Documentation

FastAPI automatically generates interactive API docs:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Security Best Practices

1. **Never expose API secrets** in the mobile app
2. **Use HTTPS** in production
3. **Implement authentication** before token generation
4. **Rate limit** token endpoints
5. **Validate webhook signatures** in production
6. **Use environment variables** for all secrets
7. **Enable CORS** only for trusted origins

## Troubleshooting

### Token Generation Fails
- Verify `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are set
- Check API credentials in LiveKit dashboard
- Ensure no typos in environment variables

### Webhooks Not Received
- Verify webhook URL is publicly accessible
- Check webhook secret matches LiveKit settings
- Review server logs for errors
- Test with ngrok for local development

### CORS Errors
- Update `allow_origins` in `main.py` CORS middleware
- Ensure mobile app domain is whitelisted

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `LIVEKIT_API_KEY` | LiveKit API key | Yes | `APIxxxxx` |
| `LIVEKIT_API_SECRET` | LiveKit API secret | Yes | `secretxxxxx` |
| `LIVEKIT_URL` | LiveKit WebSocket URL | Yes | `wss://project.livekit.cloud` |
| `LIVEKIT_WEBHOOK_SECRET` | Webhook signature secret | No | `whsec_xxxxx` |
| `PORT` | Server port | No | `8000` |
| `HOST` | Server host | No | `0.0.0.0` |

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LiveKit Server SDK (Python)](https://docs.livekit.io/reference/server-sdks/)
- [LiveKit Webhooks Guide](https://docs.livekit.io/guides/webhooks/)
- [Uvicorn Documentation](https://www.uvicorn.org/)

## License

MIT
