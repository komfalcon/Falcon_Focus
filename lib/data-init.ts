import AsyncStorage from '@react-native-async-storage/async-storage';

interface DefaultQuest {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
  type: string;
}

interface DefaultBadge {
  id: string;
  name: string;
  earned: boolean;
}

function generateDefaultQuests(): DefaultQuest[] {
  return [
    { id: '1', title: 'Complete a study session', xp: 50, completed: false, type: 'session' },
    { id: '2', title: 'Log your energy level', xp: 25, completed: false, type: 'energy' },
    { id: '3', title: 'Study for 25 minutes', xp: 75, completed: false, type: 'focus' },
  ];
}

function generateDefaultBadges(): DefaultBadge[] {
  return [
    { id: 'first_flight', name: 'First Flight', earned: false },
    { id: 'week_warrior', name: 'Week Warrior', earned: false },
    { id: 'century_club', name: 'Century Club', earned: false },
    { id: 'night_owl', name: 'Night Owl', earned: false },
    { id: 'speed_demon', name: 'Speed Demon', earned: false },
    { id: 'consistency_king', name: 'Consistency King', earned: false },
  ];
}

/**
 * Called once on first app launch (check AsyncStorage key 'initialized_{userId}')
 * Sets up default empty state for new users.
 * Never seeds fake data.
 */
export async function initializeNewUser(userId: string): Promise<void> {
  try {
    const initialized = await AsyncStorage.getItem(`initialized_${userId}`);
    if (initialized) return;

    await AsyncStorage.multiSet([
      [`study_sessions_${userId}`, JSON.stringify([])],
      [`study_goals_${userId}`, JSON.stringify([])],
      [`energy_logs_${userId}`, JSON.stringify([])],
      [`flock_activity_${userId}`, JSON.stringify([])],
      [`daily_quests_${userId}`, JSON.stringify(generateDefaultQuests())],
      [
        `gamification_${userId}`,
        JSON.stringify({
          xp: 0,
          feathers: 0,
          streak: 0,
          level: 'Fledgling',
          badges: generateDefaultBadges(),
        }),
      ],
      [`initialized_${userId}`, 'true'],
    ]);
  } catch (error) {
    console.error('[data-init] Failed to initialize new user:', error);
  }
}
