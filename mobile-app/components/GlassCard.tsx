import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import COLORS from '../theme/colors';

export default function GlassCard({ children, style }: any) {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={70} tint="light" style={styles.blur}>
        <View style={styles.overlay}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    overflow: 'hidden',

    // depth
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10
  },

  blur: {
    padding: 16
  },

  overlay: {
    backgroundColor: 'rgba(255,255,255,0.25)', // subtle glass tint
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    padding: 12
  }
});
