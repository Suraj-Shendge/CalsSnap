// Complete replacement for mobile-app/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Pressable,
  TouchableOpacity,
  Alert
} from 'react-native';
import { getDailySummary } from '../services/api';
import { supabase } from '../services/supabase';
import COLORS from '../theme/colors';
import GlassCard from '../components/GlassCard';
import HomeSkeleton from '../components/HomeSkeleton';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
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
  const navigation = useNavigation<any>();
  const [summary, setSummary] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

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

        // Fetch user goals
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
          } else if (data) {
            console.log('User goals fetched:', data);
            setGoals(data);
          }

          // Fetch streak
          const { data: streakData, error: streakError } = await supabase
            .from('Users')
            .select('streak')
            .eq('id', user.id)
            .single();

          if (!streakError && streakData) {
            setStreak(streakData.streak || 0);
          }
        }
      } catch (err: any) {
        console.error('Home screen data fetch error:', err);
        setError(err.message || 'Unknown error occurred');
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

  const handleManualSearch = () => {
    Alert.prompt(
      'Manual Food Search',
      'Enter food name:',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Search',
          onPress: (foodName) => {
            if (foodName && foodName.trim()) {
              // Navigate to manual search screen or show results
              Alert.alert('Search', `Searching for: ${foodName}`);
            }
          }
        }
      ],
      'plain-text'
    );
  };

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

        {/* Streak Card */}
        <GlassCard style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <MaterialIcons name="local-fire-department" size={24} color="#FF6A3D" />
            <Text style={styles.streakTitle}>Day Streak</Text>
          </View>
          <Text style={styles.streakValue}>{streak} days</Text>
        </GlassCard>

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

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('Scan')}
          >
            <MaterialIcons name="camera-alt" size={24} color="#FFF" />
            <Text style={styles.actionText}>Scan Food</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={handleManualSearch}
          >
            <MaterialIcons name="search" size={24} color={COLORS.primary} />
            <Text style={[styles.actionText, styles.secondaryText]}>Manual Search</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Foods */}
        <GlassCard style={styles.recentCard}>
          <Text style={styles.sectionTitle}>Recent Foods</Text>
          <Text style={styles.emptyText}>No foods logged today</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Scan')}>
            <Text style={styles.addFoodText}>+ Add your first food</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Nutrition Tips */}
        <GlassCard style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>Nutrition Tip</Text>
          <Text style={styles.tipText}>
            Drink water before meals to help control portion sizes and support digestion.
          </Text>
        </GlassCard>
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

  streakCard: {
    marginBottom: 14,
    padding: 16
  },

  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },

  streakTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8
  },

  streakValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary
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

  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14
  },

  actionButton: {
    flex: 0.48,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary
  },

  actionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },

  secondaryText: {
    color: COLORS.primary
  },

  recentCard: {
    marginBottom: 14,
    padding: 16
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12
  },

  emptyText: {
    color: COLORS.subText,
    textAlign: 'center',
    marginBottom: 12
  },

  addFoodText: {
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '600'
  },

  tipsCard: {
    padding: 16
  },

  tipText: {
    color: COLORS.subText,
    fontStyle: 'italic',
    textAlign: 'center'
  }
});
