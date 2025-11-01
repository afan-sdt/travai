import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { voiceService } from '../services/voiceService';
import { aiService } from '../services/aiService';
import { VoiceMessage } from '../types/voiceAgent';

export default function VoiceOnboardingScreen() {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    initializeVoiceAgent();
  }, []);

  const initializeVoiceAgent = async () => {
    try {
      await voiceService.initialize();
      setIsInitialized(true);

      // Start with first question
      const firstQuestion = aiService.getCurrentQuestion();
      const welcomeMessage: VoiceMessage = {
        id: Date.now().toString(),
        text: firstQuestion,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
      await speakMessage(firstQuestion);
    } catch (error) {
      console.error('Failed to initialize voice agent:', error);
      alert('Failed to initialize microphone. Please grant permission and restart.');
    }
  };

  const speakMessage = async (text: string) => {
    setIsSpeaking(true);
    await voiceService.speak(text);
    setIsSpeaking(false);
  };

  const handleStartRecording = async () => {
    if (!isInitialized || isSpeaking || isProcessing) {
      return;
    }

    try {
      setIsRecording(true);
      await voiceService.startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) {
      return;
    }

    try {
      setIsRecording(false);
      setIsProcessing(true);
      await voiceService.stopRecording();

      // Simulate voice-to-text processing
      // In production, you would use a service like Google Speech-to-Text
      const simulatedUserInput = "This is a simulated response";

      const userMessage: VoiceMessage = {
        id: Date.now().toString(),
        text: simulatedUserInput,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Process with AI
      const aiResponse = await aiService.processWithAI(simulatedUserInput);
      setProgress(aiService.getProgress());

      const aiMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);

      // Speak the response
      await speakMessage(aiResponse);
    } catch (error) {
      console.error('Failed to process recording:', error);
      setIsProcessing(false);
    }
  };

  const handleSkipToText = () => {
    // Allow user to type instead of speaking
    alert('Text input feature coming soon!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Onboarding</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.isUser ? styles.userMessageRow : styles.aiMessageRow,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.aiText,
                ]}
              >
                {message.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.controls}>
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}

        {!isProcessing && (
          <>
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
                (isSpeaking || !isInitialized) && styles.recordButtonDisabled,
              ]}
              onPressIn={handleStartRecording}
              onPressOut={handleStopRecording}
              disabled={isSpeaking || !isInitialized}
            >
              <View style={styles.recordButtonInner}>
                {isRecording ? (
                  <View style={styles.recordingIndicator} />
                ) : (
                  <Text style={styles.micIcon}>🎤</Text>
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.instructionText}>
              {isSpeaking
                ? 'Listening...'
                : isRecording
                ? 'Release to send'
                : 'Hold to speak'}
            </Text>

            <TouchableOpacity
              style={styles.textButton}
              onPress={handleSkipToText}
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
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageRow: {
    marginBottom: 12,
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  aiMessageRow: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  aiBubble: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
  },
  aiText: {
    color: '#333',
  },
  controls: {
    backgroundColor: '#FFF',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: '#FF3B30',
  },
  recordButtonDisabled: {
    backgroundColor: '#CCC',
  },
  recordButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 32,
  },
  recordingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#FFF',
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
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
