// Complete replacement for mobile-app/screens/ScanScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  StatusBar
} from 'react-native';
import { Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { scanFood } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { canUseFeature, incrementUsage } from '../utils/usage';
import COLORS from '../theme/colors';
import { supabase } from '../services/supabase';

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

    // Check feature usage for non-guest users
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const allowed = await canUseFeature();
      if (!allowed) {
        Alert.alert(
          "Limit reached",
          "You've used your free scans. Create an account to continue.",
          [
            {
              text: "Go to Paywall",
              onPress: () => navigation.navigate('Paywall')
            },
            { text: "Cancel", style: "cancel" }
          ]
        );
        return;
      }
    }

    setLoading(true);

    try {
      const photo = await camRef.current.takePictureAsync({ quality: 0.7 });

      // Increment usage BEFORE API (important)
      if (user) {
        await incrementUsage();
      }

      const result = await scanFood(photo.uri);
      navigation.navigate('Result', { scanResult: result });

    } catch (e: any) {
      console.error(e);
      Alert.alert('Scan error', e.message || 'Failed to scan food');
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>No camera permission granted.</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => Camera.requestCameraPermissionsAsync().then(({ status }) => {
            setHasPermission(status === 'granted');
          })}
        >
          <Text style={styles.retryText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Scanner</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Camera preview - FULL SCREEN */}
      <Camera 
        style={styles.camera} 
        ref={ref => (camRef.current = ref)}
        ratio="16:9"
      />

      {/* Scan frame overlay */}
      <View style={styles.overlay}>
        <View style={styles.frame} />
      </View>

      {/* Bottom actions - FULL WIDTH */}
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
            <MaterialIcons name="circle" size={60} color="#fff" />
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
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  
  topBar: {
    position: 'absolute',
    top: 80, // Below status bar
    left: 0,
    right: 0,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10
  },
  
  title: { 
    color: '#fff', 
    fontSize: 18,
    fontWeight: '600'
  },
  
  camera: { 
    flex: 1 
  },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5
  },
  
  frame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12
  },
  
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    zIndex: 10
  },
  
  actionBtn: { 
    alignItems: 'center' 
  },
  
  actionText: { 
    color: '#fff', 
    fontSize: 12, 
    marginTop: 4 
  },
  
  captureBtn: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#000'
  },
  
  retryButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8
  },
  
  retryText: {
    color: '#fff',
    fontSize: 16
  }
});
