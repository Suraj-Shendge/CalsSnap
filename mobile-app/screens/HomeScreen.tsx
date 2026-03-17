import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
  Pressable
} from 'react-native';
import { getDailySummary } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { supabase } from '../services/supabase';
import COLORS from '../theme/colors';
import GlassCard from '../components/GlassCard';

// 🔥 OPTIONAL: enable haptics
// import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fade = useState(new Animated.Value(0))[0];

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

        // 🔥 subtle screen fade
        Animated.timing(fade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }).start();
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={{ opacity: fade }}>
        <Text style={styles.title}>Today</Text>

        {/* 🔥 CALORIES CARD */}
        <Pressable
          onPress={() => {
            // 🔥 OPTIONAL: haptic feedback
            // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={({ pressed }) => [
            { transform: [{ scale: pressed ? 0.98 : 1 }] }
          ]}
        >
          <GlassCard style={styles.card}>
            <Text style={styles.label}>Calories</Text>
            <Text style={styles.bigValue}>
              {summary.calories.toFixed(0)} kcal
            </Text>

            {goals?.calorie_goal && (
              <>
                <ProgressBar
                  progress={summary.calories / goals.calorie_goal}
                  color={COLORS.primary}
                />
                <Text style={styles.sub}>
                  {Math.max(0, goals.calorie_goal - summary.calories)} remaining
                </Text>
              </>
            )}
          </GlassCard>
        </Pressable>

        {/* 🔥 MACROS */}
        <View style={styles.row}>
          {[
            { key: 'protein', label: 'Protein' },
            { key: 'carbs', label: 'Carbs' },
            { key: 'fat', label: 'Fat' }
          ].map((item, i) => (
            <Pressable
              key={i}
              onPress={() => {
                // 🔥 OPTIONAL: haptic
                // Haptics.selectionAsync();
              }}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.96 : 1 }] }
              ]}
            >
              <GlassCard style={styles.smallCard}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.value}>
                  {summary[item.key].toFixed(1)} g
                </Text>
              </GlassCard>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14
  },

  card: {
    marginBottom: 14
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  smallCard: {
    width: '32%'
  },

  label: {
    fontSize: 13,
    color: COLORS.subText,
    marginBottom: 4
  },

  bigValue: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6
  },

  value: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text
  },

  sub: {
    fontSize: 12,
    color: COLORS.subText,
    marginTop: 4
  }
});
