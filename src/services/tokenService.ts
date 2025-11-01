import { LIVEKIT_CONFIG } from '../config/livekit';

/**
 * Token Service for LiveKit
 *
 * This service communicates with the FastAPI backend to obtain
 * secure LiveKit access tokens for room access.
 *
 * Backend Setup:
 * 1. Deploy the FastAPI backend (see backend-fastapi/)
 * 2. Update BACKEND_URL with your deployed backend URL
 * 3. Ensure backend has LIVEKIT_API_KEY and LIVEKIT_API_SECRET configured
 */

// Backend configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export interface TokenRequest {
  room_name: string;
  participant_name: string;
  metadata?: string;
}

export interface TokenResponse {
  token: string;
  url: string;
}

export class TokenService {
  private backendUrl: string;

  constructor(backendUrl: string = BACKEND_URL) {
    this.backendUrl = backendUrl;
  }

  /**
   * Request a token from the FastAPI backend
   */
  async requestToken(request: TokenRequest): Promise<string> {
    try {
      const response = await fetch(`${this.backendUrl}/api/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: TokenResponse = await response.json();

      // Update LiveKit URL from backend response if available
      if (data.url && data.url !== LIVEKIT_CONFIG.url) {
        console.log(`LiveKit URL updated from backend: ${data.url}`);
      }

      return data.token;
    } catch (error) {
      if (error instanceof Error) {
        // Provide helpful error messages
        if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
          throw new Error(
            `Cannot connect to backend at ${this.backendUrl}\n\n` +
            'Please ensure:\n' +
            '1. The FastAPI backend is running\n' +
            '2. BACKEND_URL is configured correctly\n' +
            '3. Your device can reach the backend URL\n\n' +
            'For local development, use ngrok or similar to expose your backend.'
          );
        }
        throw error;
      }
      throw new Error('Unknown error occurred while requesting token');
    }
  }

  /**
   * Request a token for the onboarding voice agent session
   */
  async requestOnboardingToken(userId: string): Promise<string> {
    return this.requestToken({
      room_name: 'onboarding',
      participant_name: userId,
      metadata: JSON.stringify({ type: 'onboarding' }),
    });
  }

  /**
   * Set backend URL dynamically (useful for testing)
   */
  setBackendUrl(url: string): void {
    this.backendUrl = url;
  }

  /**
   * Get current backend URL
   */
  getBackendUrl(): string {
    return this.backendUrl;
  }
}

export const tokenService = new TokenService();
