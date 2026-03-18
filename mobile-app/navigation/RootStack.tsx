import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import ResultScreen from '../screens/ResultScreen';
import PaywallScreen from '../screens/PaywallScreen';
import OfferScreen from '../screens/OfferScreen';

export type RootStackParamList = {
  Main: undefined;
  Result: { scanResult: any };
  Paywall: undefined;
  Offer: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
        gestureEnabled: true,
        fullScreenGestureEnabled: true
      }}
    >
      <Stack.Screen name="Main" component={BottomTabs} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="Offer" component={OfferScreen} />
    </Stack.Navigator>
  );
}
