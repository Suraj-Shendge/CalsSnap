
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PlanScreen from '../screens/PlanScreen';
import ScanScreen from '../screens/ScanScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { MaterialIcons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

export type BottomTabParamList = {
  Home: undefined;
  Plan: undefined;
  Scan: undefined;
  Analysis: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 60,
          borderTopWidth: 0,
          elevation: 5
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
            Home: 'home',
            Plan: 'event-note',
            Scan: 'camera',
            Analysis: 'assessment',
            Settings: 'settings'
          };
          const name = icons[route.name];
          if (route.name === 'Scan') {
            return (
              <View style={styles.scanButton}>
                <MaterialIcons name={name} size={30} color="#fff" />
              </View>
            );
          }
          return <MaterialIcons name={name} size={28} color={focused ? '#6200ee' : '#777'} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Plan" component={PlanScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    backgroundColor: '#6200ee',
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    elevation: 5
  }
});
