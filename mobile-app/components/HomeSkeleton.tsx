import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';

export default function HomeSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton height={30} width={120} style={{ marginBottom: 16 }} />

      <Skeleton height={120} style={{ marginBottom: 12 }} />

      <View style={styles.row}>
        <Skeleton height={80} width="32%" />
        <Skeleton height={80} width="32%" />
        <Skeleton height={80} width="32%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' }
});
