import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { useState } from "react";
import axios from "axios";

export default function AddFoodScreen({ navigation }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ IMPORTANT: correct backend URL
  const API_URL = "https://bite-ai-backend.onrender.com";

  const analyze = async () => {
    try {
      setLoading(true);

      console.log("CALLING API...");

      const response = await axios.post(
        `${API_URL}/api/analyzeFood`,
        {
          text: text
        }
      );

      console.log("RESPONSE:", response.data);

      navigation.navigate("Result", { data: response.data });

    } catch (error) {
      console.log(
        "ERROR:",
        error.response?.status,
        error.response?.data,
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      
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
