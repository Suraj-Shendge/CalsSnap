import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function AnimatedCalorieRing({ consumed = 0, goal = 2000 }) {
  const radius = 90;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(consumed / goal, { duration: 800 });
  }, [consumed]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Svg width={220} height={220}>
        <Circle
          cx="110"
          cy="110"
          r={radius}
          stroke="#EAEAEA"
          strokeWidth={strokeWidth}
          fill="none"
        />

        <AnimatedCircle
          cx="110"
          cy="110"
          r={radius}
          stroke="#000"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin="110,110"
        />
      </Svg>

      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "600" }}>
          {consumed}
        </Text>
        <Text style={{ color: "#777" }}>of {goal} kcal</Text>
      </View>
    </View>
  );
}
