import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryArea, VictoryTheme } from 'victory-native';

interface DataPoint {
  date: string;
  score: number;
}

interface MoodChartProps {
  data: DataPoint[];
  title: string;
  period: '7' | '30';
}

const screenWidth = Dimensions.get('window').width;

export function MoodChart({ data, title, period }: MoodChartProps) {
  if (data.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Noch nicht genug Daten.{'\n'}Check täglich ein! 📊
          </Text>
        </View>
      </View>
    );
  }

  // Format data for Victory
  const chartData = data.map((d, index) => ({
    x: index,
    y: d.score * 10, // Scale to 0-10
    label: d.date.slice(5), // MM-DD
  }));

  // Calculate trend (simple linear)
  const avgScore = data.reduce((sum, d) => sum + d.score, 0) / data.length;
  const trendUp = data.length > 1 && data[data.length - 1].score > data[0].score;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.trendBadge}>
          <Text style={styles.trendText}>
            {trendUp ? '📈' : '📉'} {(avgScore * 10).toFixed(1)}
          </Text>
        </View>
      </View>
      
      <VictoryChart
        width={screenWidth - 64}
        height={200}
        theme={VictoryTheme.material}
        padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
      >
        <VictoryAxis
          tickFormat={(t) => chartData[t]?.label || ''}
          tickCount={period === '7' ? 7 : 5}
          style={{
            axis: { stroke: '#e9ecef' },
            tickLabels: { fontSize: 10, fill: '#666' },
          }}
        />
        <VictoryAxis
          dependentAxis
          domain={[0, 10]}
          tickFormat={(t) => `${t}`}
          tickCount={5}
          style={{
            axis: { stroke: '#e9ecef' },
            tickLabels: { fontSize: 10, fill: '#666' },
            grid: { stroke: '#f1f3f5', strokeDasharray: '4,4' },
          }}
        />
        <VictoryArea
          data={chartData}
          interpolation="monotoneX"
          style={{
            data: {
              fill: 'rgba(124, 58, 237, 0.1)',
              stroke: '#7c3aed',
              strokeWidth: 2,
            },
          }}
        />
      </VictoryChart>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.legendText}>Gut (7-10)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Okay (4-6)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>Schwer (1-3)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  trendBadge: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
});
