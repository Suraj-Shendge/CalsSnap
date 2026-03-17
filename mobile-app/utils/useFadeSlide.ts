import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export default function useFadeSlide() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  return {
    style: {
      opacity,
      transform: [{ translateY }]
    }
  };
}
