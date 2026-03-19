import { View, Text, TouchableOpacity } from "react-native";

export default function BottomSheet({ visible, onClose, navigation }) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 250,
        backgroundColor: "#fff",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <View
          style={{
            width: 40,
            height: 5,
            backgroundColor: "#ccc",
            borderRadius: 10,
          }}
        />
      </View>

      <TouchableOpacity
        onPress={() => {
          onClose();
          navigation.navigate("Camera");
        }}
        style={{ padding: 15 }}
      >
        <Text style={{ fontSize: 16 }}>📸 Scan Food</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          onClose();
          navigation.navigate("AddFood");
        }}
        style={{ padding: 15 }}
      >
        <Text style={{ fontSize: 16 }}>⌨️ Type Food</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose} style={{ padding: 15 }}>
        <Text style={{ fontSize: 16, color: "red" }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}
