// Complete replacement for mobile-app/screens/HomeScreen.tsx with proper SVG support
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
import { supabase } from '../services/supabase';
import COLORS from '../theme/colors';
import GlassCard from '../components/GlassCard';
import HomeSkeleton from '../components/HomeSkeleton';
import Svg, { Circle, G } from 'react-native-svg';

// MultiRingProgress Component
const MultiRingProgress = ({ nutrients, size = 180, strokeWidth = 10 }) => {
  const [animatedValues, setAnimatedValues] = useState(nutrients.map(() => 0));
  
  useEffect(() => {
    const intervals = nutrients.map((_, index) => {
      const target = Math.min(Math.max(nutrients[index].progress, 0), 1);
      return setInterval(() => {
        setAnimatedValues(prev => {
          const newValues = [...prev];
          if (newValues[index] < target) {
            newValues[index] = Math.min(newValues[index] + 0.02, target);
          } else {
            clearInterval(intervals[index]);
          }
          return newValues;
        });
      }, 20);
    });
    
    return () => intervals.forEach(interval => clearInterval(interval));
  }, [nutrients]);

  const radius = (size - strokeWidth * nutrients.length) / 2;

  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {nutrients.map((nutrient, index) => {
            const ringRadius = radius - (index * strokeWidth * 1.8);
            const circumference = ringRadius * 2 * Math.PI;
            const progress = animatedValues[index];
            const strokeDashoffset = circumference * (1 - progress);
            
            return (
              <G key={nutrient.name}>
                {/* Background ring */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={ringRadius}
                  stroke="#f0f0f0"
                  strokeWidth={strokeWidth * 0.5}
                  fill="none"
                />
                {/* Progress ring */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={ringRadius}
                  stroke={nutrient.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  fill="none"
                />
              </G>
            );
          })}
        </G>
      </Svg>
      
      {/* Center display */}
      {nutrients.length > 0 && (
        <View style={styles.centerContent}>
          <Text style={styles.centerValue}>
            {Math.round(nutrients[0].currentValue || 0)}
          </Text>
          <Text style={styles.centerLabel}>
            {nutrients[0].name}
          </Text>
          {nutrients[0].goal && (
            <Text style={styles.centerSub}>
              of {Math.round(nutrients[0].goal)} goal
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

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

        {/* Nutrition Rings Card */}
        <GlassCard style={styles.nutritionCard}>
          <Text style={styles.cardTitle}>Nutrition Progress</Text>
          
          <MultiRingProgress
            nutrients={[
              {
                name: 'Calories',
                progress: goals?.calorie_goal ? safeSummary.calories / goals.calorie_goal : 0,
                color: '#FF6A3D',
                currentValue: safeSummary.calories,
                goal: goals?.calorie_goal
              },
              {
                name: 'Protein',
                progress: goals?.protein_goal ? safeSummary.protein / goals.protein_goal : 0,
                color: '#4A90E2',
                currentValue: safeSummary.protein,
                goal: goals?.protein_goal
              },
              {
                name: 'Carbs',
                progress: goals?.carb_goal ? safeSummary.carbs / goals.carb_goal : 0,
                color: '#7ED321',
                currentValue: safeSummary.carbs,
                goal: goals?.carb_goal
              },
              {
                name: 'Fat',
                progress: goals?.fat_goal ? safeSummary.fat / goals.fat_goal : 0,
                color: '#F5A623',
                currentValue: safeSummary.fat,
                goal: goals?.fat_goal
              }
            ]}
          />
          
          {/* Remaining calories text */}
          {goals?.calorie_goal && (
            <Text style={styles.remaining}>
              {Math.max(0, goals.calorie_goal - safeSummary.calories)} calories remaining
            </Text>
          )}
        </GlassCard>

        {/* Individual Macros (small cards) */}
        <View style={styles.row}>
          {[
            { key: 'protein', label: 'Protein', unit: 'g', color: '#4A90E2' },
            { key: 'carbs', label: 'Carbs', unit: 'g', color: '#7ED321' },
            { key: 'fat', label: 'Fat', unit: 'g', color: '#F5A623' }
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
                  {safeSummary[item.key]?.toFixed(1) || '0'} {item.unit}
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

  nutritionCard: {
    marginBottom: 14,
    alignItems: 'center',
    padding: 20
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16
  },

  ringContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 10
  },

  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },

  centerLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  centerSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  remaining: {
    fontSize: 14,
    color: COLORS.subText,
    marginTop: 12,
    textAlign: 'center'
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },

  smallCard: {
    width: '32%'
  },

  label: {
    fontSize: 13,
    color: COLORS.subText,
    marginBottom: 4
  },

  value: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text
  }
});
