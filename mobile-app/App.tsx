// Complete replacement for mobile-app/App.tsx
import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, AppState } from 'react-native';
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

  // Check existing session on app start
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // First check local storage
        const storedSession = await AsyncStorage.getItem('user_session');
        if (storedSession) {
          const { userId, expiresAt } = JSON.parse(storedSession);
          if (expiresAt > Date.now()) {
            // Session still valid, check with Supabase
            const { data: { user }, error } = await supabase.auth.getUser();
            if (!error && user?.id === userId) {
              const { data } = await supabase.auth.getSession();
              if (data.session) {
                setSession(data.session);
                setLoading(false);
                return;
              }
            }
          }
        }

        // No valid stored session, check with Supabase directly
        const { data, error } = await supabase.auth.getSession();
        if (!error && data.session) {
          setSession(data.session);
          // Store session info
          await AsyncStorage.setItem('user_session', JSON.stringify({
            userId: data.session.user.id,
            expiresAt: data.session.expires_at * 1000
          }));
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // Handle auth state changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      console.log('Auth state changed:', _event);
      setSession(sess);
      
      // Store session info for persistence
      if (sess) {
        AsyncStorage.setItem('user_session', JSON.stringify({
          userId: sess.user.id,
          expiresAt: sess.expires_at * 1000
        }));
      } else {
        AsyncStorage.removeItem('user_session');
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

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
