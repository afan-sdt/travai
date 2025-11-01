import { useEffect, useState, useCallback } from 'react';
import { livekitService, AgentMessage } from '../services/livekitService';
import { tokenService } from '../services/tokenService';

export interface VoiceAgentState {
  isConnected: boolean;
  isAgentSpeaking: boolean;
  isMicEnabled: boolean;
  messages: AgentMessage[];
  connectionState: string;
  error: string | null;
}

export function useLiveKitVoiceAgent() {
  const [state, setState] = useState<VoiceAgentState>({
    isConnected: false,
    isAgentSpeaking: false,
    isMicEnabled: false,
    messages: [],
    connectionState: 'disconnected',
    error: null,
  });

  // Connect to LiveKit voice agent
  const connect = useCallback(async (userId: string) => {
    try {
      setState(prev => ({ ...prev, error: null, connectionState: 'connecting' }));

      // Request token from backend
      const token = await tokenService.requestOnboardingToken(userId);

      // Connect to LiveKit
      await livekitService.connect(token);

      setState(prev => ({ ...prev, isConnected: true, connectionState: 'connected' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        connectionState: 'error',
      }));
      console.error('Failed to connect to voice agent:', error);
    }
  }, []);

  // Disconnect from LiveKit
  const disconnect = useCallback(async () => {
    try {
      await livekitService.disconnect();
      setState(prev => ({
        ...prev,
        isConnected: false,
        connectionState: 'disconnected',
      }));
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }, []);

  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    try {
      const newState = !state.isMicEnabled;
      await livekitService.setMicrophoneEnabled(newState);
      setState(prev => ({ ...prev, isMicEnabled: newState }));
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    }
  }, [state.isMicEnabled]);

  // Send text message to agent
  const sendMessage = useCallback(async (text: string) => {
    try {
      await livekitService.sendMessage(text);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    // Listen for agent messages
    livekitService.onMessage((message) => {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
    });

    // Listen for agent speaking state
    livekitService.onAgentSpeaking((isSpeaking) => {
      setState(prev => ({ ...prev, isAgentSpeaking: isSpeaking }));
    });

    // Listen for connection state changes
    livekitService.onConnectionState((connectionState) => {
      setState(prev => ({
        ...prev,
        connectionState,
        isConnected: connectionState === 'connected',
      }));
    });

    // Cleanup on unmount
    return () => {
      livekitService.disconnect();
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    toggleMicrophone,
    sendMessage,
  };
}
