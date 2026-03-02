import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fallbackTick, fallbackBell, fallbackBreakStart } from './fallback-sounds';

const TIMER_SOUND_ENABLED_KEY = '@settings/timer_sound_enabled';
const TIMER_SOUND_VOLUME_KEY = '@settings/timer_sound_volume';

class TimerAudioService {
  private tickSound: Audio.Sound | null = null;
  private bellSound: Audio.Sound | null = null;
  private breakSound: Audio.Sound | null = null;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private isLoaded = false;
  private isMuted = false;
  private volume = 0.5;

  async initialize(): Promise<void> {
    try {
      // Load user preferences
      const [enabledStr, volumeStr] = await Promise.all([
        AsyncStorage.getItem(TIMER_SOUND_ENABLED_KEY),
        AsyncStorage.getItem(TIMER_SOUND_VOLUME_KEY),
      ]);
      if (enabledStr === 'false') {
        this.isMuted = true;
      }
      if (volumeStr) {
        const parsed = parseFloat(volumeStr);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });

      // Try to load sounds from assets; if files are missing, fall back to vibration
      try {
        const { sound: tick } = await Audio.Sound.createAsync(
          require('@/assets/sounds/tick.mp3'),
          { shouldPlay: false, volume: this.volume }
        );
        this.tickSound = tick;
      } catch {
        // tick.mp3 not available — will use vibration fallback
      }

      try {
        const { sound: bell } = await Audio.Sound.createAsync(
          require('@/assets/sounds/bell.mp3'),
          { shouldPlay: false, volume: 1.0 }
        );
        this.bellSound = bell;
      } catch {
        // bell.mp3 not available — will use vibration fallback
      }

      try {
        const { sound: breakChime } = await Audio.Sound.createAsync(
          require('@/assets/sounds/break-start.mp3'),
          { shouldPlay: false, volume: 0.8 }
        );
        this.breakSound = breakChime;
      } catch {
        // break-start.mp3 not available — will use vibration fallback
      }

      this.isLoaded = true;
    } catch (error) {
      console.error('[Audio] Failed to initialize timer sounds:', error);
      // App must still work without sounds — never crash
      this.isLoaded = true; // Mark as loaded so fallbacks work
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopTicking();
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  async setVolume(vol: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      await AsyncStorage.setItem(TIMER_SOUND_VOLUME_KEY, String(this.volume));
      if (this.tickSound) {
        await this.tickSound.setVolumeAsync(this.volume);
      }
    } catch {
      // Ignore storage/volume errors
    }
  }

  async saveSoundEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(TIMER_SOUND_ENABLED_KEY, String(enabled));
    } catch {
      // Ignore storage errors
    }
  }

  startTicking(): void {
    if (this.isMuted || !this.isLoaded) return;
    // Clear any existing interval
    this.stopTicking();

    this.tickInterval = setInterval(async () => {
      if (this.isMuted) {
        this.stopTicking();
        return;
      }
      try {
        if (this.tickSound) {
          await this.tickSound.replayAsync();
        } else {
          fallbackTick();
        }
      } catch {
        // Ignore audio errors — try vibration fallback
        fallbackTick();
      }
    }, 1000);
  }

  stopTicking(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  async playSessionComplete(): Promise<void> {
    this.stopTicking();
    if (this.isMuted) return;
    try {
      if (this.bellSound) {
        await this.bellSound.replayAsync();
      } else {
        fallbackBell();
      }
    } catch {
      fallbackBell();
    }
  }

  async playBreakStart(): Promise<void> {
    if (this.isMuted) return;
    try {
      if (this.breakSound) {
        await this.breakSound.replayAsync();
      } else {
        fallbackBreakStart();
      }
    } catch {
      fallbackBreakStart();
    }
  }

  async cleanup(): Promise<void> {
    this.stopTicking();
    try {
      await this.tickSound?.unloadAsync();
    } catch {
      // Ignore cleanup errors
    }
    try {
      await this.bellSound?.unloadAsync();
    } catch {
      // Ignore cleanup errors
    }
    try {
      await this.breakSound?.unloadAsync();
    } catch {
      // Ignore cleanup errors
    }
    this.tickSound = null;
    this.bellSound = null;
    this.breakSound = null;
    this.isLoaded = false;
  }
}

export const timerAudio = new TimerAudioService();
