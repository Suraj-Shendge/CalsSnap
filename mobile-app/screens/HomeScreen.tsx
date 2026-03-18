import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Pressable
} from 'react-native';
import { getDailySummary } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { supabase } from '../services/supabase';
import COLORS from '../theme/colors';
import GlassCard from '../components/GlassCard';
import HomeSkeleton from '../components/HomeSkeleton';

export default function HomeScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fade = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Home screen loading timeout');
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching daily summary...');
        const sum = await getDailySummary();
        console.log('Daily summary fetched:', sum);
        setSummary(sum);

        // Only fetch goals for authenticated users
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('Fetching user goals...');
          const { data, error } = await supabase
            .from('UserGoals')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('User goals fetch error:', error);
            // Don't fail completely, just continue without goals
          } else if (data) {
            console.log('User goals fetched:', data);
            setGoals(data);
          }
        }
      } catch (err: any) {
        console.error('Home screen data fetch error:', err);
        setError(err.message || 'Unknown error occurred');
        // Set default values to prevent app crash
        setSummary({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      } finally {
        setLoading(false);

        // Subtle screen fade
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
    return <HomeSkeleton />;
  }

  // Show error message if needed
  if (error) {
    console.log('Displaying error state:', error);
  }

  // Provide default values if summary is null
  const safeSummary = summary || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={{ opacity: fade }}>
        <Text style={styles.title}>Today</Text>

        {/* Calories Card */}
        <Pressable
          style={({ pressed }) => [
            { transform: [{ scale: pressed ? 0.98 : 1 }] }
          ]}
        >
          <GlassCard style={styles.card}>
            <Text style={styles.label}>Calories</Text>
            <Text style={styles.bigValue}>
              {safeSummary.calories?.toFixed(0) || '0'} kcal
            </Text>

            {goals?.calorie_goal && (
              <>
                <ProgressBar
                  progress={safeSummary.calories / goals.calorie_goal}
                  color={COLORS.primary}
                />
                <Text style={styles.sub}>
                  {Math.max(0, goals.calorie_goal - safeSummary.calories)} remaining
                </Text>
              </>
            )}
          </GlassCard>
        </Pressable>

        {/* Macros */}
        <View style={styles.row}>
          {[
            { key: 'protein', label: 'Protein' },
            { key: 'carbs', label: 'Carbs' },
            { key: 'fat', label: 'Fat' }
          ].map((item, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.96 : 1 }] }
              ]}
            >
              <GlassCard style={styles.smallCard}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.value}>
                  {safeSummary[item.key]?.toFixed(1) || '0'} g
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
