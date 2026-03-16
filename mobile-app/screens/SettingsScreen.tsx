
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { MaterialIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    height: '',
    weight: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      const { data, error } = await supabase.from('Users').select('*').eq('id', user.id).single();
      if (!error && data) {
        setProfile({
          name: data.name ?? '',
          age: data.age?.toString() ?? '',
          height: data.height?.toString() ?? '',
          weight: data.weight?.toString() ?? ''
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const saveProfile = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const payload = {
      id: user.id,
      name: profile.name,
      age: Number(profile.age) || null,
      height: Number(profile.height) || null,
      weight: Number(profile.weight) || null
    };
    const { error } = await supabase.from('Users').upsert(payload, { onConflict: 'id' });
    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Saved', 'Profile updated');
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.row}>
        <MaterialIcons name="person" size={24} color="#6200ee" />
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={profile.name}
          onChangeText={t => setProfile({ ...profile, name: t })}
        />
      </View>

      <View style={styles.row}>
        <MaterialIcons name="calendar-today" size={24} color="#03a9f4" />
        <TextInput
          placeholder="Age"
          keyboardType="numeric"
          style={styles.input}
          value={profile.age}
          onChangeText={t => setProfile({ ...profile, age: t })}
        />
      </View>

      <View style={styles.row}>
        <MaterialIcons name="height" size={24} color="#4caf50" />
        <TextInput
          placeholder="Height (cm)"
          keyboardType="numeric"
          style={styles.input}
          value={profile.height}
          onChangeText={t => setProfile({ ...profile, height: t })}
        />
      </View>

      <View style={styles.row}>
        <MaterialIcons name="monitor-weight" size={24} color="#ff9800" />
        <TextInput
          placeholder="Weight (kg)"
          keyboardType="numeric"
          style={styles.input}
          value={profile.weight}
          onChangeText={t => setProfile({ ...profile, weight: t })}
        />
      </View>

      <Button title="Save Profile" onPress={saveProfile} />
      <View style={{ height: 12 }} />
      <Button title="Delete Account" color="#d32f2f" onPress={() => Alert.alert('Not implemented', 'Account deletion flow missing.')} />
      <View style={{ height: 12 }} />
      <Button title="Logout" onPress={logout} />
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
