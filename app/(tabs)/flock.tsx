import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { FlockModeService, type Flock, type FlockMember } from '@/lib/flock-mode';
import { SkeletonCard } from '@/components/skeleton';

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'falcon_flock_data';
const CHAT_KEY_PREFIX = 'flock_chat_';
const YOUR_NAME = 'You';

const RANK_COLORS = ['#FFB81C', '#C0C0C0', '#CD7F32'] as const;

function buildDemoMembers(): FlockMember[] {
  const now = Date.now();
  return [
    { id: 'm_2', name: 'Amina', joinCode: '', joinedAt: now - 86400000 * 3, altitude: 'Soaring', streak: 12, xp: 3200, lastUpdate: now - 3600000 },
    { id: 'm_3', name: 'Carlos', joinCode: '', joinedAt: now - 86400000 * 5, altitude: 'Apex', streak: 24, xp: 7800, lastUpdate: now - 7200000 },
    { id: 'm_4', name: 'Fatima', joinCode: '', joinedAt: now - 86400000 * 2, altitude: 'Fledgling', streak: 3, xp: 450, lastUpdate: now - 1800000 },
    { id: 'm_5', name: 'Jin', joinCode: '', joinedAt: now - 86400000 * 7, altitude: 'Soaring', streak: 18, xp: 4100, lastUpdate: now - 5400000 },
  ];
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

interface ActivityItem {
  id: string;
  name: string;
  action: string;
  timeAgo: string;
  emoji: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function generateActivities(members: FlockMember[]): ActivityItem[] {
  const actions = [
    { tpl: 'completed a 45-min session', emoji: '🎯' },
    { tpl: 'hit a new streak record', emoji: '🔥' },
    { tpl: 'leveled up to {altitude}', emoji: '🦅' },
    { tpl: 'earned 150 XP today', emoji: '⚡' },
    { tpl: 'finished a deep focus block', emoji: '📚' },
    { tpl: 'joined a study sprint', emoji: '🚀' },
  ];

  return members
    .filter((m) => m.name !== YOUR_NAME)
    .map((m, i) => {
      const action = actions[i % actions.length];
      return {
        id: `act_${m.id}`,
        name: m.name,
        action: action.tpl.replace('{altitude}', m.altitude),
        timeAgo: relativeTime(m.lastUpdate),
        emoji: action.emoji,
      };
    });
}

function generateDemoChat(members: FlockMember[]): ChatMessage[] {
  const lines = [
    { sender: 'Carlos', text: 'Just finished a 2-hour session 💪' },
    { sender: YOUR_NAME, text: 'Nice! Starting mine now' },
    { sender: 'Amina', text: 'Keep it up everyone! Almost exam week' },
    { sender: 'Jin', text: 'Who wants to do a group sprint later?' },
    { sender: YOUR_NAME, text: "I'm in! Let's go at 4pm" },
    { sender: 'Fatima', text: 'Count me in too 🙋‍♀️' },
  ];
  const now = Date.now();
  return lines
    .filter((l) => l.sender === YOUR_NAME || members.some((m) => m.name === l.sender))
    .map((l, i) => ({
      id: `msg_${i}`,
      sender: l.sender,
      text: l.text,
      timestamp: now - (lines.length - i) * 180000,
    }));
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function NoFlockScreen({
  colors,
  onCreatePress,
  onJoinPress,
}: {
  colors: ReturnType<typeof useColors>;
  onCreatePress: () => void;
  onJoinPress: () => void;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <ScreenContainer className="flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero icon */}
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={[
            {
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            },
          ]}
        >
          <Animated.Text style={[{ fontSize: 38 }, pulseStyle]}>🦅</Animated.Text>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.duration(600).delay(100)}
          className="font-bold text-foreground dark:text-foreground-dark text-center"
          style={{ fontSize: 28, marginBottom: 8 }}
        >
          Find Your Flock
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.duration(600).delay(200)}
          className="text-muted dark:text-muted-dark text-center"
          style={{ fontSize: 16, marginBottom: 32 }}
        >
          Study together, soar higher
        </Animated.Text>

        {/* Create Card */}
        <Animated.View entering={FadeInUp.duration(500).delay(300)} className="w-full mb-4">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onCreatePress();
            }}
            className="rounded-2xl p-5 active:opacity-90"
            style={{
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 32, marginBottom: 12 }}>🏆</Text>
            <Text className="text-white font-bold" style={{ fontSize: 20, marginBottom: 4 }}>
              Create a Flock
            </Text>
            <Text className="text-white" style={{ opacity: 0.8, fontSize: 14, marginBottom: 16 }}>
              Start a group and invite your study partners
            </Text>
            <View className="flex-row items-center self-end">
              <Text className="text-white font-bold" style={{ fontSize: 16 }}>
                Create →
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Join Card */}
        <Animated.View entering={FadeInUp.duration(500).delay(450)} className="w-full">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onJoinPress();
            }}
            className="rounded-2xl p-5 active:opacity-90"
            style={{
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 32, marginBottom: 12 }}>🔗</Text>
            <Text style={{ fontSize: 20, marginBottom: 4, fontWeight: 'bold', color: '#0f1923' }}>
              Join a Flock
            </Text>
            <Text style={{ opacity: 0.7, fontSize: 14, marginBottom: 16, color: '#0f1923' }}>
              Enter an invite code to join your friends
            </Text>
            <View className="flex-row items-center self-end">
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f1923' }}>Join →</Text>
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FlockScreen() {
  const colors = useColors();

  // Flock state
  const [flock, setFlock] = useState<Flock | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);

  // Form inputs
  const [newFlockName, setNewFlockName] = useState('');
  const [newFlockDesc, setNewFlockDesc] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatListRef = useRef<FlatList<ChatMessage>>(null);

  // ── Persistence ────────────────────────────────────────────────────────────

  const saveFlock = useCallback(async (data: Flock) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const loadFlock = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setFlock(JSON.parse(raw) as Flock);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChat = useCallback(async (flockId: string) => {
    const raw = await AsyncStorage.getItem(`${CHAT_KEY_PREFIX}${flockId}`);
    if (raw) {
      setMessages(JSON.parse(raw) as ChatMessage[]);
    }
  }, []);

  const saveChat = useCallback(async (flockId: string, msgs: ChatMessage[]) => {
    await AsyncStorage.setItem(`${CHAT_KEY_PREFIX}${flockId}`, JSON.stringify(msgs));
  }, []);

  useEffect(() => {
    loadFlock();
  }, [loadFlock]);

  useEffect(() => {
    if (flock) {
      loadChat(flock.id);
    }
  }, [flock?.id, loadChat]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const stats = useMemo(() => (flock ? FlockModeService.getFlockStats(flock) : null), [flock]);

  const sortedMembers = useMemo(
    () => (flock ? [...flock.members].sort((a, b) => b.xp - a.xp) : []),
    [flock]
  );

  const activities = useMemo(
    () => (flock ? generateActivities(flock.members) : []),
    [flock]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreate = useCallback(async () => {
    const name = newFlockName.trim();
    if (!name) {
      Alert.alert('Oops', 'Give your flock a name');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const created = FlockModeService.createFlock(YOUR_NAME, name, newFlockDesc.trim() || undefined);
    // Inject demo members for a richer experience
    const withDemo: Flock = { ...created, members: [...created.members, ...buildDemoMembers()] };
    setFlock(withDemo);
    await saveFlock(withDemo);
    // Seed demo chat
    const demoChat = generateDemoChat(withDemo.members);
    setMessages(demoChat);
    await saveChat(withDemo.id, demoChat);

    setNewFlockName('');
    setNewFlockDesc('');
    setCreateModalVisible(false);
  }, [newFlockName, newFlockDesc, saveFlock, saveChat]);

  const handleJoin = useCallback(async () => {
    const code = joinCodeInput.trim().toUpperCase();
    if (code.length < 6) {
      Alert.alert('Oops', 'Enter a valid 6-character code');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Simulate joining: create a flock as if found
    const joined = FlockModeService.createFlock(YOUR_NAME, 'Study Squad');
    const withDemo: Flock = {
      ...joined,
      inviteCode: code,
      members: [...joined.members, ...buildDemoMembers()],
    };
    setFlock(withDemo);
    await saveFlock(withDemo);
    const demoChat = generateDemoChat(withDemo.members);
    setMessages(demoChat);
    await saveChat(withDemo.id, demoChat);

    setJoinCodeInput('');
    setJoinModalVisible(false);
  }, [joinCodeInput, saveFlock, saveChat]);

  const handleCopyCode = useCallback(async () => {
    if (!flock) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(flock.inviteCode);
    Alert.alert('Copied!', `Code ${flock.inviteCode} copied to clipboard`);
  }, [flock]);

  const handleSendMessage = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || !flock) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: YOUR_NAME,
      text,
      timestamp: Date.now(),
    };
    const updated = [...messages, msg];
    setMessages(updated);
    setChatInput('');
    await saveChat(flock.id, updated);
    setTimeout(() => chatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [chatInput, flock, messages, saveChat]);

  const handleLeaveFlock = useCallback(async () => {
    Alert.alert('Leave Flock', 'Are you sure you want to leave this flock?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          if (flock) {
            await AsyncStorage.removeItem(`${CHAT_KEY_PREFIX}${flock.id}`);
          }
          await AsyncStorage.removeItem(STORAGE_KEY);
          setFlock(null);
          setMessages([]);
        },
      },
    ]);
  }, [flock]);

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <ScreenContainer className="p-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ScreenContainer>
    );
  }

  // ── No Flock → State 1 ────────────────────────────────────────────────────

  if (!flock) {
    return (
      <>
        <NoFlockScreen
          colors={colors}
          onCreatePress={() => setCreateModalVisible(true)}
          onJoinPress={() => setJoinModalVisible(true)}
        />

        {/* Create Modal */}
        <Modal visible={createModalVisible} animationType="slide" transparent>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 justify-end"
          >
            <Pressable
              className="flex-1"
              onPress={() => setCreateModalVisible(false)}
            />
            <View
              className="rounded-t-3xl p-6"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="w-10 h-1 rounded-full self-center mb-6" style={{ backgroundColor: colors.border }} />
              <Text className="text-xl font-bold text-foreground dark:text-foreground-dark mb-4">
                Create a Flock
              </Text>
              <TextInput
                className="rounded-xl px-4 py-3 mb-3 text-base text-foreground dark:text-foreground-dark"
                style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
                placeholder="Flock name"
                placeholderTextColor={colors.muted}
                value={newFlockName}
                onChangeText={setNewFlockName}
                maxLength={30}
                autoFocus
              />
              <TextInput
                className="rounded-xl px-4 py-3 mb-5 text-base text-foreground dark:text-foreground-dark"
                style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
                placeholder="Description (optional)"
                placeholderTextColor={colors.muted}
                value={newFlockDesc}
                onChangeText={setNewFlockDesc}
                maxLength={80}
              />
              <Pressable
                onPress={handleCreate}
                className="py-4 rounded-xl items-center active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-bold text-base">Generate Invite Code</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCreateModalVisible(false);
                }}
                className="py-3 items-center mt-2"
              >
                <Text className="font-bold" style={{ color: colors.muted }}>Cancel</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Join Modal */}
        <Modal visible={joinModalVisible} animationType="slide" transparent>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 justify-end"
          >
            <Pressable
              className="flex-1"
              onPress={() => setJoinModalVisible(false)}
            />
            <View
              className="rounded-t-3xl p-6"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="w-10 h-1 rounded-full self-center mb-6" style={{ backgroundColor: colors.border }} />
              <Text className="text-xl font-bold text-foreground dark:text-foreground-dark mb-4">
                Join a Flock
              </Text>
              <TextInput
                className="rounded-xl px-4 py-3 mb-5 text-center text-2xl font-bold tracking-widest text-foreground dark:text-foreground-dark"
                style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
                placeholder="INVITE CODE"
                placeholderTextColor={colors.muted}
                value={joinCodeInput}
                onChangeText={(t) => setJoinCodeInput(t.toUpperCase())}
                maxLength={8}
                autoCapitalize="characters"
                autoFocus
              />
              <Pressable
                onPress={handleJoin}
                className="py-4 rounded-xl items-center active:opacity-80"
                style={{ backgroundColor: colors.accent }}
              >
                <Text style={{ color: '#0f1923', fontWeight: 'bold', fontSize: 16 }}>Join Flock</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setJoinModalVisible(false);
                }}
                className="py-3 items-center mt-2"
              >
                <Text className="font-bold" style={{ color: colors.muted }}>Cancel</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </>
    );
  }

  // ── State 2: In a Flock ───────────────────────────────────────────────────

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* ── Header Card ─────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeIn.duration(500)}
          className="mx-4 mt-4 rounded-2xl p-5"
          style={{
            backgroundColor: colors.secondary,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 mr-3">
              <Text className="text-white font-bold" style={{ fontSize: 22 }}>
                🦅 {flock.name}
              </Text>
              {flock.description ? (
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }}>
                  {flock.description}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={handleLeaveFlock}
              className="px-3 py-1.5 rounded-lg active:opacity-70"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' }}>Leave</Text>
            </Pressable>
          </View>

          {/* Stats row */}
          <View className="flex-row justify-between mb-4">
            {[
              { label: 'Members', value: `${stats?.totalMembers ?? 0}`, icon: '👥' },
              { label: 'Group XP', value: `${stats?.totalXP ?? 0}`, icon: '⚡' },
              { label: 'Avg Streak', value: `${stats?.avgStreak ?? 0}d`, icon: '🔥' },
            ].map((s) => (
              <View
                key={s.label}
                className="flex-1 items-center rounded-xl py-2 mx-1"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <Text style={{ fontSize: 16 }}>{s.icon}</Text>
                <Text className="text-white font-bold" style={{ fontSize: 16 }}>{s.value}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Invite code */}
          <View
            className="flex-row items-center justify-between rounded-xl px-4 py-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Invite Code</Text>
              <Text className="text-white font-bold" style={{ fontSize: 18, letterSpacing: 3 }}>
                {flock.inviteCode}
              </Text>
            </View>
            <Pressable
              onPress={handleCopyCode}
              className="px-4 py-2 rounded-lg active:opacity-80"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-bold" style={{ fontSize: 13 }}>Copy</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Leaderboard ─────────────────────────────────────────────── */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-foreground dark:text-foreground-dark mb-3">
            Leaderboard
          </Text>

          {/* Top 3 Podium */}
          {sortedMembers.length >= 3 && (
            <View className="flex-row items-end justify-center mb-4" style={{ height: 160 }}>
              {/* 2nd place */}
              <PodiumSlot member={sortedMembers[1]} rank={2} colors={colors} />
              {/* 1st place */}
              <PodiumSlot member={sortedMembers[0]} rank={1} colors={colors} />
              {/* 3rd place */}
              <PodiumSlot member={sortedMembers[2]} rank={3} colors={colors} />
            </View>
          )}

          {/* Ranks 4+ */}
          <View className="gap-2">
            {sortedMembers.slice(3).map((member, i) => {
              const rank = i + 4;
              const isYou = member.name === YOUR_NAME;
              return (
                <View
                  key={member.id}
                  className="rounded-2xl p-3 flex-row items-center"
                  style={{
                    backgroundColor: colors.surface,
                    borderLeftWidth: isYou ? 3 : 0,
                    borderLeftColor: isYou ? colors.primary : 'transparent',
                  }}
                >
                  <View style={{ width: 28, alignItems: 'center', marginRight: 10 }}>
                    <Text className="text-xs font-bold text-muted dark:text-muted-dark">#{rank}</Text>
                  </View>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.primary + '25',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ fontWeight: 'bold', fontSize: 14, color: colors.foreground }}>
                      {getInitials(member.name)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="font-bold text-foreground dark:text-foreground-dark" style={{ fontSize: 14 }}>
                        {member.name}
                      </Text>
                      {isYou && (
                        <View className="ml-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.primary + '20' }}>
                          <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.primary }}>YOU</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs" style={{ color: colors.muted }}>
                      {member.altitude} · {member.streak}🔥
                    </Text>
                  </View>
                  <Text className="font-bold" style={{ fontSize: 14, color: colors.accent }}>
                    {member.xp} XP
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Activity Feed ────────────────────────────────────────────── */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-foreground dark:text-foreground-dark mb-3">
            Recent Activity
          </Text>
          <View className="gap-2">
            {activities.map((act) => (
              <View
                key={act.id}
                className="rounded-xl p-3 flex-row items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text style={{ fontSize: 20, marginRight: 10 }}>{act.emoji}</Text>
                <View className="flex-1">
                  <Text className="text-sm text-foreground dark:text-foreground-dark">
                    <Text className="font-bold">{act.name}</Text> {act.action}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.muted }}>{act.timeAgo}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Flock Chat ──────────────────────────────────────────────── */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-foreground dark:text-foreground-dark mb-3">
            Flock Chat
          </Text>
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: colors.surface, maxHeight: 320 }}
          >
            <FlatList
              ref={chatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 12 }}
              onContentSizeChange={() => chatListRef.current?.scrollToEnd({ animated: false })}
              renderItem={({ item }) => {
                const isMe = item.sender === YOUR_NAME;
                return (
                  <View
                    className="mb-2"
                    style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}
                  >
                    {!isMe && (
                      <Text
                        className="font-bold mb-0.5"
                        style={{ fontSize: 11, color: colors.primary, marginLeft: 4 }}
                      >
                        {item.sender}
                      </Text>
                    )}
                    <View
                      className="rounded-2xl px-3 py-2"
                      style={{
                        backgroundColor: isMe ? colors.primary : colors.background,
                        maxWidth: '78%',
                      }}
                    >
                      <Text style={{ color: isMe ? '#ffffff' : colors.foreground, fontSize: 14 }}>
                        {item.text}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2, marginHorizontal: 4 }}>
                      {relativeTime(item.timestamp)}
                    </Text>
                  </View>
                );
              }}
            />

            {/* Input bar */}
            <View
              className="flex-row items-center px-3 py-2"
              style={{ borderTopWidth: 1, borderTopColor: colors.border }}
            >
              <TextInput
                className="flex-1 rounded-xl px-3 py-2 text-sm text-foreground dark:text-foreground-dark"
                style={{ backgroundColor: colors.background }}
                placeholder="Message..."
                placeholderTextColor={colors.muted}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
              />
              <Pressable
                onPress={handleSendMessage}
                className="ml-2 rounded-xl items-center justify-center active:opacity-80"
                style={{
                  width: 38,
                  height: 38,
                  backgroundColor: chatInput.trim() ? colors.primary : colors.border,
                }}
              >
                <Text className="text-white font-bold" style={{ fontSize: 16 }}>↑</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Accountability Nudge ─────────────────────────────────────── */}
        <View
          className="mx-4 mt-6 rounded-2xl p-4"
          style={{
            backgroundColor: colors.surface,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
          }}
        >
          <Text className="text-sm font-bold text-foreground dark:text-foreground-dark mb-2">
            💡 Accountability Nudge
          </Text>
          <Text className="text-sm leading-relaxed" style={{ color: colors.muted }}>
            {FlockModeService.generateAccountabilityNudge(flock, YOUR_NAME)}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Podium Slot ─────────────────────────────────────────────────────────────

function PodiumSlot({
  member,
  rank,
  colors,
}: {
  member: FlockMember;
  rank: 1 | 2 | 3;
  colors: ReturnType<typeof useColors>;
}) {
  const isFirst = rank === 1;
  const color = RANK_COLORS[rank - 1];
  const height = isFirst ? 100 : rank === 2 ? 75 : 60;
  const avatarSize = isFirst ? 48 : 40;
  const isYou = member.name === YOUR_NAME;

  return (
    <View className="items-center mx-1" style={{ flex: 1 }}>
      {isFirst && <Text style={{ fontSize: 20, marginBottom: 2 }}>👑</Text>}
      <View
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: color + '40',
          borderWidth: 2,
          borderColor: color,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <Text style={{ fontWeight: 'bold', fontSize: isFirst ? 18 : 15, color: colors.foreground }}>
          {getInitials(member.name)}
        </Text>
      </View>
      <Text
        className="font-bold text-foreground dark:text-foreground-dark text-center"
        style={{ fontSize: 12 }}
        numberOfLines={1}
      >
        {member.name}
      </Text>
      {isYou && (
        <View className="px-1 rounded" style={{ backgroundColor: colors.primary + '20' }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.primary }}>YOU</Text>
        </View>
      )}
      <Text className="font-bold" style={{ fontSize: 12, color }}>
        {member.xp} XP
      </Text>
      <Text className="text-xs" style={{ color: colors.muted }}>
        {member.streak}🔥
      </Text>
      <View
        className="w-full rounded-t-lg mt-1"
        style={{ height, backgroundColor: color + '25' }}
      >
        <View className="items-center justify-center flex-1">
          <Text style={{ fontWeight: 'bold', fontSize: isFirst ? 22 : 18, color }}>{rank}</Text>
        </View>
      </View>
    </View>
  );
}
