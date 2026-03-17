import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getDailySummary } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { supabase } from '../services/supabase';
import COLORS from '../theme/colors';

export default function HomeScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const sum = await getDailySummary();
        setSummary(sum);

        const { data } = await supabase
          .from('UserGoals')
          .select('*')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (data) setGoals(data);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Today</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Calories</Text>
        <Text style={styles.value}>{summary.calories.toFixed(0)} kcal</Text>

        {goals?.calorie_goal && (
          <>
            <ProgressBar progress={summary.calories / goals.calorie_goal} color={COLORS.primary} />
            <Text style={styles.sub}>
              {Math.max(0, goals.calorie_goal - summary.calories)} left
            </Text>
          </>
        )}
      </View>

      <View style={styles.row}>
        {['protein', 'carbs', 'fat'].map((key, i) => (
          <View key={i} style={styles.smallCard}>
            <Text style={styles.label}>{key}</Text>
            <Text style={styles.value}>{summary[key].toFixed(1)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 12 },

  card: {
    backgroundColor: COLORS.glass,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12
  },

  row: { flexDirection: 'row', justifyContent: 'space-between' },

  smallCard: {
    width: '32%',
    backgroundColor: COLORS.glass,
    borderRadius: 16,
    padding: 12
  },

  label: { color: COLORS.subText },
  value: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.subText }
});
