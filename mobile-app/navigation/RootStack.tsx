import HistoryScreen from '../screens/HistoryScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import ResultScreen from '../screens/ResultScreen';
import PaywallScreen from '../screens/PaywallScreen';
import OfferScreen from '../screens/OfferScreen';
import HomeScreen from '../screens/HomeScreen';


export type RootStackParamList = {
  Main: undefined;
  Result: { scanResult: any };
  Paywall: undefined;
  Offer: undefined;
};

const Stack = createNativeStackNavigator();

export default function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,

        animation: 'slide_from_right',

        // 🔥 THIS is what makes it feel iOS-level smooth
        animationDuration: 250,

        gestureEnabled: true,
        fullScreenGestureEnabled: true
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}
