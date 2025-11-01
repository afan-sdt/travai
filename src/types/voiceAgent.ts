export interface VoiceMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface OnboardingStep {
  id: string;
  question: string;
  completed: boolean;
  answer?: string;
}

export interface OnboardingData {
  name?: string;
  preferences?: string[];
  completed: boolean;
}
