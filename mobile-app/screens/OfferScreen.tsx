
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function OfferScreen() {
  const startTrial = () => {
    Alert.alert('Offer', 'Stripe flow not implemented – demo only.');
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>80% Discount – Limited Time!</Text>
      <Text style={styles.price}>$11.66 / month</Text>
      <TouchableOpacity style={styles.ctaBtn} onPress={startTrial}>
        <Text style={styles.ctaText}>Start free trial</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  price: { fontSize: 22, marginBottom: 20, color: '#6200ee' },
  ctaBtn: {
    backgroundColor: '#ff1744',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30
  },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});
