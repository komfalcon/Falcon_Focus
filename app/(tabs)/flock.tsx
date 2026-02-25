import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { FlockModeService } from '@/lib/flock-mode';

export default function FlockScreen() {
  const colors = useColors();
  const [flock, setFlock] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [flockName, setFlockName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    const demoFlock = FlockModeService.createFlock('You', 'Study Squad', 'A group of dedicated learners');
    setFlock(demoFlock);
  }, []);

  const handleCreateFlock = () => {
    if (!flockName.trim()) {
      Alert.alert('Error', 'Please enter a flock name');
      return;
    }
    const newFlock = FlockModeService.createFlock('You', flockName);
    const createdName = newFlock.name;
    setFlock(newFlock);
    setFlockName('');
    setShowCreateModal(false);
    Alert.alert('Success', `Flock "${createdName}" created! Share code: ${newFlock.inviteCode}`);
  };

  const handleJoinFlock = () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a join code');
      return;
    }
    Alert.alert('Success', `Joined flock with code: ${joinCode}`);
    setJoinCode('');
    setShowJoinModal(false);
  };

  if (!flock) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="text-5xl mb-4">🦅</Text>
        <Text className="text-lg font-bold text-foreground dark:text-foreground-dark mb-2">Gathering your flock...</Text>
        <Text className="text-sm text-muted dark:text-muted-dark text-center">Great things happen when falcons fly together</Text>
      </ScreenContainer>
    );
  }

  const stats = FlockModeService.getFlockStats(flock);

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground dark:text-foreground-dark tracking-tight">🦅 {flock.name}</Text>
          <Text className="text-sm text-muted dark:text-muted-dark mt-1">{flock.description || 'Study together, soar higher'}</Text>
        </View>

        {/* Flock Stats */}
        <View className="gap-3 mb-6">
          <View
            className="rounded-2xl p-4 flex-row justify-between items-center"
            style={{
              backgroundColor: colors.primary + '14',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View>
              <Text className="text-sm text-muted dark:text-muted-dark">Members</Text>
              <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">{stats.totalMembers}</Text>
            </View>
            <Text className="text-4xl">👥</Text>
          </View>

          <View
            className="rounded-2xl p-4 flex-row justify-between items-center"
            style={{
              backgroundColor: colors.accent + '14',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View>
              <Text className="text-sm text-muted dark:text-muted-dark">Combined XP</Text>
              <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">{stats.totalXP}</Text>
            </View>
            <Text className="text-4xl">⚡</Text>
          </View>

          <View
            className="rounded-2xl p-4 flex-row justify-between items-center"
            style={{
              backgroundColor: colors.success + '14',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View>
              <Text className="text-sm text-muted dark:text-muted-dark">Avg Streak</Text>
              <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">{stats.avgStreak} days</Text>
            </View>
            <Text className="text-4xl">🔥</Text>
          </View>
        </View>

        {/* Flock Code */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1.5,
            borderColor: colors.primary + '40',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Text className="text-sm text-muted dark:text-muted-dark mb-2">Invite Code</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark font-mono">{flock.inviteCode}</Text>
            <Pressable
              onPress={async () => {
                await Clipboard.setStringAsync(flock.inviteCode);
                Alert.alert('Copied!', `Code ${flock.inviteCode} copied to clipboard`);
              }}
              className="px-4 py-2.5 rounded-xl active:opacity-80"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-sm font-bold text-white">Copy</Text>
            </Pressable>
          </View>
          <Text className="text-xs text-muted dark:text-muted-dark mt-2">Share this code with friends to invite them</Text>
        </View>

        {/* Members List */}
        <Text className="text-base font-bold text-foreground dark:text-foreground-dark mb-3">Members ({flock.members.length})</Text>
        <View className="gap-3 mb-6">
          {flock.members.map((member: any) => (
            <View
              key={member.id}
              className="rounded-2xl p-4 flex-row justify-between items-center"
              style={{
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <View className="flex-1">
                <Text className="font-bold text-foreground dark:text-foreground-dark">{member.name}</Text>
                <View className="flex-row gap-4 mt-2">
                  <View>
                    <Text className="text-xs text-muted dark:text-muted-dark">Altitude</Text>
                    <Text className="text-sm font-bold" style={{ color: colors.primary }}>{member.altitude}</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-muted dark:text-muted-dark">Streak</Text>
                    <Text className="text-sm font-bold" style={{ color: colors.primary }}>{member.streak}🔥</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-muted dark:text-muted-dark">XP</Text>
                    <Text className="text-sm font-bold" style={{ color: colors.accent }}>{member.xp}</Text>
                  </View>
                </View>
              </View>
              <Text className="text-2xl">
                {member.altitude === 'Apex' ? '👑' : member.altitude === 'Soaring' ? '🦅' : '🐣'}
              </Text>
            </View>
          ))}
        </View>

        {/* Leaderboard */}
        <Text className="text-base font-bold text-foreground dark:text-foreground-dark mb-3">Leaderboard</Text>
        <View
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: colors.accent + '10',
            borderWidth: 1,
            borderColor: colors.accent + '30',
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-bold text-foreground dark:text-foreground-dark">Top Flyer</Text>
            <Text className="text-2xl">🏆</Text>
          </View>
          <Text className="text-lg font-bold" style={{ color: colors.accent }}>{stats.topMember.name}</Text>
          <Text className="text-sm text-muted dark:text-muted-dark mt-2">
            {stats.topMember.xp} XP • {stats.topMember.altitude} Altitude
          </Text>
        </View>

        {/* Accountability Nudge */}
        <View
          className="rounded-2xl p-4 mb-6"
          style={{
            backgroundColor: colors.surface,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.03,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <Text className="text-sm font-bold text-foreground dark:text-foreground-dark mb-2">💡 Accountability Nudge</Text>
          <Text className="text-sm text-muted dark:text-muted-dark leading-relaxed">
            {FlockModeService.generateAccountabilityNudge(flock, 'You')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-6">
          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="py-4 rounded-2xl items-center active:opacity-80"
            style={{
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="font-bold text-white text-base">Create New Flock</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowJoinModal(true)}
            className="py-4 rounded-2xl items-center active:opacity-80"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: colors.primary + '40',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text className="font-bold text-base" style={{ color: colors.primary }}>Join Existing Flock</Text>
          </Pressable>
        </View>

        {/* Founder Credit */}
        <Text className="text-xs text-muted dark:text-muted-dark text-center mb-4">
          Falcon Focus by Korede Omotosho • Free forever
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
