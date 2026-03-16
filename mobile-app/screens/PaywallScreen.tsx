
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function PaywallScreen() {
  const startTrial = () => {
    Alert.alert('Paywall', 'Stripe integration not wired – demo only.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Start your 7‑day free trial</Text>

      {/* Benefits */}
      <View style={styles.benefits}>
        <View style={styles.benefitRow}>
          <MaterialIcons name="check" size={20} color="#4caf50" />
          <Text style={styles.benefitText}>Unlimited food scanning</Text>
        </View>
        <View style={styles.benefitRow}>
          <MaterialIcons name="check" size={20} color="#4caf50" />
          <Text style={styles.benefitText}>Advanced diet analytics</Text>
        </View>
        <View style={styles.benefitRow}>
          <MaterialIcons name="check" size={20} color="#4caf50" />
          <Text style={styles.benefitText}>AI health score insights</Text>
        </View>
      </View>

      {/* Plans */}
      <View style={styles.plans}>
        <TouchableOpacity style={styles.planCard}>
          <Text style={styles.planTitle}>Monthly</Text>
          <Text style={styles.planPrice}>$4.99 / month</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.planCard}>
          <Text style={styles.planTitle}>Yearly</Text>
          <Text style={styles.planPrice}>$29.99 / year</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.ctaBtn} onPress={startTrial}>
        <Text style={styles.ctaText}>Start Free Trial</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  benefits: { width: '100%', marginBottom: 30 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  benefitText: { marginLeft: 8, fontSize: 16 },
  plans: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 30 },
  planCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 0.45
  },
  planTitle: { fontSize: 18, fontWeight: '500' },
  planPrice: { marginTop: 8, fontSize: 16, color: '#6200ee' },
  ctaBtn: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30
  },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});
