import { Vibration } from 'react-native';

/** Subtle vibration as fallback for tick sound */
export function fallbackTick(): void {
  try {
    Vibration.vibrate(20);
  } catch {
    // Ignore vibration errors
  }
}

/** Longer vibration pattern as fallback for session completion bell */
export function fallbackBell(): void {
  try {
    Vibration.vibrate([0, 200, 100, 200, 100, 400]);
  } catch {
    // Ignore vibration errors
  }
}

/** Short vibration pattern as fallback for break start chime */
export function fallbackBreakStart(): void {
  try {
    Vibration.vibrate([0, 150, 100, 150]);
  } catch {
    // Ignore vibration errors
  }
}
