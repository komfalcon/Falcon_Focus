import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  isCompleted: boolean;
  subjects: string[];
  learningStyle: string;
  goals: string[];
}

interface OnboardingContextType {
  onboardingState: OnboardingState;
  completeOnboarding: (data: OnboardingState) => Promise<void>;
  checkOnboarding: () => Promise<boolean>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isCompleted: false,
    subjects: [],
    learningStyle: '',
    goals: [],
  });

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const stored = await AsyncStorage.getItem('onboarding_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        setOnboardingState(parsed);
        return parsed.isCompleted;
      }
      return false;
    } catch (error) {
      console.error('Error checking onboarding:', error);
      return false;
    }
  };

  const completeOnboarding = async (data: OnboardingState) => {
    try {
      const updatedState = { ...data, isCompleted: true };
      await AsyncStorage.setItem('onboarding_state', JSON.stringify(updatedState));
      setOnboardingState(updatedState);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <OnboardingContext.Provider value={{ onboardingState, completeOnboarding, checkOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
