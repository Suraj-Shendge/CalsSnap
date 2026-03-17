import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated
} from 'react-native';
import { BlurView } from 'expo-blur';
import { getDailySummary } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { supabase } from '../services/supabase';

export default function HomeScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(20))[0];

  useEffect(() => {
    fetchData();
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  };

  const fetchData = async () => {
    try {
      const sum = await getDailySummary();
      setSummary(sum || { calories: 0, protein: 0, carbs: 0, fat: 0 });

      const user = (await supabase.auth.getUser()).data.user;

      if (user) {
        const { data } = await supabase
          .from('UserGoals')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) setGoals(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY }]
        }}
      >
        {/* Greeting */}
        <Text style={styles.title}>Today</Text>
        <Text style={styles.subtitle}>Track your nutrition</Text>

        {/* Calories Card */}
        <BlurView intensity={40} tint="light" style={styles.glassCard}>
          <Text style={styles.label}>Calories</Text>
          <Text style={styles.value}>
            {summary.calories.toFixed(0)} kcal
          </Text>

          {goals?.calorie_goal && (
            <>
              <ProgressBar
                progress={summary.calories / goals.calorie_goal}
              />
              <Text style={styles.goalText}>
                {remainingCalories} kcal left
              </Text>
            </>
          )}
        </BlurView>

        {/* Macros */}
        <View style={styles.macroRow}>
          <GlassCard title="Protein" value={`${summary.protein.toFixed(1)} g`} progress={goals?.protein_goal ? summary.protein / goals.protein_goal : 0} />

          <GlassCard title="Carbs" value={`${summary.carbs.toFixed(1)} g`} progress={goals?.carb_goal ? summary.carbs / goals.carb_goal : 0} />

          <GlassCard title="Fat" value={`${summary.fat.toFixed(1)} g`} progress={goals?.fat_goal ? summary.fat / goals.fat_goal : 0} />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

/* 🔥 REUSABLE GLASS CARD */
const GlassCard = ({ title, value, progress }: any) => (
  <BlurView intensity={30} tint="light" style={styles.macroCard}>
    <Text style={styles.label}>{title}</Text>
    <Text style={styles.value}>{value}</Text>
    {progress > 0 && <ProgressBar progress={progress} />}
  </BlurView>
);

const styles = StyleSheet.create({
  container: {
    padding: 16
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  title: {
    fontSize: 32,
    fontWeight: '700'
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16
  },

  glassCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden'
  },

  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },

  macroCard: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    overflow: 'hidden'
  },

  label: {
    fontSize: 13,
    color: '#777'
  },

  value: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6
  },

  goalText: {
    fontSize: 12,
    color: '#555',
    marginTop: 6
  }
});
