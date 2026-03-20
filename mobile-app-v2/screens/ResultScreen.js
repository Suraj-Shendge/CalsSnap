import { View, Text } from "react-native";

export default function ResultScreen({ route }) {
  const data = route?.params?.data;

  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No data received</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>

      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 20 }}>
        {data.total_calories || 0} kcal
      </Text>

      {data.items?.map((item, i) => (
        <Text key={i} style={{ marginBottom: 5 }}>
          {item.name} - {item.calories} kcal
        </Text>
      ))}

    </View>
  );
}