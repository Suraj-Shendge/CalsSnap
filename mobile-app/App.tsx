import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './services/supabase';
import AuthStack from './navigation/AuthStack';
import RootNavigator from './navigation/RootStack';
import { StripeProvider } from '@stripe/stripe-react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

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
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Get session error:', error);
      }
      console.log('Initial session check:', data.session?.user?.id);
      setSession(data.session);
      setLoading(false);
    }).catch(error => {
      console.error('Session check failed:', error);
      setLoading(false); // Ensure loading is false even on error
    });

    return () => {
      listener?.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
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
                {() => <RootNavigator setIsGuest={setIsGuest} />}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="Auth">
                {() => <AuthStack setIsGuest={setIsGuest} />}
              </Stack.Screen>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
