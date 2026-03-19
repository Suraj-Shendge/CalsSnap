import { View, Text } from "react-native";

export default function ResultScreen({ route }) {
  const { data } = route.params;

  return (
    <View style={{ flex: 1, padding: 20 }}>

      <Text style={{ fontSize: 28, fontWeight: "700" }}>
        {data?.total_calories || 0} kcal
      </Text>

      {data?.items?.map((item, i) => (
        <Text key={i}>
          {item.name} - {item.calories} kcal
        </Text>
      ))}

    </View>
  );
}