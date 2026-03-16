
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../services/supabase';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export default function AuthStack() {
  // We'll render simple login/register screens here
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Login error', error.message);
  };

  const register = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) Alert.alert('Register error', error.message);
    else Alert.alert('Success', 'Check your email for confirmation');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CalSnap {showRegister ? 'Register' : 'Login'}</Text>
      {showRegister && (
        <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      )}
      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title={showRegister ? 'Register' : 'Login'} onPress={showRegister ? register : login} />
      <View style={{ height: 12 }} />
      <Button
        title={showRegister ? 'Back to login' : 'Create account'}
        onPress={() => setShowRegister(!showRegister)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12
  }
});
