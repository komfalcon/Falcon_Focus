import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { timerAudio } from "@/lib/audio/timer-sounds";
import { PushNotificationsService } from "@/lib/push-notifications-service";
import { formatTimerValue } from "@/lib/timer-utils";

type TimerPreset = "pomodoro" | "short_break" | "long_break";

const SESSION_HISTORY_KEY = "session_history";
const SESSION_LABEL_MAX_LENGTH = 80;

const PRESETS: Record<TimerPreset, { label: string; durationMinutes: number; modeLabel: string }> = {
  pomodoro: { label: "Pomodoro", durationMinutes: 25, modeLabel: "POMODORO" },
  short_break: { label: "Short Break", durationMinutes: 5, modeLabel: "BREAK" },
  long_break: { label: "Long Break", durationMinutes: 15, modeLabel: "BREAK" },
};

export default function FocusScreen() {
  const colors = useColors();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [preset, setPreset] = useState<TimerPreset>("pomodoro");
  const [timeRemaining, setTimeRemaining] = useState(PRESETS.pomodoro.durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionLabel, setSessionLabel] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [suggestion, setSuggestion] = useState("");

  const activePreset = useMemo(() => PRESETS[preset], [preset]);

  useEffect(() => {
    timerAudio.initialize().then(async () => {
      const muted = await timerAudio.getMuted();
      setIsMuted(muted);
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerAudio.stopTicking();
      timerAudio.cleanup();
    };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      setTimeRemaining(activePreset.durationMinutes * 60);
      setIsPaused(false);
    }
  }, [activePreset.durationMinutes, isRunning]);

  useEffect(() => {
    if (!isRunning || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          void handleSessionComplete().catch((error) => {
            console.error("[Focus] Failed to complete session:", error);
            setSuggestion("Could not complete session. Please reset and try again.");
            setIsRunning(false);
            setIsPaused(false);
          });
          return 0;
        }

        void timerAudio.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, isPaused, preset, sessionLabel, completedPomodoros]);

  const saveSessionHistory = async (type: string, durationMinutes: number, label?: string) => {
    const item = {
      type,
      durationMinutes,
      completedAt: Date.now(),
      ...(label?.trim() ? { label: label.trim() } : {}),
    };

    const stored = await AsyncStorage.getItem(SESSION_HISTORY_KEY);
    const history = stored ? JSON.parse(stored) : [];
    history.unshift(item);
    await AsyncStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(history));
  };

  const handleSessionComplete = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRunning(false);
    setIsPaused(false);

    const durationMinutes = PRESETS[preset].durationMinutes;
    await saveSessionHistory(PRESETS[preset].label, durationMinutes, sessionLabel);

    await timerAudio.playSessionComplete();
    await PushNotificationsService.sendSessionCompleteNotification();

    if (preset === "pomodoro") {
      const nextCount = completedPomodoros + 1;
      setCompletedPomodoros(nextCount);
      if (nextCount % 4 === 0) {
        setPreset("long_break");
        setSuggestion("Great work — long break suggested.");
      } else {
        setPreset("short_break");
        setSuggestion("Pomodoro complete — short break suggested.");
      }
      await timerAudio.playBreakStart();
    } else {
      setPreset("pomodoro");
      setSuggestion("Break complete — time for a Pomodoro.");
    }
  };

  const handleStart = () => {
    setSuggestion("");
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
    timerAudio.stopTicking();
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerAudio.stopTicking();
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(PRESETS[preset].durationMinutes * 60);
    setSuggestion("");
  };

  const handlePresetChange = (nextPreset: TimerPreset) => {
    if (isRunning) return;
    setPreset(nextPreset);
    setSuggestion("");
    setTimeRemaining(PRESETS[nextPreset].durationMinutes * 60);
  };

  const handleMuteToggle = async () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    await timerAudio.setMuted(nextMuted);
  };

  return (
    <ScreenContainer className="px-5 pb-8">
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <View className="flex-row justify-end pt-2">
          <Pressable
            onPress={handleMuteToggle}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.surface }}
          >
            <Text style={{ fontSize: 18 }}>{isMuted ? "🔇" : "🔊"}</Text>
          </Pressable>
        </View>

        <TextInput
          value={sessionLabel}
          onChangeText={setSessionLabel}
          placeholder="What are you studying?"
          placeholderTextColor={colors.muted}
          editable={!isRunning}
          className="mt-4 rounded-xl px-4 py-3"
          style={{
            backgroundColor: colors.surface,
            color: colors.foreground,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          maxLength={SESSION_LABEL_MAX_LENGTH}
        />

        <View className="mt-10 items-center">
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 260,
              height: 260,
              borderWidth: 10,
              borderColor: colors.primary,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ color: colors.foreground, fontSize: 48, fontWeight: "700" }}>
              {formatTimerValue(timeRemaining)}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, fontWeight: "700", marginTop: 8 }}>
              {activePreset.modeLabel}
            </Text>
          </View>
          <Text className="mt-3 text-sm" style={{ color: colors.muted }}>
            Time remaining: {formatTimerValue(timeRemaining)}
          </Text>
          {suggestion ? (
            <Text className="mt-2 text-sm" style={{ color: colors.primary }}>
              {suggestion}
            </Text>
          ) : null}
        </View>

        <View className="mt-10 flex-row justify-center gap-3">
          {!isRunning ? (
            <Pressable
              onPress={handleStart}
              className="rounded-xl px-5 py-3"
              style={{ backgroundColor: colors.primary }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Start</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handlePause}
              className="rounded-xl px-5 py-3"
              style={{ backgroundColor: colors.primary }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>{isPaused ? "Resume" : "Pause"}</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleReset}
            className="rounded-xl px-5 py-3"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Text style={{ color: colors.foreground, fontWeight: "700" }}>Reset</Text>
          </Pressable>
        </View>

        <View className="mt-8 flex-row justify-center gap-2">
          {(Object.keys(PRESETS) as TimerPreset[]).map((key) => {
            const selected = key === preset;
            return (
              <Pressable
                key={key}
                disabled={isRunning}
                onPress={() => handlePresetChange(key)}
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: selected ? colors.primary : colors.surface,
                  opacity: isRunning && !selected ? 0.5 : 1,
                }}
              >
                <Text style={{ color: selected ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>
                  {PRESETS[key].label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScreenContainer>
  );
}
