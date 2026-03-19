import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { Vibration } from "react-native";

const TIMER_MUTED_KEY = "timer_muted";

class TimerAudioService {
  private tickSound: Audio.Sound | null = null;
  private bellSound: Audio.Sound | null = null;
  private breakSound: Audio.Sound | null = null;
  private isLoaded = false;
  private isMuted = false;

  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    const muted = await AsyncStorage.getItem(TIMER_MUTED_KEY);
    this.isMuted = muted === "true";

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
      staysActiveInBackground: true,
      playThroughEarpieceAndroid: false,
    });

    const [{ sound: tick }, { sound: bell }, { sound: breakSound }] = await Promise.all([
      Audio.Sound.createAsync(require("@/assets/sounds/tick.mp3"), {
        shouldPlay: false,
        volume: 0.85,
      }),
      Audio.Sound.createAsync(require("@/assets/sounds/bell.mp3"), {
        shouldPlay: false,
        volume: 1.0,
      }),
      Audio.Sound.createAsync(require("@/assets/sounds/break-start.mp3"), {
        shouldPlay: false,
        volume: 0.8,
      }),
    ]);

    this.tickSound = tick;
    this.bellSound = bell;
    this.breakSound = breakSound;
    this.isLoaded = true;
  }

  async getMuted(): Promise<boolean> {
    if (!this.isLoaded) {
      const muted = await AsyncStorage.getItem(TIMER_MUTED_KEY);
      this.isMuted = muted === "true";
    }
    return this.isMuted;
  }

  async playTick(): Promise<void> {
    if (this.isMuted) return;
    await this.tickSound?.replayAsync();
  }

  stopTicking(): void {
    // Ticks are replayed per-second via timer loop; no persistent sound to stop.
  }

  async playSessionComplete(): Promise<void> {
    this.stopTicking();

    for (let i = 0; i < 3; i++) {
      await this.bellSound?.replayAsync();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
  }

  async playBreakStart(): Promise<void> {
    await this.breakSound?.replayAsync();
  }

  async setMuted(muted: boolean): Promise<void> {
    this.isMuted = muted;
    if (muted) this.stopTicking();
    await AsyncStorage.setItem(TIMER_MUTED_KEY, String(muted));
  }

  async cleanup(): Promise<void> {
    await this.tickSound?.unloadAsync();
    await this.bellSound?.unloadAsync();
    await this.breakSound?.unloadAsync();

    this.tickSound = null;
    this.bellSound = null;
    this.breakSound = null;
    this.isLoaded = false;
  }
}

export const timerAudio = new TimerAudioService();
