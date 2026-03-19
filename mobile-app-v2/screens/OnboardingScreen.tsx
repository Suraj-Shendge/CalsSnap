import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [weight, setWeight] = useState("");

  const next = () => setStep(step + 1);

  if (step === 1) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "700" }}>Welcome to Bite AI</Text>
        <Text style={{ marginTop: 10, color: "#666" }}>
          Track calories with AI in seconds
        </Text>

        <TouchableOpacity onPress={next} style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 18 }}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "600" }}>Your Goal</Text>

        {["Lose Weight", "Gain Muscle", "Maintain"].map((g) => (
          <TouchableOpacity key={g} onPress={() => setGoal(g)} style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 18, color: goal === g ? "black" : "#888" }}>{g}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={next} style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 18 }}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 3) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "600" }}>Your Weight</Text>

        <TextInput
          placeholder="Enter weight (kg)"
          value={weight}
          onChangeText={setWeight}
          style={{ backgroundColor: "#F7F7F7", padding: 15, borderRadius: 15, marginTop: 20 }}
        />

        <TouchableOpacity onPress={next} style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 18 }}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 4) {
    const calories = goal === "Lose Weight" ? 1800 : goal === "Gain Muscle" ? 2500 : 2200;

    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: "700" }}>Your Plan</Text>
        <Text style={{ marginTop: 10 }}>{calories} kcal/day</Text>

        <TouchableOpacity
          onPress={() => navigation.replace("Home")}
          style={{ marginTop: 30 }}
        >
          <Text style={{ fontSize: 18 }}>Start Tracking</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
