import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabase';
import COLORS from '../theme/colors';

export default function PlanScreen() {
  const [goals, setGoals] = useState<any>({});

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Plan</Text>

      {['calorie_goal', 'protein_goal', 'carb_goal', 'fat_goal'].map((k) => (
        <TextInput
          key={k}
          placeholder={k}
          style={styles.input}
          value={goals[k]}
          onChangeText={(t) => setGoals({ ...goals, [k]: t })}
        />
      ))}

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },

  title: { fontSize: 26, fontWeight: '700', marginBottom: 16 },

  input: {
    backgroundColor: COLORS.glass,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10
  },

  btn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center'
  },

  btnText: { color: '#fff', fontWeight: '600' }
});
