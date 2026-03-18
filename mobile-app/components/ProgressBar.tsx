// Replace mobile-app/components/ProgressBar.tsx with this clean version
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

type NutrientRing = {
  name: string;
  progress: number; // 0-1
  color: string;
  currentValue?: number;
  goal?: number;
};

type MultiRingProgressProps = {
  nutrients: NutrientRing[];
  size?: number;
  strokeWidth?: number;
};

export default function MultiRingProgress({ 
  nutrients, 
  size = 180, 
  strokeWidth = 10 
}: MultiRingProgressProps) {
  const animatedValues = useRef(nutrients.map(() => ({ current: 0, target: 0 })));
  const animationRefs = useRef<number[]>([]);

  // Update target values when props change
  useEffect(() => {
    nutrients.forEach((nutrient, index) => {
      animatedValues.current[index].target = Math.min(Math.max(nutrient.progress, 0), 1);
    });
  }, [nutrients]);

  // Animate each ring
  useEffect(() => {
    const animate = (index: number) => {
      const current = animatedValues.current[index].current;
      const target = animatedValues.current[index].target;
      
      if (Math.abs(current - target) > 0.001) {
        animatedValues.current[index].current = current + (target - current) * 0.1;
        animationRefs.current[index] = requestAnimationFrame(() => animate(index));
      } else {
        animatedValues.current[index].current = target;
      }
    };

    nutrients.forEach((_, index) => {
      if (animationRefs.current[index]) {
        cancelAnimationFrame(animationRefs.current[index]);
      }
      animate(index);
    });

    return () => {
      animationRefs.current.forEach(id => {
        if (id) cancelAnimationFrame(id);
      });
    };
  }, [nutrients]);

  const radius = (size - strokeWidth * nutrients.length) / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circles and progress rings */}
          {nutrients.map((nutrient, index) => {
            const ringRadius = radius - (index * strokeWidth * 1.8);
            const circumference = ringRadius * 2 * Math.PI;
            const progress = animatedValues.current[index].current;
            const strokeDashoffset = circumference * (1 - progress);
            
            return (
              <G key={nutrient.name}>
                {/* Background ring */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={ringRadius}
                  stroke="#f0f0f0"
                  strokeWidth={strokeWidth * 0.5}
                  fill="none"
                />
                {/* Progress ring */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={ringRadius}
                  stroke={nutrient.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  fill="none"
                />
              </G>
            );
          })}
        </G>
      </Svg>
      
      {/* Center display */}
      {nutrients.length > 0 && (
        <View style={styles.centerContent}>
          <Text style={styles.centerValue}>
            {Math.round(nutrients[0].currentValue || 0)}
          </Text>
          <Text style={styles.centerLabel}>
            {nutrients[0].name}
          </Text>
          {nutrients[0].goal && (
            <Text style={styles.centerSub}>
              of {Math.round(nutrients[0].goal)} goal
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  centerLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  centerSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
