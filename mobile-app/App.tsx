import 'react-native-url-polyfill/auto';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet, AppState, Alert } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './services/supabase';
import AuthStack from './navigation/AuthStack';
import RootNavigator from './navigation/RootStack';
import { StripeProvider } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground, check session
        checkSession();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription?.remove();
    };
  }, [appState]);

  const checkSession = useCallback(async () => {
    try {
      const storedSession = await AsyncStorage.getItem('user_session');
      if (storedSession) {
        const { userId, expiresAt } = JSON.parse(storedSession);
        if (expiresAt > Date.now()) {
          // Session still valid
          const { data: { user }, error } = await supabase.auth.getUser();
          if (!error && user?.id === userId) {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setLoading(false);
            return;
          }
        }
      }

      // No valid session found, check with server
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session check error:', error);
        setLoading(false);
        return;
      }
      
      if (data.session) {
        setSession(data.session);
        
        // Store session info for persistence
        await AsyncStorage.setItem('user_session', JSON.stringify({
          userId: data.session.user.id,
          expiresAt: data.session.expires_at * 1000 // Convert to ms
        }));
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set timeout to prevent indefinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('App loading timeout - forcing load completion');
        setLoading(false);
      }
    }, 10000); // 10 seconds timeout

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      console.log('Auth state changed:', _event, sess?.user?.id);
      setSession(sess);
      
      // Store session info for persistence
      if (sess) {
        AsyncStorage.setItem('user_session', JSON.stringify({
          userId: sess.user.id,
          expiresAt: sess.expires_at * 1000 // Convert to ms
        }));
      } else {
        AsyncStorage.removeItem('user_session');
      }
      
      setLoading(false);
    });

    checkSession();

    return () => {
      listener?.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [checkSession]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6A3D" />
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PK ?? ''}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {session || isGuest ? (
              <Stack.Screen name="Main">
                {(props) => <RootNavigator {...props} setIsGuest={setIsGuest} />}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="Auth" options={{ animation: 'fade' }}>
                {(props) => <AuthStack {...props} setIsGuest={setIsGuest} />}
              </Stack.Screen>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F8F9FB'
  }
});
