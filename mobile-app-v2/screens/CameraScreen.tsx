import { View, Text, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

export default function CameraScreen({ navigation }) {
  const [image, setImage] = useState(null);

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      alert("Camera permission required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const img = result.assets[0];
      setImage(img.uri);

      // Send to backend
      const res = await axios.post("http://YOUR_IP:5000/analyze-image", {
        image: img.base64,
      });

      navigation.navigate("Result", { data: res.data });
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 200, height: 200, borderRadius: 20 }}
        />
      )}

      <TouchableOpacity
        onPress={openCamera}
        style={{
          marginTop: 20,
          backgroundColor: "#000",
          padding: 15,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#fff" }}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  );
}
