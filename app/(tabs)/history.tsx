import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { isTimestampToday } from "@/lib/timer-utils";

const SESSION_HISTORY_KEY = "session_history";

type SessionHistoryItem = {
  type: string;
  durationMinutes: number;
  completedAt: number;
  label?: string;
};

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HistoryScreen() {
  const colors = useColors();
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);

  const loadHistory = useCallback(async () => {
    const stored = await AsyncStorage.getItem(SESSION_HISTORY_KEY);
    const parsed: SessionHistoryItem[] = stored ? JSON.parse(stored) : [];
    setSessions(parsed.filter((item) => isTimestampToday(item.completedAt)));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  const totals = useMemo(() => {
    const totalMinutes = sessions.reduce((sum, item) => sum + item.durationMinutes, 0);
    return { totalSessions: sessions.length, totalMinutes };
  }, [sessions]);

  const clearHistory = async () => {
    await AsyncStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify([]));
    setSessions([]);
  };

  return (
    <ScreenContainer className="px-5 pb-8">
      <View className="flex-1">
        <Text className="mt-3 text-2xl font-bold" style={{ color: colors.foreground }}>
          Today&apos;s Sessions
        </Text>

        {sessions.length === 0 ? (
          <View className="mt-8 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
            <Text style={{ color: colors.muted }}>No sessions yet. Start your first Pomodoro! 🎯</Text>
          </View>
        ) : (
          <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
            <View className="gap-3">
              {sessions.map((item, index) => (
                <View
                  key={`${item.completedAt}-${index}`}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                    • {item.durationMinutes} min {item.type} — {formatTime(item.completedAt)}
                    {item.label ? ` — "${item.label}"` : ""}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        <View className="mt-4 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
          <Text style={{ color: colors.foreground, fontWeight: "600" }}>
            Total today: {totals.totalSessions} sessions · {totals.totalMinutes} minutes
          </Text>
        </View>

        <Pressable onPress={clearHistory} className="mt-auto rounded-xl py-3" style={{ backgroundColor: colors.surface }}>
          <Text className="text-center" style={{ color: colors.error, fontWeight: "600" }}>
            Clear History
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
