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

#### Set Up Backend Token Server

LiveKit requires secure token generation. You need a backend server to generate tokens.

**Option 1: Quick Node.js Backend**

Create a simple Express server:

```javascript
// server.js
const express = require('express');
const { AccessToken } = require('livekit-server-sdk');

const app = express();
app.use(express.json());

const LIVEKIT_API_KEY = 'your-api-key';
const LIVEKIT_API_SECRET = 'your-api-secret';

app.post('/api/token', async (req, res) => {
  const { roomName, participantName } = req.body;

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantName,
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  res.json({ token: await token.toJwt() });
});

app.listen(3000, () => console.log('Token server running on port 3000'));
```

**Option 2: Use LiveKit Agents**

Set up a LiveKit agent for the voice AI functionality:

```python
# Install LiveKit agents
pip install livekit livekit-agents

# Create an agent with your preferred AI service (OpenAI, Anthropic, etc.)
```

See [LiveKit Agents documentation](https://docs.livekit.io/agents) for detailed setup.

### 3. Update Configuration

Update `src/services/tokenService.ts` with your backend endpoint:

```typescript
async requestToken(request: TokenRequest): Promise<string> {
  const response = await fetch('https://your-backend.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const data = await response.json();
  return data.token;
}
```

Update `src/config/livekit.ts` with your LiveKit URL:

```typescript
export const LIVEKIT_CONFIG = {
  url: 'wss://your-project.livekit.cloud',
};
```

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
