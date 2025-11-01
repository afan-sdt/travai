import { OnboardingStep } from '../types/voiceAgent';

export class AIService {
  private currentStepIndex: number = 0;
  private onboardingSteps: OnboardingStep[] = [
    {
      id: '1',
      question: "Hello! Welcome to our app. I'm your voice assistant. What's your name?",
      completed: false,
    },
    {
      id: '2',
      question: "Nice to meet you! What brings you to our app today?",
      completed: false,
    },
    {
      id: '3',
      question: "Great! Are you interested in exploring features like productivity, entertainment, or learning?",
      completed: false,
    },
    {
      id: '4',
      question: "Perfect! Would you like to enable notifications to stay updated?",
      completed: false,
    },
    {
      id: '5',
      question: "All set! You're ready to get started. Would you like a quick tour of the app?",
      completed: false,
    },
  ];

  getCurrentQuestion(): string {
    if (this.currentStepIndex < this.onboardingSteps.length) {
      return this.onboardingSteps[this.currentStepIndex].question;
    }
    return "Thank you for completing the onboarding! Let's get started.";
  }

  processUserResponse(userInput: string): string {
    if (this.currentStepIndex < this.onboardingSteps.length) {
      // Mark current step as completed
      this.onboardingSteps[this.currentStepIndex].completed = true;
      this.onboardingSteps[this.currentStepIndex].answer = userInput;

      // Move to next step
      this.currentStepIndex++;

      // Return next question or completion message
      if (this.currentStepIndex < this.onboardingSteps.length) {
        return this.onboardingSteps[this.currentStepIndex].question;
      } else {
        return "Wonderful! Your onboarding is complete. Welcome aboard!";
      }
    }

    return "Thank you! Your onboarding is complete.";
  }

  isOnboardingComplete(): boolean {
    return this.currentStepIndex >= this.onboardingSteps.length;
  }

  getProgress(): number {
    return (this.currentStepIndex / this.onboardingSteps.length) * 100;
  }

  reset(): void {
    this.currentStepIndex = 0;
    this.onboardingSteps.forEach(step => {
      step.completed = false;
      step.answer = undefined;
    });
  }

  // This method can be extended to integrate with actual AI services
  // like OpenAI's API for more dynamic conversations
  async processWithAI(userInput: string): Promise<string> {
    // Placeholder for AI integration
    // In production, this would call an AI API like OpenAI
    return this.processUserResponse(userInput);
  }
}

export const aiService = new AIService();
