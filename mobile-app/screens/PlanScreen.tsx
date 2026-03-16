
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { MaterialIcons } from '@expo/vector-icons';

export default function PlanScreen() {
  const [goals, setGoals] = useState({
    calorie_goal: '',
    protein_goal: '',
    carb_goal: '',
    fat_goal: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGoals() {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      const { data, error } = await supabase.from('UserGoals').select('*').eq('user_id', user.id).single();
      if (!error && data) {
        setGoals({
          calorie_goal: data.calorie_goal?.toString() ?? '',
          protein_goal: data.protein_goal?.toString() ?? '',
          carb_goal: data.carb_goal?.toString() ?? '',
          fat_goal: data.fat_goal?.toString() ?? ''
        });
      }
      setLoading(false);
    }
    loadGoals();
  }, []);

  const saveGoals = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    try {
      const payload = {
        user_id: user.id,
        calorie_goal: Number(goals.calorie_goal) || 2000,
        protein_goal: Number(goals.protein_goal) || 75,
        carb_goal: Number(goals.carb_goal) || 250,
        fat_goal: Number(goals.fat_goal) || 70
      };
      const { error } = await supabase.from('UserGoals').upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      Alert.alert('Saved', 'Your daily goals have been updated.');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message);
    }
  };

  const autoGenerate = () => {
    // Simple heuristic – you could substitute a smarter algorithm later
    setGoals({
      calorie_goal: '2000',
      protein_goal: '75',
      carb_goal: '250',
      fat_goal: '70'
    });
  };

  if (loading) {
    return <View style={styles.center}><Text>Loading…</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adjust Daily Goals</Text>

      <View style={styles.row}>
        <MaterialIcons name="local-fire-dept" size={24} color="#ff5722" />
        <TextInput
          placeholder="Calories"
          keyboardType="numeric"
          style={styles.input}
          value={goals.calorie_goal}
          onChangeText={t => setGoals({ ...goals, calorie_goal: t })}
        />
      </View>

      <View style={styles.row}>
        <MaterialIcons name="fitness-center" size={24} color="#4caf50" />
        <TextInput
          placeholder="Protein (g)"
          keyboardType="numeric"
          style={styles.input}
          value={goals.protein_goal}
          onChangeText={t => setGoals({ ...goals, protein_goal: t })}
        />
      </View>

      <View style={styles.row}>
        <MaterialIcons name="restaurant" size={24} color="#2196f3" />
        <TextInput
          placeholder="Carbs (g)"
          keyboardType="numeric"
          style={styles.input}
          value={goals.carb_goal}
          onChangeText={t => setGoals({ ...goals, carb_goal: t })}
        />
      </View>

      <View style={styles.row}>
        <MaterialIcons name="oil-barrel" size={24} color="#f44336" />
        <TextInput
          placeholder="Fat (g)"
          keyboardType="numeric"
          style={styles.input}
          value={goals.fat_goal}
          onChangeText={t => setGoals({ ...goals, fat_goal: t })}
        />
      </View>

      <Button title="Save Goals" onPress={saveGoals} />
      <View style={{ height: 12 }} />
      <Button title="Auto Generate Goals" onPress={autoGenerate} color="#6200ee" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, marginBottom: 12, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: {
    flex: 1,
    marginLeft: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 4
  }
});
