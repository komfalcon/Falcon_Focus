import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { FlockModeService } from '@/lib/flock-mode';
import { cn } from '@/lib/utils';

export default function FlockScreen() {
  const colors = useColors();
  const [flock, setFlock] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [flockName, setFlockName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    // Load flock from AsyncStorage in a real app
    // For now, create a demo flock
    const demoFlock = FlockModeService.createFlock('You', 'Study Squad', 'A group of dedicated learners');
    setFlock(demoFlock);
  }, []);

  const handleCreateFlock = () => {
    if (!flockName.trim()) {
      Alert.alert('Error', 'Please enter a flock name');
      return;
    }
    const newFlock = FlockModeService.createFlock('You', flockName);
    setFlock(newFlock);
    setFlockName('');
    setShowCreateModal(false);
    Alert.alert('Success', `Flock "${flockName}" created! Share code: ${newFlock.inviteCode}`);
  };

  const handleJoinFlock = () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a join code');
      return;
    }
    // In a real app, validate and join the flock
    Alert.alert('Success', `Joined flock with code: ${joinCode}`);
    setJoinCode('');
    setShowJoinModal(false);
  };

  if (!flock) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-muted">Loading your flock...</Text>
      </ScreenContainer>
    );
  }

  const stats = FlockModeService.getFlockStats(flock);

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">🦅 {flock.name}</Text>
          <Text className="text-sm text-muted mt-1">{flock.description || 'Study together, soar higher'}</Text>
        </View>

        {/* Flock Stats */}
        <View className="gap-3 mb-6">
          <View
            className="rounded-2xl p-4 flex-row justify-between items-center"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <View>
              <Text className="text-sm text-muted">Members</Text>
              <Text className="text-2xl font-bold text-foreground">{stats.totalMembers}</Text>
            </View>
            <Text className="text-4xl">👥</Text>
          </View>

          <View
            className="rounded-2xl p-4 flex-row justify-between items-center"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <View>
              <Text className="text-sm text-muted">Combined XP</Text>
              <Text className="text-2xl font-bold text-foreground">{stats.totalXP}</Text>
            </View>
            <Text className="text-4xl">⚡</Text>
          </View>

          <View
            className="rounded-2xl p-4 flex-row justify-between items-center"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <View>
              <Text className="text-sm text-muted">Avg Streak</Text>
              <Text className="text-2xl font-bold text-foreground">{stats.avgStreak} days</Text>
            </View>
            <Text className="text-4xl">🔥</Text>
          </View>
        </View>

        {/* Flock Code */}
        <View
          className="rounded-2xl p-4 mb-6 border border-primary"
          style={{ borderColor: colors.primary }}
        >
          <Text className="text-sm text-muted mb-2">Invite Code</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground font-mono">{flock.inviteCode}</Text>
            <Pressable
              onPress={() => {
                Alert.alert('Copied!', `Code ${flock.inviteCode} copied to clipboard`);
              }}
              className="px-3 py-2 rounded-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-sm font-semibold text-background">Copy</Text>
            </Pressable>
          </View>
          <Text className="text-xs text-muted mt-2">Share this code with friends to invite them</Text>
        </View>

        {/* Members List */}
        <Text className="text-lg font-bold text-foreground mb-3">Members ({flock.members.length})</Text>
        <View className="gap-2 mb-6">
          {flock.members.map((member: any) => (
            <View
              key={member.id}
              className="rounded-xl p-4 flex-row justify-between items-center border border-border"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-1">
                <Text className="font-semibold text-foreground">{member.name}</Text>
                <View className="flex-row gap-3 mt-2">
                  <View>
                    <Text className="text-xs text-muted">Altitude</Text>
                    <Text className="text-sm font-bold text-primary">{member.altitude}</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-muted">Streak</Text>
                    <Text className="text-sm font-bold text-primary">{member.streak}🔥</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-muted">XP</Text>
                    <Text className="text-sm font-bold text-primary">{member.xp}</Text>
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
        <Text className="text-lg font-bold text-foreground mb-3">Leaderboard</Text>
        <View
          className="rounded-xl p-4 mb-6 border border-border"
          style={{ borderColor: colors.border }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-semibold text-foreground">Top Flyer</Text>
            <Text className="text-2xl">🏆</Text>
          </View>
          <Text className="text-lg font-bold text-primary">{stats.topMember.name}</Text>
          <Text className="text-sm text-muted mt-2">
            {stats.topMember.xp} XP • {stats.topMember.altitude} Altitude
          </Text>
        </View>

        {/* Accountability Nudge */}
        <View
          className="rounded-xl p-4 mb-6 border-l-4"
          style={{
            backgroundColor: colors.surface,
            borderLeftColor: colors.primary,
          }}
        >
          <Text className="text-sm font-semibold text-foreground mb-2">💡 Accountability Nudge</Text>
          <Text className="text-sm text-muted">
            {FlockModeService.generateAccountabilityNudge(flock, 'You')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-6">
          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="py-3 rounded-lg items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="font-semibold text-background">Create New Flock</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowJoinModal(true)}
            className="py-3 rounded-lg items-center border border-primary"
            style={{ borderColor: colors.primary }}
          >
            <Text className="font-semibold text-primary">Join Existing Flock</Text>
          </Pressable>
        </View>

        {/* Founder Credit */}
        <Text className="text-xs text-muted text-center mb-4">
          Falcon Focus by Korede Omotosho • Free forever
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
