import { Room, RoomEvent, Track } from 'livekit-client';
import { LIVEKIT_CONFIG } from '../config/livekit';

export interface AgentMessage {
  text: string;
  isFinal: boolean;
  timestamp: Date;
}

export class LiveKitVoiceService {
  private room: Room | null = null;
  private onMessageCallback?: (message: AgentMessage) => void;
  private onAgentSpeakingCallback?: (isSpeaking: boolean) => void;
  private onConnectionStateCallback?: (state: string) => void;

  constructor() {
    this.room = new Room();
  }

  /**
   * Connect to LiveKit room with voice agent
   */
  async connect(token: string): Promise<void> {
    if (!this.room) {
      this.room = new Room();
    }

    try {
      await this.room.connect(LIVEKIT_CONFIG.url, token);
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to connect to LiveKit:', error);
      throw error;
    }
  }

  /**
   * Disconnect from LiveKit room
   */
  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
  }

  /**
   * Set up event listeners for the room
   */
  private setupEventListeners(): void {
    if (!this.room) return;

    // Listen for transcription messages from the agent
    this.room.on(RoomEvent.DataReceived, (payload, participant) => {
      try {
        const decoder = new TextDecoder();
        const message = JSON.parse(decoder.decode(payload));

        if (message.type === 'transcription' || message.type === 'agent_response') {
          this.onMessageCallback?.({
            text: message.text,
            isFinal: message.isFinal ?? true,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Failed to parse data message:', error);
      }
    });

    // Listen for track subscriptions (agent audio)
    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === Track.Kind.Audio && participant.identity !== this.room?.localParticipant.identity) {
        // Agent is speaking
        this.onAgentSpeakingCallback?.( true);
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      if (track.kind === Track.Kind.Audio && participant.identity !== this.room?.localParticipant.identity) {
        // Agent stopped speaking
        this.onAgentSpeakingCallback?.(false);
      }
    });

    // Connection state changes
    this.room.on(RoomEvent.Connected, () => {
      this.onConnectionStateCallback?.('connected');
    });

    this.room.on(RoomEvent.Disconnected, () => {
      this.onConnectionStateCallback?.('disconnected');
    });

    this.room.on(RoomEvent.Reconnecting, () => {
      this.onConnectionStateCallback?.('reconnecting');
    });

    this.room.on(RoomEvent.Reconnected, () => {
      this.onConnectionStateCallback?.('connected');
    });
  }

  /**
   * Enable/disable microphone
   */
  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    if (this.room?.localParticipant) {
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
    }
  }

  /**
   * Send a text message to the agent
   */
  async sendMessage(message: string): Promise<void> {
    if (this.room) {
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify({ type: 'user_message', text: message }));
      await this.room.localParticipant.publishData(data, { reliable: true });
    }
  }

  /**
   * Register callback for agent messages
   */
  onMessage(callback: (message: AgentMessage) => void): void {
    this.onMessageCallback = callback;
  }

  /**
   * Register callback for agent speaking state
   */
  onAgentSpeaking(callback: (isSpeaking: boolean) => void): void {
    this.onAgentSpeakingCallback = callback;
  }

  /**
   * Register callback for connection state changes
   */
  onConnectionState(callback: (state: string) => void): void {
    this.onConnectionStateCallback = callback;
  }

  /**
   * Get current connection state
   */
  getConnectionState(): string {
    return this.room?.state || 'disconnected';
  }

  /**
   * Check if microphone is enabled
   */
  isMicrophoneEnabled(): boolean {
    return this.room?.localParticipant?.isMicrophoneEnabled ?? false;
  }
}

export const livekitService = new LiveKitVoiceService();
