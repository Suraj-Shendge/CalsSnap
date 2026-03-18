// Complete replacement for mobile-app/screens/AnalysisScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  TouchableOpacity
} from 'react-native';
import { getDailySummary } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../theme/colors';
import GlassCard from '../components/GlassCard';
import { MaterialIcons } from '@expo/vector-icons';

export default function AnalysisScreen() {
  const navigation = useNavigation<any>();

  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fade = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchData();

    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getDailySummary();
      setSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getFeedback = () => {
    if (!summary) return '';

    if (summary.calories < 1500) return 'You are eating too little';
    if (summary.calories > 2500) return 'You are overeating';
    return 'You are on track';
  };

  const getMacroBalance = () => {
    if (!summary) return { protein: 0, carbs: 0, fat: 0 };
    
    const total = summary.protein + summary.carbs + summary.fat;
    if (total === 0) return { protein: 0, carbs: 0, fat: 0 };
    
    return {
      protein: (summary.protein / total) * 100,
      carbs: (summary.carbs / total) * 100,
      fat: (summary.fat / total) * 100
    };
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const macroBalance = getMacroBalance();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={{ opacity: fade }}>
        <Text style={styles.title}>Analysis</Text>

        {/* Daily Status */}
        <GlassCard style={styles.card}>
          <Text style={styles.label}>Today</Text>
          <Text style={styles.big}>{summary?.calories || 0} kcal</Text>
          <Text style={styles.feedback}>{getFeedback()}</Text>
        </GlassCard>

        {/* Macro Balance */}
        <GlassCard style={styles.card}>
          <Text style={styles.section}>Macro Balance</Text>
          
          <View style={styles.macroItem}>
            <View style={styles.macroHeader}>
              <MaterialIcons name="fitness-center" size={20} color="#4A90E2" />
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <Text style={styles.macroValue}>{macroBalance.protein.toFixed(1)}%</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${macroBalance.protein}%`, 
                    backgroundColor: '#4A90E2' 
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.macroItem}>
            <View style={styles.macroHeader}>
              <MaterialIcons name="grain" size={20} color="#7ED321" />
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <Text style={styles.macroValue}>{macroBalance.carbs.toFixed(1)}%</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${macroBalance.carbs}%`, 
                    backgroundColor: '#7ED321' 
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.macroItem}>
            <View style={styles.macroHeader}>
              <MaterialIcons name="opacity" size={20} color="#F5A623" />
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
            <Text style={styles.macroValue}>{macroBalance.fat.toFixed(1)}%</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${macroBalance.fat}%`, 
                    backgroundColor: '#F5A623' 
                  }
                ]} 
              />
            </View>
          </View>
        </GlassCard>

        {/* Weekly Trends */}
        <GlassCard style={styles.card}>
          <Text style={styles.section}>Weekly Trends</Text>
          <Text style={styles.comingSoon}>Chart visualization coming soon</Text>
        </GlassCard>

        {/* Premium Insights */}
        <GlassCard style={styles.lockedCard}>
          <Text style={styles.section}>Advanced Insights 🔒</Text>
          <Text style={styles.lockedText}>
            Weekly trends, fat loss prediction, and deeper analysis
          </Text>

          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => navigation.navigate('Paywall')}
          >
            <Text style={styles.upgradeText}>
              Unlock Premium
            </Text>
          </TouchableOpacity>
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

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16
  },

  card: {
    marginBottom: 14,
    padding: 16
  },

  lockedCard: {
    padding: 16,
    opacity: 0.9
  },

  label: {
    fontSize: 13,
    color: COLORS.subText,
    marginBottom: 4
  },

  big: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text
  },

  feedback: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.subText
  },

  section: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12
  },

  macroItem: {
    marginBottom: 16
  },

  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },

  macroLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 8
  },

  macroValue: {
    fontSize: 14,
    color: COLORS.subText,
    marginBottom: 4
  },

  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden'
  },

  progressFill: {
    height: '100%',
    borderRadius: 4
  },

  lockedText: {
    color: COLORS.subText,
    marginBottom: 16
  },

  upgradeBtn: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },

  upgradeText: {
    color: '#fff',
    fontWeight: '600'
  },

  comingSoon: {
    color: COLORS.subText,
    textAlign: 'center',
    fontStyle: 'italic'
  }
});
