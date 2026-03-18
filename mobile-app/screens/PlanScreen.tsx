import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { supabase } from '../services/supabase';
import COLORS from '../theme/colors';
import GlassCard from '../components/GlassCard';

export default function PlanScreen() {
  const [goals, setGoals] = useState({
    calorie_goal: '',
    protein_goal: '',
    carb_goal: '',
    fat_goal: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: goalData } = await supabase
        .from('UserGoals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (goalData) {
        setGoals({
          calorie_goal: goalData.calorie_goal?.toString() ?? '',
          protein_goal: goalData.protein_goal?.toString() ?? '',
          carb_goal: goalData.carb_goal?.toString() ?? '',
          fat_goal: goalData.fat_goal?.toString() ?? ''
        });
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const saveGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Login required', 'Create an account to save your goals');
        return;
      }

      const payload = {
        user_id: user.id,
        calorie_goal: Number(goals.calorie_goal) || 0,
        protein_goal: Number(goals.protein_goal) || 0,
        carb_goal: Number(goals.carb_goal) || 0,
        fat_goal: Number(goals.fat_goal) || 0
      };

      const { error } = await supabase
        .from('UserGoals')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Saved', 'Goals updated successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save goals');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Plan</Text>
      
      <GlassCard style={styles.card}>
        <Text style={styles.section}>Set Your Goals</Text>
        <Text style={styles.desc}>
          Customize your daily nutrition targets
        </Text>
        
        <View style={styles.inputGroup}>
          <Input 
            label="Calories" 
            value={goals.calorie_goal}
            onChangeText={(text) => setGoals({...goals, calorie_goal: text})}
            keyboardType="numeric"
          />
          
          <Input 
            label="Protein (g)" 
            value={goals.protein_goal}
            onChangeText={(text) => setGoals({...goals, protein_goal: text})}
            keyboardType="numeric"
          />
          
          <Input 
            label="Carbs (g)" 
            value={goals.carb_goal}
            onChangeText={(text) => setGoals({...goals, carb_goal: text})}
            keyboardType="numeric"
          />
          
          <Input 
            label="Fat (g)" 
            value={goals.fat_goal}
            onChangeText={(text) => setGoals({...goals, fat_goal: text})}
            keyboardType="numeric"
          />
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={saveGoals}>
          <Text style={styles.saveButtonText}>Save Plan</Text>
        </TouchableOpacity>
      </GlassCard>
    </ScrollView>
  );
}

const Input = ({ label, value, onChangeText, keyboardType }: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType || 'default'}
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16
  },

  card: {
    padding: 16
  },

  section: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8
  },

  desc: {
    color: COLORS.subText,
    marginBottom: 16
  },

  inputGroup: {
    marginBottom: 16
  },

  inputContainer: {
    marginBottom: 12
  },

  inputLabel: {
    fontSize: 14,
    color: COLORS.subText,
    marginBottom: 4
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: COLORS.text
  },

  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
