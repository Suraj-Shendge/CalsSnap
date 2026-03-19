import { View, Text, TouchableOpacity } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24 }}>Bite AI</Text>

      <TouchableOpacity onPress={() => navigation.navigate("AddFood")}>
        <Text>Add Food</Text>
      </TouchableOpacity>
    </View>
  );
}