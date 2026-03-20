import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { useState } from "react";
import axios from "axios";

const API_URL = "https://bite-ai-backend.onrender.com";

export default function AddFoodScreen({ navigation }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    try {
      setLoading(true);

      console.log("Calling API:", `${API_URL}/api/analyzeFood`);

      const response = await axios.post(
        `${API_URL}/api/analyzeFood`,
        {
          text: text,
        }
      );

      console.log("API RESPONSE:", response.data);

      // Navigate to result screen
      navigation.navigate("Result", {
        data: response.data,
      });

    } catch (error) {
      console.log(
        "API ERROR:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "600",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Bite AI
      </Text>

      <TextInput
        placeholder="What did you eat?"
        value={text}
        onChangeText={setText}
        style={{
          backgroundColor: "#f2f2f2",
          padding: 15,
          borderRadius: 12,
          marginBottom: 20,
          fontSize: 16,
        }}
      />

      <TouchableOpacity
        onPress={handleAnalyze}
        style={{
          backgroundColor: "#000",
          padding: 15,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>
          {loading ? "Analyzing..." : "Analyze"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
