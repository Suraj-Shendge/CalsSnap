import { View, Text } from "react-native";

export default function CalorieRing({ consumed = 0, goal = 2000 }) {
  const percentage = Math.min((consumed / goal) * 100, 100);

  return (
    <View
      style={{
        height: 220,
        width: 220,
        borderRadius: 110,
        backgroundColor: "#F2F2F2",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "600" }}>
        {consumed}
      </Text>
      <Text style={{ color: "#888" }}>of {goal} kcal</Text>
      <View
        style={{
          position: "absolute",
          height: 220,
          width: 220,
          borderRadius: 110,
          borderWidth: 10,
          borderColor: "black",
          opacity: percentage / 100,
        }}
      />
    </View>
  );
}
