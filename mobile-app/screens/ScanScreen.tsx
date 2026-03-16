
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { scanFood } from '../services/api';
import { useNavigation } from '@react-navigation/native';

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const camRef = useRef<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const capture = async () => {
    if (!camRef.current) return;
    setLoading(true);
    try {
      const photo = await camRef.current.takePictureAsync({ quality: 0.7 });
      const result = await scanFood(photo.uri);
      navigation.navigate('Result', { scanResult: result });
    } catch (e: any) {
      console.error(e);
      Alert.alert('Scan error', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>No camera permission.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer?.()}>
          <MaterialIcons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Scanner</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Camera preview */}
      <Camera style={styles.camera} ref={ref => (camRef.current = ref)} />

      {/* Scan frame overlay */}
      <View style={styles.overlay}>
        <View style={styles.frame} />
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert('Barcode scanner not implemented')}
        >
          <MaterialIcons name="qr-code-scanner" size={28} color="#fff" />
          <Text style={styles.actionText}>Barcode</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureBtn} onPress={capture} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <MaterialIcons name="camera" size={32} color="#fff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert('Library picker not implemented')}
        >
          <MaterialIcons name="photo-library" size={28} color="#fff" />
          <Text style={styles.actionText}>Library</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    height: 50,
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12
  },
  title: { color: '#fff', fontSize: 18 },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
  frame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12
  },
  bottomBar: {
    height: 100,
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20
  },
  actionBtn: { alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 12, marginTop: 4 },
  captureBtn: {
    backgroundColor: '#ff1744',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
