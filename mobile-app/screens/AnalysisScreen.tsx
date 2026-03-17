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
import { BlurView } from 'expo-blur';
import { getDailySummary } from '../services/api';
import { useNavigation } from '@react-navigation/native';

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
        <Text style={styles.title}>Analysis</Text>

        {/* 🔥 DAILY STATUS */}
        <BlurView intensity={40} tint="light" style={styles.card}>
          <Text style={styles.label}>Today</Text>
          <Text style={styles.big}>{summary?.calories || 0} kcal</Text>
          <Text style={styles.feedback}>{getFeedback()}</Text>
        </BlurView>

        {/* 🔥 MACRO BALANCE */}
        <BlurView intensity={30} tint="light" style={styles.card}>
          <Text style={styles.section}>Macro Balance</Text>

          <Text>Protein: {summary?.protein?.toFixed(1)} g</Text>
          <Text>Carbs: {summary?.carbs?.toFixed(1)} g</Text>
          <Text>Fat: {summary?.fat?.toFixed(1)} g</Text>
        </BlurView>

        {/* 🔒 PREMIUM */}
        <BlurView intensity={20} tint="light" style={styles.lockedCard}>
          <Text style={styles.section}>Advanced Insights 🔒</Text>
          <Text style={styles.lockedText}>
            Weekly trends, fat loss prediction, and deeper analysis
          </Text>

          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => navigation.navigate('Paywall')}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              Unlock Premium
            </Text>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </ScrollView>
  );
}

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
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16
  },

  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden'
  },

  lockedCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    opacity: 0.9
  },

  label: {
    fontSize: 13,
    color: '#777'
  },

  big: {
    fontSize: 26,
    fontWeight: '700'
  },

  feedback: {
    marginTop: 6,
    fontSize: 14
  },

  section: {
    fontWeight: '600',
    marginBottom: 6
  },

  lockedText: {
    color: '#666',
    marginBottom: 10
  },

  upgradeBtn: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center'
  }
});
