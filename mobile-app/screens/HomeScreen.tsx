
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getDailySummary } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { supabase } from '../services/supabase';

export default function HomeScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const sum = await getDailySummary();
        setSummary(sum);

        // Get user goals
        const { data, error } = await supabase
          .from('UserGoals')
          .select('*')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();
        if (!error && data) setGoals(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const remainingCalories = goals?.calorie_goal
    ? Math.max(0, goals.calorie_goal - summary.calories)
    : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Today’s Progress</Text>

      {/* Calories card */}
      <View style={styles.card}>
        <Text style={styles.label}>Calories</Text>
        <Text style={styles.value}>{summary.calories.toFixed(0)} kcal</Text>
        {goals?.calorie_goal && (
          <>
            <ProgressBar progress={summary.calories / goals.calorie_goal} color="#ff9800" />
            <Text style={styles.goalText}>
              {remainingCalories} kcal left of {goals.calorie_goal} kcal
            </Text>
          </>
        )}
      </View>

      {/* Macro progress */}
      <View style={styles.macroRow}>
        <View style={styles.macroCard}>
          <Text style={styles.label}>Protein</Text>
          <Text style={styles.value}>{summary.protein.toFixed(1)} g</Text>
          {goals?.protein_goal && (
            <ProgressBar progress={summary.protein / goals.protein_goal} color="#4caf50" />
          )}
        </View>
        <View style={styles.macroCard}>
          <Text style={styles.label}>Carbs</Text>
          <Text style={styles.value}>{summary.carbs.toFixed(1)} g</Text>
          {goals?.carb_goal && (
            <ProgressBar progress={summary.carbs / goals.carb_goal} color="#2196f3" />
          )}
        </View>
        <View style={styles.macroCard}>
          <Text style={styles.label}>Fat</Text>
          <Text style={styles.value}>{summary.fat.toFixed(1)} g</Text>
          {goals?.fat_goal && (
            <ProgressBar progress={summary.fat / goals.fat_goal} color="#f44336" />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 3
  },
  label: { fontSize: 14, color: '#777' },
  value: { fontSize: 22, fontWeight: '600' },
  goalText: { fontSize: 12, color: '#555', marginTop: 4 },
  macroRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  macroCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    elevation: 2
  }
});
