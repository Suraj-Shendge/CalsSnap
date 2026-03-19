import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { useState } from "react";
import axios from "axios";

const API_URL = "https://bite-ai-backend.onrender.com";

export default function AddFoodScreen({ navigation }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/analyze`, {
        text: text,
        userId: "demo-user"
      });

      navigation.navigate("Result", { data: res.data });

    } catch (err) {
      console.log("API ERROR:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>

      <TextInput
        placeholder="What did you eat?"
        value={text}
        onChangeText={setText}
        style={{
          backgroundColor: "#eee",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20
        }}
      />

      <TouchableOpacity
        onPress={analyze}
        style={{
          backgroundColor: "#000",
          padding: 15,
          borderRadius: 10,
          alignItems: "center"
        }}
      >
        <Text style={{ color: "#fff" }}>
          {loading ? "Analyzing..." : "Analyze"}
        </Text>
      </TouchableOpacity>

    </View>
  );
}