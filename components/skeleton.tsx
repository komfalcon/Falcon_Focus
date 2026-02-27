import { View, Animated, StyleSheet } from "react-native";
import { useEffect, useRef } from "react";
import { useColors } from "@/hooks/use-colors";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  const colors = useColors();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <Skeleton width="60%" height={14} borderRadius={7} style={{ marginBottom: 10 }} />
      <Skeleton width="100%" height={10} borderRadius={5} style={{ marginBottom: 6 }} />
      <Skeleton width="80%" height={10} borderRadius={5} />
    </View>
  );
}

export function SkeletonStatCard() {
  const colors = useColors();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
      }}
    >
      <Skeleton width="50%" height={10} borderRadius={5} style={{ marginBottom: 10 }} />
      <Skeleton width={40} height={28} borderRadius={6} style={{ marginBottom: 4 }} />
      <Skeleton width="60%" height={8} borderRadius={4} />
    </View>
  );
}