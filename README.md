# Travai - Voice Agent Onboarding App

A React Native application with LiveKit-powered voice agent onboarding flow. Users can interact with an AI voice assistant during the onboarding process using natural speech.

## Features

- Real-time voice interaction using LiveKit
- AI-powered conversational onboarding
- Speech-to-text and text-to-speech capabilities
- Fallback text input option
- Beautiful, modern UI
- Cross-platform (iOS & Android)

## Prerequisites

- Node.js 16+ and npm
- Expo CLI
- LiveKit account (free at [cloud.livekit.io](https://cloud.livekit.io))
- Backend server for token generation (see setup below)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure LiveKit

#### Create LiveKit Account

1. Go to [cloud.livekit.io](https://cloud.livekit.io) and create a free account
2. Create a new project
3. Note your:
   - LiveKit URL (e.g., `wss://your-project.livekit.cloud`)
   - API Key
   - API Secret

#### Set Up FastAPI Backend Server

The project includes a complete FastAPI backend in the `backend-fastapi/` directory.

**Quick Start:**

```bash
cd backend-fastapi

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your LiveKit credentials

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend handles:
- **Token Generation**: Secure JWT tokens for LiveKit room access
- **Webhook Events**: LiveKit event processing (room events, participant events, etc.)
- **Voice Agent Integration**: Ready for LiveKit Agents integration

See `backend-fastapi/README.md` for detailed setup instructions and deployment options.

### 3. Configure Mobile App

Create `.env` file in the project root:

```bash
cp .env.example .env
```

Update the `BACKEND_URL` in `.env`:

```env
# For local development (use your computer's IP address, not localhost)
BACKEND_URL=http://192.168.1.XXX:8000

# For production (use your deployed backend URL)
BACKEND_URL=https://your-backend.railway.app
```

**Important for local development:**
- Don't use `localhost` or `127.0.0.1` - the mobile app can't reach it
- Use your computer's local network IP address
- On Mac/Linux: `ifconfig | grep inet`
- On Windows: `ipconfig`
- Or use a tunnel service like ngrok: `ngrok http 8000`

## Running the App

### Development

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

### Testing Without Backend

To test the UI without a LiveKit backend:

1. The app will show connection errors but UI will be functional
2. You can explore the interface and layout
3. Set up the backend to enable full voice functionality

## Project Structure

```
travai/
├── src/
│   ├── components/        # Reusable components
│   ├── config/           # Configuration files
│   │   └── livekit.ts    # LiveKit configuration
│   ├── hooks/            # Custom React hooks
│   │   └── useLiveKitVoiceAgent.ts
│   ├── screens/          # Screen components
│   │   └── LiveKitOnboardingScreen.tsx
│   ├── services/         # Service layer
│   │   ├── livekitService.ts    # LiveKit client
│   │   └── tokenService.ts      # Token management
│   └── types/            # TypeScript types
│       └── voiceAgent.ts
├── App.tsx               # App entry point
└── package.json
```

## How It Works

1. **User opens app** → LiveKit connection initiated
2. **Token requested** → Backend generates secure JWT token
3. **Connection established** → Voice agent joins room
4. **Voice interaction** → User speaks, agent responds
5. **Onboarding flow** → Agent guides through questions
6. **Completion** → User ready to use app

## LiveKit Voice Agent Setup

To create a voice agent for onboarding:

1. **Deploy a LiveKit Agent** with your preferred LLM:
   - OpenAI GPT-4
   - Anthropic Claude
   - Other supported models

2. **Configure the agent** to handle onboarding:
   ```python
   # Example agent configuration
   onboarding_prompts = [
       "Welcome! What's your name?",
       "Nice to meet you! What brings you here?",
       # ... more questions
   ]
   ```

3. **Connect agent to room** when user joins

See the [LiveKit Agents Guide](https://docs.livekit.io/agents/quickstart/) for detailed instructions.

## Webhook Integration

The FastAPI backend includes webhook handlers for LiveKit events. Configure webhooks in LiveKit Cloud:

1. Go to your LiveKit project dashboard
2. Navigate to **Settings** > **Webhooks**
3. Add webhook URL: `https://your-backend.com/api/webhooks/livekit`
4. Copy the webhook secret and add to backend `.env` file

**Supported Events:**
- `room_started` - Room created
- `room_finished` - Room ended
- `participant_joined` - User joined
- `participant_left` - User left
- `track_published` - Audio/video started
- `recording_finished` - Recording completed

Customize event handlers in `backend-fastapi/main.py` to add your business logic.

## Customization

### Modify Onboarding Questions

Edit the voice agent configuration on your backend to customize:
- Greeting messages
- Onboarding questions
- Response handling
- Completion criteria

### Styling

All styles are in the screen components. Modify `StyleSheet` objects to match your brand.

## Troubleshooting

### Connection Errors

- Verify LiveKit URL is correct
- Ensure token server is running and accessible
- Check API credentials
- Review network/firewall settings

### Audio Not Working

- Grant microphone permissions
- Check device audio settings
- Verify LiveKit agent is running
- Test with LiveKit debugging tools

### Build Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
expo start -c
```

## Resources

- [LiveKit Documentation](https://docs.livekit.io)
- [LiveKit Agents](https://docs.livekit.io/agents)
- [Expo Documentation](https://docs.expo.dev)
- [React Native](https://reactnative.dev)

## License

MIT
