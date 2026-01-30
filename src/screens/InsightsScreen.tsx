import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MoodChart } from '../components/MoodChart';
import { TagInsights } from '../components/TagInsights';
import { StreakFlame } from '../components/StreakFlame';
import { useInsights } from '../hooks/useInsights';
import { useStreak } from '../hooks/useStreak';

type Period = '7' | '30';

export function InsightsScreen() {
  const [period, setPeriod] = useState<Period>('7');
  const { insights, isLoading, error, refresh } = useInsights();
  const { streak } = useStreak();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>😕 {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Nochmal versuchen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartData = period === '7' ? insights?.weekData : insights?.monthData;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Deine Insights</Text>
        <Text style={styles.subtitle}>
          {insights?.totalCheckins || 0} Check-ins analysiert
        </Text>
      </View>

      {/* Streak */}
      <View style={styles.streakCard}>
        <StreakFlame streak={streak?.current_streak || 0} />
        {streak && streak.longest_streak > 0 && (
          <Text style={styles.longestStreak}>
            Längster Streak: {streak.longest_streak} Tage 🏆
          </Text>
        )}
      </View>

      {/* Period Toggle */}
      <View style={styles.periodToggle}>
        <TouchableOpacity
          style={[styles.periodButton, period === '7' && styles.periodButtonActive]}
          onPress={() => setPeriod('7')}
        >
          <Text style={[styles.periodButtonText, period === '7' && styles.periodButtonTextActive]}>
            7 Tage
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === '30' && styles.periodButtonActive]}
          onPress={() => setPeriod('30')}
        >
          <Text style={[styles.periodButtonText, period === '30' && styles.periodButtonTextActive]}>
            30 Tage
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mood Chart */}
      <MoodChart
        data={chartData || []}
        title={period === '7' ? 'Letzte 7 Tage' : 'Letzte 30 Tage'}
        period={period}
      />

      {/* Day Insights */}
      {insights?.bestDay && insights?.worstDay && (
        <View style={styles.dayInsights}>
          <View style={styles.dayCard}>
            <Text style={styles.dayEmoji}>🌟</Text>
            <Text style={styles.dayLabel}>Bester Tag</Text>
            <Text style={styles.dayValue}>{insights.bestDay}</Text>
          </View>
          <View style={styles.dayCard}>
            <Text style={styles.dayEmoji}>🌧️</Text>
            <Text style={styles.dayLabel}>Härtester Tag</Text>
            <Text style={styles.dayValue}>{insights.worstDay}</Text>
          </View>
        </View>
      )}

      {/* Average Score */}
      {insights && insights.totalCheckins > 0 && (
        <View style={styles.averageCard}>
          <Text style={styles.averageLabel}>Durchschnittliche Stimmung</Text>
          <View style={styles.averageRow}>
            <Text style={styles.averageScore}>
              {(insights.averageScore * 10).toFixed(1)}
            </Text>
            <Text style={styles.averageMax}>/10</Text>
            <Text style={styles.averageEmoji}>
              {insights.averageScore >= 0.7 ? '😊' : insights.averageScore >= 0.5 ? '🙂' : '😔'}
            </Text>
          </View>
        </View>
      )}

      {/* Tag Insights */}
      <TagInsights correlations={insights?.tagCorrelations || []} />

      {/* Empty State */}
      {(!insights || insights.totalCheckins === 0) && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>Noch keine Daten</Text>
          <Text style={styles.emptyText}>
            Starte mit deinem ersten Check-in,{'\n'}um Insights zu sehen!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  streakCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  longestStreak: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  periodToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#7c3aed',
  },
  dayInsights: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  dayCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dayEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
  },
  dayValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginTop: 4,
  },
  averageCard: {
    backgroundColor: '#7c3aed',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  averageLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  averageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  averageScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  averageMax: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 4,
  },
  averageEmoji: {
    fontSize: 32,
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
