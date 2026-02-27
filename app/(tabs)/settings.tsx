import {
  ScrollView, Text, View, Pressable, Switch, Alert, TextInput, Modal,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect, useCallback } from 'react';
import { useThemeContext } from '@/lib/theme-provider';
import { PushNotificationsService, type PushNotificationPreferences } from '@/lib/push-notifications-service';
import { useAuthContext } from '@/lib/auth/auth-context';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GamificationEngine } from '@/lib/gamification-engine';
import { useStudy } from '@/lib/study-context';
import { SkeletonCard } from '@/components/skeleton';

// ── Storage keys ──────────────────────────────────────────────────────
const KEYS = {
  REDUCE_ANIMATIONS: '@settings/reduce_animations',
  DEFAULT_TIMER: '@settings/default_timer',
  ENERGY_FREQUENCY: '@settings/energy_frequency',
} as const;

type ThemeOption = 'light' | 'dark' | 'system';
type TimerMode = 'pomodoro' | 'falcon_dive';
type EnergyFrequency = 'after_session' | 'daily' | 'manual';

// ── Helpers ───────────────────────────────────────────────────────────
const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

function getAltitudeLabel(level: string): string {
  const map: Record<string, string> = {
    Fledgling: '🐣 Fledgling',
    Soaring: '⚡ Soaring',
    Apex: '🦅 Apex',
  };
  return map[level] ?? `⚡ ${level}`;
}

// ── Reusable sub-components ───────────────────────────────────────────
function SectionHeader({ label, color }: { label: string; color?: string }) {
  return (
    <Text
      className="text-xs font-bold uppercase mb-4 tracking-wider"
      style={color ? { color } : undefined}
    >
      {!color && (
        <Text className="text-muted dark:text-muted-dark">{label}</Text>
      )}
      {color ? label : null}
    </Text>
  );
}

function Card({
  children,
  surface,
  className: cn,
  style: extraStyle,
}: {
  children: React.ReactNode;
  surface: string;
  className?: string;
  style?: Record<string, unknown>;
}) {
  return (
    <View
      className={`rounded-2xl p-4 ${cn ?? ''}`}
      style={{
        backgroundColor: surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        ...extraStyle,
      }}
    >
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
  surface,
  trackColors,
  thumbColors,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  surface: string;
  trackColors: { false: string; true: string };
  thumbColors: { off: string; on: string };
}) {
  return (
    <Card surface={surface} className="flex-row justify-between items-center">
      <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark flex-1">
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={(v) => {
          haptic();
          onValueChange(v);
        }}
        trackColor={trackColors}
        thumbColor={value ? thumbColors.on : thumbColors.off}
      />
    </Card>
  );
}

function SegmentedControl<T extends string>({
  options,
  selected,
  onChange,
  primary,
  surface,
  foreground,
}: {
  options: { label: string; value: T }[];
  selected: T;
  onChange: (v: T) => void;
  primary: string;
  surface: string;
  foreground: string;
}) {
  return (
    <View
      className="flex-row rounded-xl overflow-hidden"
      style={{ backgroundColor: surface }}
    >
      {options.map((o) => {
        const active = o.value === selected;
        return (
          <Pressable
            key={o.value}
            className="flex-1 py-2 items-center rounded-xl"
            style={active ? { backgroundColor: primary } : undefined}
            onPress={() => {
              haptic();
              onChange(o.value);
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: active ? '#fff' : foreground }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ActionRow({
  label,
  subtitle,
  onPress,
  surface,
  labelColor,
}: {
  label: string;
  subtitle?: string;
  onPress: () => void;
  surface: string;
  labelColor?: string;
}) {
  return (
    <Pressable
      className="rounded-2xl p-4 active:opacity-80"
      style={{ backgroundColor: surface }}
      onPress={() => {
        haptic();
        onPress();
      }}
    >
      <Text
        className="text-sm font-semibold"
        style={labelColor ? { color: labelColor } : undefined}
      >
        {!labelColor && (
          <Text className="text-foreground dark:text-foreground-dark">{label}</Text>
        )}
        {labelColor ? label : null}
      </Text>
      {subtitle && (
        <Text className="text-xs text-muted dark:text-muted-dark mt-1">{subtitle}</Text>
      )}
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────
export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = useColors();
  const { setColorScheme } = useThemeContext();
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const study = useStudy();

  // Profile loading skeleton
  const [profileLoading, setProfileLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setProfileLoading(false), 600);
    return () => clearTimeout(id);
  }, []);

  // ── Theme ──
  const [themeOption, setThemeOption] = useState<ThemeOption>(colorScheme);
  const handleThemeChange = useCallback(
    (opt: ThemeOption) => {
      setThemeOption(opt);
      if (opt === 'system') {
        // fall back to OS preference
        const sys =
          typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        setColorScheme(sys);
      } else {
        setColorScheme(opt);
      }
    },
    [setColorScheme],
  );

  // ── Reduce animations ──
  const [reduceAnimations, setReduceAnimations] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(KEYS.REDUCE_ANIMATIONS).then((v) => {
      if (v === 'true') setReduceAnimations(true);
    });
  }, []);

  // ── Notifications ──
  const [notifPrefs, setNotifPrefs] = useState<PushNotificationPreferences | null>(null);
  useEffect(() => {
    PushNotificationsService.loadPreferences().then(setNotifPrefs);
  }, []);

  const updateNotif = useCallback(
    async (patch: Partial<PushNotificationPreferences>) => {
      if (!notifPrefs) return;
      const next = { ...notifPrefs, ...patch };
      setNotifPrefs(next);
      await PushNotificationsService.savePreferences(next);
    },
    [notifPrefs],
  );

  // ── Study preferences ──
  const [defaultTimer, setDefaultTimer] = useState<TimerMode>('pomodoro');
  const [energyFreq, setEnergyFreq] = useState<EnergyFrequency>('after_session');
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEYS.DEFAULT_TIMER),
      AsyncStorage.getItem(KEYS.ENERGY_FREQUENCY),
    ]).then(([t, e]) => {
      if (t === 'pomodoro' || t === 'falcon_dive') setDefaultTimer(t);
      if (e === 'after_session' || e === 'daily' || e === 'manual') setEnergyFreq(e);
    });
  }, []);

  // ── Contact modal ──
  const [contactVisible, setContactVisible] = useState(false);

  // ── Delete confirmation ──
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // ── Derived ──
  const trackColors = { false: colors.border, true: colors.primary };
  const thumbColors = { off: colors.muted, on: colors.primary };
  const altitudeLabel = user
    ? getAltitudeLabel(GamificationEngine.getAltitudeLevel(user.altitude))
    : '';

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground dark:text-foreground-dark mb-6 tracking-tight">
            Settings
          </Text>

          {/* ─── SECTION 1 — Profile ─────────────────────────── */}
          {profileLoading ? (
            <View className="mb-8">
              <SkeletonCard />
            </View>
          ) : user ? (
            <View
              className="rounded-2xl p-5 mb-8"
              style={{
                backgroundColor: colors.primary + '14',
                borderWidth: 1,
                borderColor: colors.primary + '30',
              }}
            >
              <View className="flex-row items-center">
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: colors.primary,
                    borderWidth: 2,
                    borderColor: colors.accent,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 14,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>
                    {user.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text
                    className="font-bold text-foreground dark:text-foreground-dark"
                    style={{ fontSize: 20 }}
                  >
                    {user.name}
                  </Text>
                  <Text className="text-muted dark:text-muted-dark" style={{ fontSize: 13 }}>
                    {user.email}
                  </Text>

                  <View
                    className="self-start rounded-full px-3 py-1 mt-2"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <Text className="font-bold" style={{ fontSize: 11, color: '#1a1a1a' }}>
                      {altitudeLabel}
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                className="self-end mt-3 px-3 py-1 rounded-lg active:opacity-70"
                onPress={() => {
                  haptic();
                  router.push('/(tabs)/profile' as never);
                }}
              >
                <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                  Edit Profile
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* ─── SECTION 2 — Appearance ──────────────────────── */}
          <View className="mb-8">
            <SectionHeader label="Appearance" />

            <View className="gap-3">
              <Card surface={colors.surface} className="flex-row justify-between items-center">
                <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark mr-3">
                  Theme
                </Text>
                <SegmentedControl<ThemeOption>
                  options={[
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                    { label: 'System', value: 'system' },
                  ]}
                  selected={themeOption}
                  onChange={handleThemeChange}
                  primary={colors.primary}
                  surface={colors.border + '44'}
                  foreground={colors.foreground}
                />
              </Card>

              <ToggleRow
                label="Reduce Animations"
                value={reduceAnimations}
                onValueChange={async (v) => {
                  setReduceAnimations(v);
                  await AsyncStorage.setItem(KEYS.REDUCE_ANIMATIONS, String(v));
                }}
                surface={colors.surface}
                trackColors={trackColors}
                thumbColors={thumbColors}
              />
            </View>
          </View>

          {/* ─── SECTION 3 — Notifications ───────────────────── */}
          <View className="mb-8">
            <SectionHeader label="Notifications" />

            {notifPrefs ? (
              <View className="gap-3">
                <ToggleRow
                  label="Notifications"
                  value={notifPrefs.enabled}
                  onValueChange={(v) => updateNotif({ enabled: v })}
                  surface={colors.surface}
                  trackColors={trackColors}
                  thumbColors={thumbColors}
                />

                {notifPrefs.enabled && (
                  <>
                    <ToggleRow
                      label="Session Reminders"
                      value={notifPrefs.sessionReminders}
                      onValueChange={(v) => updateNotif({ sessionReminders: v })}
                      surface={colors.surface}
                      trackColors={trackColors}
                      thumbColors={thumbColors}
                    />
                    <ToggleRow
                      label="Achievement Alerts"
                      value={notifPrefs.achievements}
                      onValueChange={(v) => updateNotif({ achievements: v })}
                      surface={colors.surface}
                      trackColors={trackColors}
                      thumbColors={thumbColors}
                    />
                    <ToggleRow
                      label="Daily Motivation"
                      value={notifPrefs.dailyMotivation}
                      onValueChange={(v) => updateNotif({ dailyMotivation: v })}
                      surface={colors.surface}
                      trackColors={trackColors}
                      thumbColors={thumbColors}
                    />
                    <ToggleRow
                      label="Flock Nudges"
                      value={notifPrefs.flockNudges}
                      onValueChange={(v) => updateNotif({ flockNudges: v })}
                      surface={colors.surface}
                      trackColors={trackColors}
                      thumbColors={thumbColors}
                    />
                  </>
                )}
              </View>
            ) : (
              <ActivityIndicator color={colors.primary} />
            )}
          </View>

          {/* ─── SECTION 4 — Study Preferences ───────────────── */}
          <View className="mb-8">
            <SectionHeader label="Study Preferences" />

            <View className="gap-3">
              <Card surface={colors.surface}>
                <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark mb-2">
                  Default Timer
                </Text>
                <SegmentedControl<TimerMode>
                  options={[
                    { label: 'Pomodoro', value: 'pomodoro' },
                    { label: 'Falcon Dive', value: 'falcon_dive' },
                  ]}
                  selected={defaultTimer}
                  onChange={async (v) => {
                    setDefaultTimer(v);
                    await AsyncStorage.setItem(KEYS.DEFAULT_TIMER, v);
                  }}
                  primary={colors.primary}
                  surface={colors.border + '44'}
                  foreground={colors.foreground}
                />
              </Card>

              <Card surface={colors.surface}>
                <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark mb-2">
                  Energy Check Frequency
                </Text>
                <SegmentedControl<EnergyFrequency>
                  options={[
                    { label: 'After Session', value: 'after_session' },
                    { label: 'Daily', value: 'daily' },
                    { label: 'Manual', value: 'manual' },
                  ]}
                  selected={energyFreq}
                  onChange={async (v) => {
                    setEnergyFreq(v);
                    await AsyncStorage.setItem(KEYS.ENERGY_FREQUENCY, v);
                  }}
                  primary={colors.primary}
                  surface={colors.border + '44'}
                  foreground={colors.foreground}
                />
              </Card>
            </View>
          </View>

          {/* ─── SECTION 5 — Data & Privacy ──────────────────── */}
          <View className="mb-8">
            <SectionHeader label="Data & Privacy" />

            <View className="gap-3">
              <ActionRow
                label="Export Data"
                subtitle="View a summary of your study data"
                surface={colors.surface}
                onPress={() => {
                  const summary = [
                    `Goals: ${study.goals.length}`,
                    `Tasks: ${study.tasks.length}`,
                    `Sessions: ${study.studySessions.length}`,
                    `Study Blocks: ${study.studyBlocks.length}`,
                    `Energy Logs: ${study.energyLogs.length}`,
                    `Notes: ${study.notes.length}`,
                    `Flashcard Decks: ${study.flashcardDecks.length}`,
                  ].join('\n');

                  Alert.alert('Data Export Summary', summary);
                }}
              />

              <ActionRow
                label="Privacy Policy"
                subtitle="Learn how we protect your data"
                surface={colors.surface}
                onPress={() => {
                  Linking.openURL('https://falconfocus.app/privacy');
                }}
              />
            </View>
          </View>

          {/* ─── SECTION 6 — Support ─────────────────────────── */}
          <View className="mb-8">
            <SectionHeader label="Support" />

            <View className="gap-3">
              <ActionRow
                label="Send Feedback"
                subtitle="Let us know how we can improve"
                surface={colors.surface}
                onPress={() => {
                  Linking.openURL('mailto:omotoshokorede1025@gmail.com?subject=Falcon Focus Feedback');
                }}
              />

              <ActionRow
                label="Rate App"
                subtitle="Love Falcon Focus? Leave a review"
                surface={colors.surface}
                onPress={() => {
                  Linking.openURL(
                    'https://play.google.com/store/apps/details?id=com.falconfocus.app',
                  );
                }}
              />

              <ActionRow
                label="Contact"
                subtitle="Get in touch with us"
                surface={colors.surface}
                onPress={() => setContactVisible(true)}
              />
            </View>
          </View>

          {/* ─── SECTION 7 — About ───────────────────────────── */}
          <View className="mb-8">
            <SectionHeader label="About" />

            <Card surface={colors.surface} className="items-center">
              <Text className="text-base font-bold text-foreground dark:text-foreground-dark">
                Falcon Focus v1.0.0
              </Text>
              <Text className="text-sm text-muted dark:text-muted-dark mt-1">
                By Korede Omotosho
              </Text>
              <Text
                className="text-xs italic text-center mt-2"
                style={{ color: colors.accent }}
              >
                Sharpen Your Vision. Soar to Success.
              </Text>
            </Card>
          </View>

          {/* ─── SECTION 8 — Danger Zone ─────────────────────── */}
          <View className="mb-8">
            <SectionHeader label="Danger Zone" color={colors.error} />

            <View
              className="rounded-2xl p-4 gap-3"
              style={{ backgroundColor: colors.error + '0D' }}
            >
              {/* Clear Cache */}
              <Pressable
                className="rounded-xl p-3 active:opacity-80"
                style={{ backgroundColor: colors.warning + '20' }}
                onPress={() => {
                  haptic();
                  Alert.alert(
                    'Clear Cache',
                    'This will remove cached data. Your account and study data will not be affected.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Clear',
                        style: 'destructive',
                        onPress: async () => {
                          const allKeys = await AsyncStorage.getAllKeys();
                          const settingsKeys = Object.values(KEYS) as string[];
                          const cacheKeys = allKeys.filter(
                            (k) => !settingsKeys.includes(k),
                          );
                          if (cacheKeys.length > 0) {
                            await AsyncStorage.multiRemove(cacheKeys);
                          }
                          Alert.alert('Done', 'Cache cleared successfully.');
                        },
                      },
                    ],
                  );
                }}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.warning }}>
                  Clear Cache
                </Text>
              </Pressable>

              {/* Reset Settings */}
              <Pressable
                className="rounded-xl p-3 active:opacity-80"
                style={{ backgroundColor: colors.warning + '20' }}
                onPress={() => {
                  haptic();
                  Alert.alert(
                    'Reset Settings',
                    'This will reset all settings to their defaults.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Reset',
                        style: 'destructive',
                        onPress: async () => {
                          await AsyncStorage.multiRemove([
                            KEYS.REDUCE_ANIMATIONS,
                            KEYS.DEFAULT_TIMER,
                            KEYS.ENERGY_FREQUENCY,
                          ]);
                          setReduceAnimations(false);
                          setDefaultTimer('pomodoro');
                          setEnergyFreq('after_session');
                          Alert.alert('Done', 'Settings have been reset.');
                        },
                      },
                    ],
                  );
                }}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.warning }}>
                  Reset Settings
                </Text>
              </Pressable>

              {/* Delete All Data */}
              <Pressable
                className="rounded-xl p-3 active:opacity-80"
                style={{ backgroundColor: colors.error + '20' }}
                onPress={() => {
                  haptic();
                  setDeleteText('');
                  setDeleteModalVisible(true);
                }}
              >
                <Text className="text-sm font-bold" style={{ color: colors.error }}>
                  Delete All Data
                </Text>
                <Text className="text-xs mt-1" style={{ color: colors.error + '99' }}>
                  This action cannot be undone
                </Text>
              </Pressable>

              {/* Sign Out */}
              <Pressable
                className="rounded-xl p-3 active:opacity-80"
                style={{ backgroundColor: colors.error + '20' }}
                onPress={() => {
                  haptic();
                  Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Sign Out',
                      style: 'destructive',
                      onPress: async () => {
                        await signOut();
                        router.replace('/(auth)/sign-in');
                      },
                    },
                  ]);
                }}
              >
                <Text className="text-sm font-bold" style={{ color: colors.error }}>
                  Sign Out
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ─── Contact Modal ──────────────────────────────────── */}
      <Modal
        visible={contactVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setContactVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setContactVisible(false)}
        >
          <Pressable
            className="rounded-2xl p-6 w-[85%]"
            style={{ backgroundColor: colors.surface }}
            onPress={() => {}}
          >
            <Text className="text-lg font-bold text-foreground dark:text-foreground-dark mb-4">
              Contact Us
            </Text>
            <Text className="text-sm text-foreground dark:text-foreground-dark mb-1">
              📧 omotoshokorede1025@gmail.com
            </Text>
            <Text className="text-sm text-foreground dark:text-foreground-dark mb-4">
              📞 +2349113683395
            </Text>
            <Pressable
              className="rounded-xl py-3 items-center active:opacity-80"
              style={{ backgroundColor: colors.primary }}
              onPress={() => {
                haptic();
                setContactVisible(false);
              }}
            >
              <Text className="text-sm font-bold" style={{ color: '#fff' }}>
                Close
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── Delete Confirmation Modal ──────────────────────── */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setDeleteModalVisible(false)}
        >
          <Pressable
            className="rounded-2xl p-6 w-[85%]"
            style={{ backgroundColor: colors.surface }}
            onPress={() => {}}
          >
            <Text className="text-lg font-bold mb-2" style={{ color: colors.error }}>
              Delete All Data
            </Text>
            <Text className="text-sm text-foreground dark:text-foreground-dark mb-4">
              Type <Text className="font-bold">DELETE</Text> to confirm. This cannot be undone.
            </Text>
            <TextInput
              className="rounded-xl px-4 py-3 text-sm mb-4"
              style={{
                backgroundColor: colors.border + '44',
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholder="Type DELETE"
              placeholderTextColor={colors.muted}
              value={deleteText}
              onChangeText={setDeleteText}
              autoCapitalize="characters"
            />
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 rounded-xl py-3 items-center active:opacity-80"
                style={{ backgroundColor: colors.border + '44' }}
                onPress={() => {
                  haptic();
                  setDeleteModalVisible(false);
                }}
              >
                <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 rounded-xl py-3 items-center active:opacity-80"
                style={{
                  backgroundColor: deleteText === 'DELETE' ? colors.error : colors.border,
                  opacity: deleteText === 'DELETE' ? 1 : 0.5,
                }}
                disabled={deleteText !== 'DELETE' || deleting}
                onPress={async () => {
                  haptic();
                  setDeleting(true);
                  await AsyncStorage.clear();
                  setDeleting(false);
                  setDeleteModalVisible(false);
                  Alert.alert('Deleted', 'All local data has been removed.', [
                    {
                      text: 'OK',
                      onPress: async () => {
                        await signOut();
                        router.replace('/(auth)/sign-in');
                      },
                    },
                  ]);
                }}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-sm font-bold" style={{ color: '#fff' }}>
                    Delete
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
