import { View, Text } from "react-native";

export default function FoodCard({ name, calories }) {
  return (
    <View
      style={{
        backgroundColor: "#F7F7F7",
        padding: 16,
        borderRadius: 18,
        marginBottom: 10,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "500" }}>{name}</Text>
      <Text style={{ color: "#777" }}>{calories} kcal</Text>
    </View>
  );
}
