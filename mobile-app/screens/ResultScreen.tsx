import { updateStreak } from '../utils/streak';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { saveFoodEntry } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { BlurView } from 'expo-blur';


export default function ResultScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { scanResult } = route.params as { scanResult: any };

  const [portion, setPortion] = useState(1);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(30))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
  }, []);

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

      Alert.alert('Saved', 'Added to your daily log');
      navigation.navigate('Home');
    } catch (e) {
      Alert.alert('Error', 'Could not save entry');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY }]
        }}
      >
        {/* Image */}
        <Image source={{ uri: scanResult.image_url }} style={styles.image} />

        {/* Main Card */}
        <BlurView intensity={40} tint="light" style={styles.card}>
          <Text style={styles.title}>{scanResult.food_name}</Text>

          {/* Portion */}
          <View style={styles.portionRow}>
            <Text style={styles.label}>Portion</Text>

            <View style={styles.portionControls}>
              <TouchableOpacity onPress={() => setPortion(Math.max(1, portion - 1))}>
                <MaterialIcons name="remove-circle" size={28} color="#6200ee" />
              </TouchableOpacity>

              <Text style={styles.portionText}>{portion}</Text>

              <TouchableOpacity onPress={() => setPortion(portion + 1)}>
                <MaterialIcons name="add-circle" size={28} color="#6200ee" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Health Score */}
          <Text style={styles.section}>Health Score</Text>
          <ProgressBar progress={scanResult.health_score / 100} />

          {/* Macros */}
          <View style={styles.macroRow}>
            <MacroCard label="Calories" value={`${scaled.calories.toFixed(0)} kcal`} />
            <MacroCard label="Protein" value={`${scaled.protein.toFixed(1)} g`} />
            <MacroCard label="Carbs" value={`${scaled.carbs.toFixed(1)} g`} />
            <MacroCard label="Fat" value={`${scaled.fat.toFixed(1)} g`} />
          </View>

          {/* Advice */}
          <BlurView intensity={20} tint="light" style={styles.advice}>
            <Text style={styles.adviceTitle}>Insight</Text>
            <Text style={styles.adviceText}>{scanResult.health_advice}</Text>
          </BlurView>

          {/* Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Scan')}
            >
              <Text>Fix</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    </ScrollView>
  );
}

/* 🔥 MACRO CARD */
const MacroCard = ({ label, value }: any) => (
  <BlurView intensity={25} tint="light" style={styles.macroCard}>
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>{value}</Text>
  </BlurView>
);

const styles = StyleSheet.create({
  container: {
    padding: 16
  },

  image: {
    width: '100%',
    height: 260,
    borderRadius: 24,
    marginBottom: 16
  },

  card: {
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden'
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10
  },

  section: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '600'
  },

  portionRow: {
    marginBottom: 10
  },

  portionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },

  portionText: {
    marginHorizontal: 12,
    fontSize: 18,
    fontWeight: '600'
  },

  label: {
    fontSize: 13,
    color: '#777'
  },

  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },

  macroCard: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    overflow: 'hidden'
  },

  macroLabel: {
    fontSize: 12,
    color: '#777'
  },

  macroValue: {
    fontSize: 16,
    fontWeight: '600'
  },

  advice: {
    borderRadius: 16,
    padding: 12,
    marginTop: 10
  },

  adviceTitle: {
    fontWeight: '600',
    marginBottom: 4
  },

  adviceText: {
    fontSize: 14,
    lineHeight: 20
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },

  primaryBtn: {
    flex: 0.48,
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },

  secondaryBtn: {
    flex: 0.48,
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  }
});
