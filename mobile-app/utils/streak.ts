import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated
} from 'react-native';
import { supabase } from '../services/supabase';
import { BlurView } from 'expo-blur';

export default function PlanScreen() {
  const [goals, setGoals] = useState({
    calorie_goal: '',
    protein_goal: '',
    carb_goal: '',
    fat_goal: ''
  });

  const [profile, setProfile] = useState<any>(null);
  const [fade] = useState(new Animated.Value(0));

  useEffect(() => {
    loadData();

    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  const loadData = async () => {
    const user = (await supabase.auth.getUser()).data.user;

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

    const { data: profileData } = await supabase
      .from('Users')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(profileData);
  };

  const autoGenerate = () => {
    if (!profile) {
      Alert.alert('Missing data', 'Fill your profile first');
      return;
    }

    const weight = profile.weight || 70;

    let calories = 10 * weight * 1.3;

    if (profile.goal === 'lose') calories -= 300;
    if (profile.goal === 'gain') calories += 300;

    const protein = weight * 1.5;
    const fat = weight * 0.8;
    const carbs = (calories - (protein * 4 + fat * 9)) / 4;

    setGoals({
      calorie_goal: Math.round(calories).toString(),
      protein_goal: Math.round(protein).toString(),
      carb_goal: Math.round(carbs).toString(),
      fat_goal: Math.round(fat).toString()
    });
  };

  const saveGoals = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const payload = {
      user_id: user.id,
      calorie_goal: Number(goals.calorie_goal),
      protein_goal: Number(goals.protein_goal),
      carb_goal: Number(goals.carb_goal),
      fat_goal: Number(goals.fat_goal)
    };

    const { error } = await supabase
      .from('UserGoals')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Saved', 'Goals updated');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={{ opacity: fade }}>
        <Text style={styles.title}>Your Plan</Text>

        {/* 🔥 AUTO GENERATE */}
        <BlurView intensity={30} tint="light" style={styles.card}>
          <Text style={styles.section}>Smart Plan</Text>
          <Text style={styles.desc}>
            Generate goals based on your body and goal
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={autoGenerate}>
            <Text style={styles.primaryText}>Auto Generate</Text>
          </TouchableOpacity>
        </BlurView>

        {/* 🔥 INPUTS */}
        <BlurView intensity={40} tint="light" style={styles.card}>
          <Text style={styles.section}>Customize</Text>

          <Input label="Calories" value={goals.calorie_goal}
            onChange={(t: string) => setGoals({ ...goals, calorie_goal: t })} />

          <Input label="Protein (g)" value={goals.protein_goal}
            onChange={(t: string) => setGoals({ ...goals, protein_goal: t })} />

          <Input label="Carbs (g)" value={goals.carb_goal}
            onChange={(t: string) => setGoals({ ...goals, carb_goal: t })} />

          <Input label="Fat (g)" value={goals.fat_goal}
            onChange={(t: string) => setGoals({ ...goals, fat_goal: t })} />

          <TouchableOpacity style={styles.primaryBtn} onPress={saveGoals}>
            <Text style={styles.primaryText}>Save Plan</Text>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </ScrollView>
  );
}

/* 🔥 INPUT */
const Input = ({ label, value, onChange }: any) => (
  <View style={styles.inputWrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      keyboardType="numeric"
    />
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 16 },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16
  },

  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden'
  },

  section: {
    fontWeight: '600',
    marginBottom: 6
  },

  desc: {
    color: '#666',
    marginBottom: 10
  },

  inputWrap: {
    marginBottom: 10
  },

  label: {
    fontSize: 13,
    color: '#777'
  },

  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 4
  },

  primaryBtn: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },

  primaryText: {
    color: '#fff',
    fontWeight: '600'
  }
});
