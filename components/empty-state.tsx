import { View, Text, Pressable } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const colors = useColors();

  return (
    <View
      className="rounded-2xl p-8 items-center"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text className="text-5xl mb-4">{emoji}</Text>
      <Text
        className="text-lg font-bold text-center mb-2"
        style={{ color: colors.foreground }}
      >
        {title}
      </Text>
      <Text
        className="text-sm text-center mb-4"
        style={{ color: colors.muted }}
      >
        {subtitle}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          className="rounded-xl px-6 py-3 active:opacity-80"
          style={{ backgroundColor: colors.primary }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAction();
          }}
        >
          <Text className="text-sm font-bold text-white">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
