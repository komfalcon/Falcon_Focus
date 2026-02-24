import { ScrollView, Text, View, Pressable, TouchableOpacity, Animated } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useOnboarding } from '@/lib/onboarding-context';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

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

  // Breathing animation for falcon mascot
  const breatheAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breatheAnim]);

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
            <Animated.Text style={{ fontSize: 56, marginBottom: 16, transform: [{ scale: breatheAnim }] }}>🦅</Animated.Text>
            <Text className="text-3xl font-bold text-foreground mb-2 tracking-tight">Falcon Focus</Text>
            <Text className="text-sm font-bold" style={{ color: colors.accent }}>Sharpen Your Vision. Soar to Success.</Text>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row gap-2 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                className="flex-1 h-1.5 rounded-full"
                style={{ backgroundColor: i <= step ? colors.primary : colors.border }}
              />
            ))}
          </View>

          {/* Step 1: Subjects */}
          {step === 1 && (
            <View>
              <Text className="text-2xl font-bold text-foreground mb-2">What do you study?</Text>
              <Text className="text-sm text-muted mb-6">Select your main subjects</Text>

              <View className="flex-row flex-wrap gap-3 mb-8">
                {SUBJECTS.map((subject) => (
                  <Pressable
                    key={subject}
                    className="px-5 py-3 rounded-2xl active:opacity-90"
                    style={{
                      backgroundColor: selectedSubjects.includes(subject) ? colors.primary : colors.surface,
                      borderWidth: 1.5,
                      borderColor: selectedSubjects.includes(subject) ? colors.primary : colors.border,
                      shadowColor: selectedSubjects.includes(subject) ? colors.primary : '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: selectedSubjects.includes(subject) ? 0.2 : 0.03,
                      shadowRadius: 4,
                      elevation: selectedSubjects.includes(subject) ? 2 : 1,
                    }}
                    onPress={() => toggleSubject(subject)}
                  >
                    <Text
                      className={`text-sm font-bold ${
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
                    className="p-4 rounded-2xl active:opacity-90"
                    style={{
                      backgroundColor: learningStyle === style ? colors.primary : colors.surface,
                      borderWidth: 1.5,
                      borderColor: learningStyle === style ? colors.primary : colors.border,
                      shadowColor: learningStyle === style ? colors.primary : '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: learningStyle === style ? 0.2 : 0.03,
                      shadowRadius: 6,
                      elevation: learningStyle === style ? 2 : 1,
                    }}
                    onPress={() => setLearningStyle(style)}
                  >
                    <Text
                      className={`text-base font-bold ${
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

              <View
                className="rounded-2xl p-5 mb-8"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
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

              <View
                className="rounded-2xl p-6 mb-6 overflow-hidden"
                style={{
                  backgroundColor: colors.secondary,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.18,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Animated.Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 16, transform: [{ scale: breatheAnim }] }}>🦅</Animated.Text>
                <Text className="text-lg font-bold text-white text-center mb-3">Falcon Focus</Text>
                <Text className="text-sm text-center leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  Born from one student's spark to help thousands soar.
                </Text>
              </View>

              <View
                className="rounded-2xl p-5 mb-6"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Text className="text-xs font-bold mb-2" style={{ color: colors.accent }}>FOUNDER</Text>
                <Text className="text-base font-bold text-foreground mb-3">Korede Omotosho</Text>
                <Text className="text-sm text-foreground leading-relaxed">
                  Falcon Focus is designed to be the ultimate study companion for students 13-25, combining powerful learning tools with immersive gamification to make studying engaging, effective, and inspiring.
                </Text>
              </View>

              <View
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: colors.accent + '12',
                  borderWidth: 1,
                  borderColor: colors.accent + '30',
                }}
              >
                <Text className="text-sm font-bold mb-2" style={{ color: colors.accent }}>🎯 Your Journey Starts Here</Text>
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
                className="flex-1 rounded-2xl py-4 active:opacity-80"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  elevation: 2,
                }}
                onPress={handleBack}
              >
                <Text className="text-center font-bold text-foreground text-base">Back</Text>
              </Pressable>
            )}
            <Pressable
              className="flex-1 rounded-2xl py-4 active:opacity-80"
              style={{
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={handleNext}
            >
              <Text className="text-center font-bold text-white text-base">
                {step === 4 ? 'Start Soaring' : 'Next'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
