import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useLiveKitVoiceAgent } from '../hooks/useLiveKitVoiceAgent';

export default function LiveKitOnboardingScreen() {
  const {
    isConnected,
    isAgentSpeaking,
    isMicEnabled,
    messages,
    connectionState,
    error,
    connect,
    disconnect,
    toggleMicrophone,
    sendMessage,
  } = useLiveKitVoiceAgent();

  const [userId] = useState(() => `user_${Date.now()}`);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  useEffect(() => {
    // Auto-connect on mount
    handleConnect();

    return () => {
      disconnect();
    };
  }, []);

  const handleConnect = async () => {
    try {
      await connect(userId);
    } catch (err) {
      Alert.alert(
        'Connection Error',
        'Failed to connect to voice agent. Please check your configuration and try again.\n\n' +
        'Make sure you have:\n' +
        '1. Set up a LiveKit server or account at cloud.livekit.io\n' +
        '2. Created a backend endpoint to generate tokens\n' +
        '3. Updated the token service with your endpoint URL'
      );
    }
  };

  const handleSendTextMessage = async () => {
    if (textInput.trim()) {
      await sendMessage(textInput);
      setTextInput('');
      setShowTextInput(false);
    }
  };

  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'connected':
        return { text: 'Connected', color: '#34C759' };
      case 'connecting':
        return { text: 'Connecting...', color: '#FF9500' };
      case 'reconnecting':
        return { text: 'Reconnecting...', color: '#FF9500' };
      case 'error':
        return { text: 'Error', color: '#FF3B30' };
      default:
        return { text: 'Disconnected', color: '#8E8E93' };
    }
  };

  const status = getConnectionStatus();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Voice Onboarding</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={styles.statusText}>{status.text}</Text>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Setup Required</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={handleConnect}>
            <Text style={styles.errorButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <ScrollView style={styles.messagesContainer}>
        {messages.length === 0 && !error && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {isConnected
                ? 'Start speaking to begin your onboarding...'
                : 'Connecting to voice agent...'}
            </Text>
          </View>
        )}

        {messages.map((message, index) => (
          <View key={index} style={styles.messageRow}>
            <View style={styles.messageBubble}>
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.messageTime}>
                {message.timestamp.toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ))}

        {isAgentSpeaking && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, styles.typingDotDelay1]} />
            <View style={[styles.typingDot, styles.typingDotDelay2]} />
          </View>
        )}
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        {showTextInput ? (
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={textInput}
              onChangeText={setTextInput}
              placeholder="Type your message..."
              autoFocus
              onSubmitEditing={handleSendTextMessage}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendTextMessage}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTextInput(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.micButton,
                isMicEnabled && styles.micButtonActive,
                !isConnected && styles.micButtonDisabled,
              ]}
              onPress={toggleMicrophone}
              disabled={!isConnected}
            >
              <Text style={styles.micIcon}>
                {isMicEnabled ? '🎤' : '🔇'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.instructionText}>
              {!isConnected
                ? 'Connecting...'
                : isMicEnabled
                ? 'Listening...'
                : 'Tap to speak'}
            </Text>

            <TouchableOpacity
              style={styles.textButton}
              onPress={() => setShowTextInput(true)}
            >
              <Text style={styles.textButtonLabel}>Type instead</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 12,
  },
  errorButton: {
    backgroundColor: '#856404',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  messageRow: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginRight: 4,
  },
  typingDotDelay1: {
    opacity: 0.6,
  },
  typingDotDelay2: {
    opacity: 0.3,
  },
  controls: {
    backgroundColor: '#FFF',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: '#FF3B30',
  },
  micButtonDisabled: {
    backgroundColor: '#CCC',
  },
  micIcon: {
    fontSize: 32,
  },
  instructionText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  textButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  textButtonLabel: {
    fontSize: 14,
    color: '#007AFF',
  },
  textInputContainer: {
    width: '100%',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
