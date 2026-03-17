import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { supabase } from '../services/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();

  const [profile, setProfile] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    goal: ''
  });

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const u = (await supabase.auth.getUser()).data.user;
    setUser(u);

    if (!u) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('Users')
      .select('*')
      .eq('id', u.id)
      .single();

    if (data) {
      setProfile({
        name: data.name ?? '',
        age: data.age?.toString() ?? '',
        height: data.height?.toString() ?? '',
        weight: data.weight?.toString() ?? '',
        goal: data.goal ?? ''
      });
    }

    setLoading(false);
  };

  const saveProfile = async () => {
    if (!user) {
      Alert.alert('Login required', 'Create an account to save your profile');
      return;
    }

    const payload = {
      id: user.id,
      name: profile.name,
      age: Number(profile.age) || null,
      height: Number(profile.height) || null,
      weight: Number(profile.weight) || null,
      goal: profile.goal
    };

    const { error } = await supabase
      .from('Users')
      .upsert(payload, { onConflict: 'id' });

    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Saved', 'Profile updated');
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const estimateCalories = () => {
    const weight = Number(profile.weight);
    const height = Number(profile.height);
    const age = Number(profile.age);

    if (!weight || !height || !age) return '—';

    // basic BMR (Mifflin St Jeor approx)
    let calories = 10 * weight + 6.25 * height - 5 * age + 5;

    if (profile.goal === 'lose') calories -= 300;
    if (profile.goal === 'gain') calories += 300;

    return Math.round(calories) + ' kcal/day';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* 🔥 ACCOUNT */}
      {!user ? (
        <View style={styles.card}>
          <Text style={styles.section}>Guest Mode</Text>
          <Text style={styles.desc}>
            You are using limited features
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.primaryText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.section}>Account</Text>

          <TouchableOpacity style={styles.secondaryBtn} onPress={logout}>
            <Text>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 🔥 PROFILE */}
      <View style={styles.card}>
        <Text style={styles.section}>Health Profile</Text>

        <Input icon="person" placeholder="Name" value={profile.name}
          onChange={(t) => setProfile({ ...profile, name: t })} />

        <Input icon="calendar-today" placeholder="Age" value={profile.age}
          onChange={(t) => setProfile({ ...profile, age: t })}
          keyboard="numeric" />

        <Input icon="height" placeholder="Height (cm)" value={profile.height}
          onChange={(t) => setProfile({ ...profile, height: t })}
          keyboard="numeric" />

        <Input icon="monitor-weight" placeholder="Weight (kg)" value={profile.weight}
          onChange={(t) => setProfile({ ...profile, weight: t })}
          keyboard="numeric" />

        {/* GOAL */}
        <Text style={styles.label}>Goal</Text>
        <View style={styles.goalRow}>
          {['lose', 'maintain', 'gain'].map(g => (
            <TouchableOpacity
              key={g}
              style={[
                styles.goalBtn,
                profile.goal === g && styles.goalActive
              ]}
              onPress={() => setProfile({ ...profile, goal: g })}
            >
              <Text style={profile.goal === g && { color: '#fff' }}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CALORIES */}
        <Text style={styles.calories}>
          Estimated: {estimateCalories()}
        </Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={saveProfile}>
          <Text style={styles.primaryText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      {/* 🔥 APP */}
      <View style={styles.card}>
        <Text style={styles.section}>App</Text>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() =>
            Alert.alert('Not implemented', 'Delete flow missing')
          }
        >
          <Text>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* 🔥 INPUT COMPONENT */
const Input = ({ icon, placeholder, value, onChange, keyboard }: any) => (
  <View style={styles.row}>
    <MaterialIcons name={icon} size={22} color="#6200ee" />
    <TextInput
      placeholder={placeholder}
      style={styles.input}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboard || 'default'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 16 },

  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20
  },

  card: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20
  },

  section: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10
  },

  desc: {
    color: '#666',
    marginBottom: 10
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },

  input: {
    flex: 1,
    marginLeft: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 4
  },

  label: {
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '500'
  },

  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },

  goalBtn: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    flex: 1,
    marginHorizontal: 3,
    alignItems: 'center'
  },

  goalActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee'
  },

  calories: {
    marginVertical: 10,
    fontWeight: '500'
  },

  primaryBtn: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },

  primaryText: {
    color: '#fff',
    fontWeight: '600'
  },

  secondaryBtn: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
