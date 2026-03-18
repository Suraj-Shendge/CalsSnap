import React from 'react';
import { View, StyleSheet } from 'react-native';

type Props = {
  progress: number; // 0-1
  color?: string;
  height?: number;
};

export default function ProgressBar({ progress, color = '#FF6A3D', height = 8 }: Props) {
  const filled = Math.min(Math.max(progress, 0), 1);
  return (
    <View style={[styles.container, { height, backgroundColor: '#e0e0e0' }]}>
      <View style={{ flex: filled, backgroundColor: color }} />
      <View style={{ flex: 1 - filled }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row'
  }
});
