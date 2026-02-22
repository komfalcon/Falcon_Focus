import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Share, Alert } from 'react-native';
import { FlightCard, FlightCardsService } from '@/lib/flight-cards';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

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
        className="bg-surface rounded-3xl p-6 w-11/12 max-w-md shadow-2xl"
        style={{ backgroundColor: colors.surface }}
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
          className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 mb-6 border border-primary/20"
          style={{
            backgroundColor: colors.primary + '15',
            borderColor: colors.primary + '30',
          }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-foreground">🦅 {flightCard.altitude}</Text>
            <Text className="text-sm text-muted">{flightCard.xp} XP</Text>
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
        <Text className="text-sm font-semibold text-foreground mb-3">Share to:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6 -mx-2 px-2"
        >
          {platforms.map((platform) => (
            <Pressable
              key={platform.id}
              onPress={() => setSelectedPlatform(platform.id as any)}
              className={cn(
                'px-4 py-2 rounded-full mr-2 border-2 flex-row items-center gap-2',
                selectedPlatform === platform.id
                  ? 'bg-primary border-primary'
                  : 'bg-background border-border'
              )}
              style={
                selectedPlatform === platform.id
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.background, borderColor: colors.border }
              }
            >
              <Text className="text-lg">{platform.icon}</Text>
              <Text
                className={cn(
                  'text-xs font-semibold',
                  selectedPlatform === platform.id ? 'text-background' : 'text-foreground'
                )}
              >
                {platform.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Share Message Preview */}
        <View
          className="bg-background rounded-lg p-3 mb-6 border border-border"
          style={{ backgroundColor: colors.background, borderColor: colors.border }}
        >
          <Text className="text-xs text-muted mb-2">Message preview:</Text>
          <Text className="text-sm text-foreground leading-relaxed">{shareMessage}</Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={onClose}
            className="flex-1 py-3 rounded-lg border border-border items-center"
            style={{ borderColor: colors.border }}
          >
            <Text className="font-semibold text-foreground">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleShare}
            className="flex-1 py-3 rounded-lg items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="font-semibold text-background">Share Flight 🚀</Text>
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
