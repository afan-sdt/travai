// LiveKit Configuration
// In production, use environment variables or secure storage
export const LIVEKIT_CONFIG = {
  // Replace with your LiveKit server URL
  // Get this from https://cloud.livekit.io/ after creating an account
  url: process.env.LIVEKIT_URL || 'wss://your-livekit-server.livekit.cloud',

  // For development, you can hardcode these, but use env vars in production
  apiKey: process.env.LIVEKIT_API_KEY || '',
  apiSecret: process.env.LIVEKIT_API_SECRET || '',
};

// Voice Agent Configuration
export const VOICE_AGENT_CONFIG = {
  // The onboarding agent configuration
  agentName: 'onboarding-assistant',

  // Voice settings
  voice: {
    language: 'en-US',
    speed: 1.0,
  },

  // Conversation settings
  conversation: {
    interruptible: true,
    endOfSpeechTimeout: 1000, // ms
  },
};
