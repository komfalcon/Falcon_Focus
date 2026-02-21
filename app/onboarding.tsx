import { ScrollView, Text, View, Pressable, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useOnboarding } from '@/lib/onboarding-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const SUBJECTS = ['Mathematics', 'Science', 'Languages', 'History', 'Art', 'Programming', 'Business', 'Other'];
const LEARNING_STYLES = ['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic'];

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState('');
  const [goals, setGoals] = useState('');

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleNext = async () => {
    if (step === 1 && selectedSubjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }
    if (step === 2 && !learningStyle) {
      alert('Please select a learning style');
      return;
    }
    if (step === 3) {
      await completeOnboarding({
        isCompleted: true,
        subjects: selectedSubjects,
        learningStyle,
        goals: goals.split(',').map((g) => g.trim()),
      });
      router.replace('/(tabs)');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          {/* Header with Logo */}
          <View className="items-center mb-8">
            <Text className="text-5xl mb-4">🦅</Text>
            <Text className="text-3xl font-bold text-foreground mb-2">Falcon Focus</Text>
            <Text className="text-sm text-primary font-semibold">Sharpen Your Vision. Soar to Success.</Text>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row gap-2 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                className={`flex-1 h-1 rounded-full ${
                  i <= step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </View>

          {/* Step 1: Subjects */}
          {step === 1 && (
            <View>
              <Text className="text-2xl font-bold text-foreground mb-2">What do you study?</Text>
              <Text className="text-sm text-muted mb-6">Select your main subjects</Text>

              <View className="flex-row flex-wrap gap-2 mb-8">
                {SUBJECTS.map((subject) => (
                  <Pressable
                    key={subject}
                    className={`px-4 py-2 rounded-full border ${
                      selectedSubjects.includes(subject)
                        ? 'bg-primary border-primary'
                        : 'bg-surface border-border'
                    }`}
                    onPress={() => toggleSubject(subject)}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selectedSubjects.includes(subject) ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      {subject}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Step 2: Learning Style */}
          {step === 2 && (
            <View>
              <Text className="text-2xl font-bold text-foreground mb-2">How do you learn best?</Text>
              <Text className="text-sm text-muted mb-6">Select your learning style</Text>

              <View className="gap-3 mb-8">
                {LEARNING_STYLES.map((style) => (
                  <Pressable
                    key={style}
                    className={`p-4 rounded-lg border ${
                      learningStyle === style
                        ? 'bg-primary border-primary'
                        : 'bg-surface border-border'
                    }`}
                    onPress={() => setLearningStyle(style)}
                  >
                    <Text
                      className={`text-base font-semibold ${
                        learningStyle === style ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      {style}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <View>
              <Text className="text-2xl font-bold text-foreground mb-2">What are your learning goals?</Text>
              <Text className="text-sm text-muted mb-6">Enter your goals (comma-separated)</Text>

              <View className="bg-surface rounded-lg p-4 border border-border mb-8">
                <Text className="text-sm text-foreground leading-relaxed">
                  Example: Pass Math exam, Learn Spanish, Complete Python course
                </Text>
              </View>
            </View>
          )}

          {/* Step 4: Founder Story */}
          {step === 4 && (
            <View>
              <Text className="text-2xl font-bold text-foreground mb-4">Meet Your Falcon Coach</Text>

              <View className="bg-gradient-to-r from-secondary to-primary rounded-lg p-6 mb-6 border border-primary/30">
                <Text className="text-5xl text-center mb-4">🦅</Text>
                <Text className="text-lg font-bold text-white text-center mb-3">Falcon Focus</Text>
                <Text className="text-sm text-white/90 text-center leading-relaxed">
                  Born from one student's spark to help thousands soar.
                </Text>
              </View>

              <View className="bg-surface rounded-lg p-4 border border-border mb-6">
                <Text className="text-xs font-semibold text-primary mb-2">FOUNDER</Text>
                <Text className="text-base font-bold text-foreground mb-3">Korede Omotosho</Text>
                <Text className="text-sm text-foreground leading-relaxed">
                  Falcon Focus is designed to be the ultimate study companion for students 13-25, combining powerful learning tools with immersive gamification to make studying engaging, effective, and inspiring.
                </Text>
              </View>

              <View className="bg-accent/10 rounded-lg p-4 border border-accent">
                <Text className="text-sm text-accent font-semibold mb-2">🎯 Your Journey Starts Here</Text>
                <Text className="text-sm text-foreground leading-relaxed">
                  You're about to embark on an epic flight to success. Sharpen your vision, earn feathers, climb the Falcon's Ascent, and soar to your goals. Let's begin!
                </Text>
              </View>
            </View>
          )}

          {/* Navigation Buttons */}
          <View className="flex-row gap-3 mt-8">
            {step > 1 && (
              <Pressable
                className="flex-1 bg-surface rounded-lg p-4 border border-border active:opacity-80"
                onPress={handleBack}
              >
                <Text className="text-center font-semibold text-foreground">Back</Text>
              </Pressable>
            )}
            <Pressable
              className="flex-1 bg-primary rounded-lg p-4 active:opacity-80"
              onPress={handleNext}
            >
              <Text className="text-center font-semibold text-white">
                {step === 4 ? 'Start Soaring' : 'Next'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
