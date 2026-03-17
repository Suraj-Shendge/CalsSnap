import React from 'react';
import { Pressable } from 'react-native';

// 🔥 OPTIONAL: enable haptics
// import * as Haptics from 'expo-haptics';

export default function InteractiveButton({ children, onPress, style }: any) {
  return (
    <Pressable
      onPress={() => {
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [
        style,
        { transform: [{ scale: pressed ? 0.96 : 1 }] }
      ]}
    >
      {children}
    </Pressable>
  );
}
