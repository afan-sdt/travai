/**
 * Example Backend Server for LiveKit Token Generation
 *
 * This is a simple Express server that generates LiveKit access tokens.
 * Deploy this separately from your React Native app.
 *
 * Setup:
 * 1. npm install express livekit-server-sdk cors
 * 2. Update LIVEKIT_API_KEY and LIVEKIT_API_SECRET with your credentials
 * 3. node server.js
 */

const express = require('express');
const { AccessToken } = require('livekit-server-sdk');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for React Native app

// LiveKit Credentials
// Get these from https://cloud.livekit.io/
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'your-api-key';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'your-api-secret';

/**
 * Generate LiveKit access token
 * POST /api/token
 * Body: { roomName: string, participantName: string, metadata?: string }
 */
app.post('/api/token', async (req, res) => {
  try {
    const { roomName, participantName, metadata } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({
        error: 'Missing required fields: roomName and participantName',
      });
    }

    // Create access token
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantName,
      metadata: metadata,
    });

    // Grant permissions
    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // Generate JWT
    const jwt = await token.toJwt();

    res.json({ token: jwt });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Token server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/token`);
});
