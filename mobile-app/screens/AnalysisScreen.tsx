
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AnalysisScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Analysis (Premium)</Text>
      <Text>Advanced analytics will appear here once you subscribe.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 12 }
});
