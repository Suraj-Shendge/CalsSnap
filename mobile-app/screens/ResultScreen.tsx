
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { saveFoodEntry } from '../services/api';
import ProgressBar from '../components/ProgressBar';

export default function ResultScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { scanResult } = route.params as { scanResult: any };
  const [portion, setPortion] = useState(1);

  // Adjust macros based on portion selection
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
      Alert.alert('Saved', 'Your entry has been stored.');
      navigation.navigate('Home');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not save entry.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: scanResult.image_url }} style={styles.image} />

      <View style={styles.card}>
        <Text style={styles.title}>{scanResult.food_name}</Text>

        {/* Portion selector */}
        <View style={styles.row}>
          <Text>Portion: </Text>
          <TouchableOpacity style={styles.portionBtn} onPress={() => setPortion(Math.max(1, portion - 1))}>
            <MaterialIcons name="remove-circle-outline" size={24} color="#6200ee" />
          </TouchableOpacity>
          <Text style={styles.portionNumber}>{portion}</Text>
          <TouchableOpacity style={styles.portionBtn} onPress={() => setPortion(portion + 1)}>
            <MaterialIcons name="add-circle-outline" size={24} color="#6200ee" />
          </TouchableOpacity>
        </View>

        {/* Health score */}
        <Text style={styles.subTitle}>Health Score</Text>
        <ProgressBar progress={scanResult.health_score / 100} color="#4caf50" />

        {/* Macro cards */}
        <View style={styles.macroContainer}>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Calories</Text>
            <Text style={styles.macroValue}>{scaled.calories.toFixed(0)} kcal</Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>{scaled.protein.toFixed(1)} g</Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>{scaled.carbs.toFixed(1)} g</Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroValue}>{scaled.fat.toFixed(1)} g</Text>
          </View>
        </View>

        {/* AI health advice */}
        <View style={styles.adviceCard}>
          <Text style={styles.adviceTitle}>Health Advice</Text>
          <Text style={styles.adviceText}>{scanResult.health_advice}</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.fixBtn} onPress={() => navigation.navigate('Scan')}>
            <Text style={styles.btnText}>Fix Results</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={handleSave}>
            <Text style={styles.btnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center' },
  image: { width: 250, height: 250, borderRadius: 12, marginBottom: 12 },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 5
  },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  subTitle: { marginTop: 12, fontSize: 16, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  portionBtn: { marginHorizontal: 8 },
  portionNumber: { fontSize: 18, fontWeight: '500' },
  macroContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12
  },
  macroCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4
  },
  macroLabel: { fontSize: 12, color: '#777' },
  macroValue: { fontSize: 16, fontWeight: '500' },
  adviceCard: {
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 12
  },
  adviceTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  adviceText: { fontSize: 14, lineHeight: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  fixBtn: {
    flex: 0.48,
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  doneBtn: {
    flex: 0.48,
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnText: { color: '#fff', fontWeight: '600' }
});
