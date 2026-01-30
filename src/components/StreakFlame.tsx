import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface StreakFlameProps {
  streak: number;
  showAnimation?: boolean;
}

export function StreakFlame({ streak, showAnimation = true }: StreakFlameProps) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (showAnimation && streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [streak, showAnimation]);

  if (streak === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noStreak}>Starte deinen Streak!</Text>
      </View>
    );
  }

  const flameSize = Math.min(streak, 7); // Cap visual size at 7 days
  const flames = '🔥'.repeat(Math.min(flameSize, 3)); // Max 3 flame emojis

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.flameContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.flames}>{flames}</Text>
      </Animated.View>
      <Text style={styles.streakCount}>{streak}</Text>
      <Text style={styles.streakLabel}>
        {streak === 1 ? 'Tag' : 'Tage'} in Folge
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  flameContainer: {
    marginBottom: 8,
  },
  flames: {
    fontSize: 48,
  },
  streakCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noStreak: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
});
