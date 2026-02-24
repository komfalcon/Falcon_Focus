import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Share, Alert } from 'react-native';
import { FlightCard, FlightCardsService } from '@/lib/flight-cards';
import { useColors } from '@/hooks/use-colors';

interface FlightCardShareModalProps {
  flightCard: FlightCard;
  visible: boolean;
  onClose: () => void;
}

export function FlightCardShareModal({
  flightCard,
  visible,
  onClose,
}: FlightCardShareModalProps) {
  const colors = useColors();
  const [selectedPlatform, setSelectedPlatform] = useState<
    'whatsapp' | 'instagram' | 'sms' | 'email' | 'generic'
  >('generic');

  if (!visible) return null;

  const shareMessage = FlightCardsService.generateShareMessage(flightCard, selectedPlatform);
  const shareCode = FlightCardsService.generateShareCode();
  const shareLink = FlightCardsService.generateShareLink(flightCard, shareCode);

  const handleShare = async () => {
    try {
      await Share.share({
        message: shareMessage,
        url: shareLink,
        title: `${flightCard.altitude} Altitude - Falcon Focus`,
      });
    } catch (error) {
      Alert.alert('Share Error', 'Failed to share Flight Card');
    }
  };

  const platforms = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'sms', name: 'SMS', icon: '📱' },
    { id: 'email', name: 'Email', icon: '✉️' },
    { id: 'generic', name: 'Share', icon: '🔗' },
  ];

  return (
    <View className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <View
        className="w-11/12 max-w-md rounded-3xl p-6"
        style={{
          backgroundColor: colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">Share Your Flight</Text>
          <Text className="text-sm text-muted mt-2">
            Inspire your flock with your Falcon Focus progress
          </Text>
        </View>

        {/* Flight Card Preview */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: colors.primary + '12',
            borderWidth: 1,
            borderColor: colors.primary + '25',
          }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-foreground">🦅 {flightCard.altitude}</Text>
            <Text className="text-sm font-semibold" style={{ color: colors.accent }}>{flightCard.xp} XP</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-foreground">
              🔥 {flightCard.streak}-day streak
            </Text>
            <Text className="text-xs text-muted">Falcon Focus by Korede Omotosho</Text>
          </View>
          <Text className="text-xs text-muted italic mt-3">"{flightCard.motivationalQuote}"</Text>
        </View>

        {/* Platform Selection */}
        <Text className="text-sm font-bold text-foreground mb-3">Share to:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6 -mx-2 px-2"
        >
          {platforms.map((platform) => (
            <Pressable
              key={platform.id}
              onPress={() => setSelectedPlatform(platform.id as any)}
              className="mr-2 flex-row items-center gap-2 active:opacity-90"
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 16,
                borderWidth: 2,
                backgroundColor: selectedPlatform === platform.id ? colors.primary : colors.background,
                borderColor: selectedPlatform === platform.id ? colors.primary : colors.border,
              }}
            >
              <Text className="text-lg">{platform.icon}</Text>
              <Text
                className="text-xs font-bold"
                style={{ color: selectedPlatform === platform.id ? '#ffffff' : colors.foreground }}
              >
                {platform.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Share Message Preview */}
        <View
          className="rounded-2xl p-4 mb-6"
          style={{
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text className="text-xs text-muted mb-2">Message preview:</Text>
          <Text className="text-sm text-foreground leading-relaxed">{shareMessage}</Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={onClose}
            className="flex-1 py-4 rounded-2xl items-center active:opacity-80"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: colors.border,
            }}
          >
            <Text className="font-bold text-foreground">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleShare}
            className="flex-1 py-4 rounded-2xl items-center active:opacity-80"
            style={{
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="font-bold text-white">Share Flight 🚀</Text>
          </Pressable>
        </View>

        {/* Founder Credit */}
        <Text className="text-xs text-muted text-center mt-4">
          Falcon Focus by Korede Omotosho • Free forever
        </Text>
      </View>
    </View>
  );
}
