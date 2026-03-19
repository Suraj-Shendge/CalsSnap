import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, PanGestureHandler, useAnimatedGestureHandler } from "react-native-reanimated";

const { height } = Dimensions.get("window");

export default function AnimatedBottomSheet({ visible, onClose, navigation }) {
  const translateY = useSharedValue(height);

  if (visible) {
    translateY.value = withSpring(0);
  }

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      if (translateY.value > 150) {
        translateY.value = withSpring(height);
        onClose();
      } else {
        translateY.value = withSpring(0);
      }
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 300,
            backgroundColor: "#fff",
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            padding: 20,
          },
          animatedStyle
        ]}
      >
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <View style={{ width: 40, height: 5, backgroundColor: "#ccc", borderRadius: 10 }} />
        </View>

        <TouchableOpacity
          onPress={() => {
            onClose();
            navigation.navigate("Camera");
          }}
          style={{ padding: 15 }}
        >
          <Text style={{ fontSize: 18 }}>Scan Food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            onClose();
            navigation.navigate("AddFood");
          }}
          style={{ padding: 15 }}
        >
          <Text style={{ fontSize: 18 }}>Type Food</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={{ padding: 15 }}>
          <Text style={{ fontSize: 18, color: "red" }}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}
