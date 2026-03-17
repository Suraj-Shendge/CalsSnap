import { updateStreak } from '../utils/streak';
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Animated
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { saveFoodEntry } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import COLORS from '../theme/colors';
import GlassCard from '../components/GlassCard';
import useFadeSlide from '../utils/useFadeSlide';
import InteractiveButton from '../components/InteractiveButton';

// 🔥 OPTIONAL: enable haptics
// import * as Haptics from 'expo-haptics';

export default function ResultScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { scanResult } = route.params as { scanResult: any };

  const [portion, setPortion] = useState(1);

  const anim = useFadeSlide();

  const scaled = {
    calories: scanResult.calories * portion,
    protein: scanResult.protein * portion,
    carbs: scanResult.carbs * portion,
    fat: scanResult.fat * portion
  };

  const handleSave = async () => {
    try {
      await saveFoodEntry({
        food_name: scanResult.food_name,
        calories: scaled.calories,
        protein: scaled.protein,
        carbs: scaled.carbs,
        fat: scaled.fat,
        health_score: scanResult.health_score,
        health_advice: scanResult.health_advice,
        image_url: scanResult.image_url
      });

      await updateStreak();

      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert('Saved', 'Added to your daily log');
      navigation.navigate('Home');
    } catch (e) {
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Could not save entry');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={anim.style}>
        {/* Image */}
        <Image source={{ uri: scanResult.image_url }} style={styles.image} />

        {/* Main Card */}
        <GlassCard style={styles.card}>
          <Text style={styles.title}>{scanResult.food_name}</Text>

          {/* Portion */}
          <View style={styles.portionRow}>
            <Text style={styles.label}>Portion</Text>

            <View style={styles.portionControls}>
              <InteractiveButton onPress={() => setPortion(Math.max(1, portion - 1))}>
                <MaterialIcons name="remove-circle" size={28} color={COLORS.primary} />
              </InteractiveButton>

              <Text style={styles.portionText}>{portion}</Text>

              <InteractiveButton onPress={() => setPortion(portion + 1)}>
                <MaterialIcons name="add-circle" size={28} color={COLORS.primary} />
              </InteractiveButton>
            </View>
          </View>

          {/* Health Score */}
          <Text style={styles.section}>Health Score</Text>
          <ProgressBar
            progress={scanResult.health_score / 100}
            color={COLORS.primary}
          />

          {/* Macros */}
          <View style={styles.macroRow}>
            <MacroCard label="Calories" value={`${scaled.calories.toFixed(0)} kcal`} />
            <MacroCard label="Protein" value={`${scaled.protein.toFixed(1)} g`} />
            <MacroCard label="Carbs" value={`${scaled.carbs.toFixed(1)} g`} />
            <MacroCard label="Fat" value={`${scaled.fat.toFixed(1)} g`} />
          </View>

          {/* Advice */}
          <GlassCard style={styles.advice}>
            <Text style={styles.adviceTitle}>Insight</Text>
            <Text style={styles.adviceText}>{scanResult.health_advice}</Text>
          </GlassCard>

          {/* Actions */}
          <View style={styles.actions}>
            <InteractiveButton
              onPress={() => navigation.navigate('Scan')}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryText}>Fix</Text>
            </InteractiveButton>

            <InteractiveButton
              onPress={handleSave}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryText}>Add</Text>
            </InteractiveButton>
          </View>
        </GlassCard>
      </Animated.View>
    </ScrollView>
  );
}

/* 🔥 MACRO CARD */
const MacroCard = ({ label, value }: any) => (
  <GlassCard style={styles.macroCard}>
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>{value}</Text>
  </GlassCard>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center'
  },

  image: {
    width: 260,
    height: 260,
    borderRadius: 22,
    marginBottom: 14
  },

  card: {
    width: '100%'
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10
  },

  portionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },

  portionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },

  portionText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text
  },

  section: {
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '600',
    color: COLORS.text
  },

  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10
  },

  macroCard: {
    width: '48%',
    marginBottom: 8
  },

  macroLabel: {
    fontSize: 12,
    color: COLORS.subText
  },

  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text
  },

  advice: {
    marginTop: 12
  },

  adviceTitle: {
    fontWeight: '600',
    marginBottom: 6,
    color: COLORS.text
  },

  adviceText: {
    color: COLORS.subText,
    lineHeight: 18
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18
  },

  secondaryBtn: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center'
  },

  secondaryText: {
    color: COLORS.text,
    fontWeight: '500'
  },

  primaryBtn: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center'
  },

  primaryText: {
    color: '#fff',
    fontWeight: '600'
  }
});
