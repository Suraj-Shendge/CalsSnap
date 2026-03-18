import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Skeleton({ width = '100%', height = 20, style }: any) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true
      })
    ).start();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200]
  });

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Animated.View style={{ ...StyleSheet.absoluteFillObject, transform: [{ translateX }] }}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    borderRadius: 12
  },
  gradient: {
    flex: 1
  }
});
