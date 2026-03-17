import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import PlanScreen from '../screens/PlanScreen';
import ScanScreen from '../screens/ScanScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import SettingsScreen from '../screens/SettingsScreen';

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

        // 🔥 GLASS + FLOATING TAB BAR
        tabBarStyle: styles.tabBar,

        tabBarIcon: ({ focused }) => {
          const icons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
            Home: 'home',
            Plan: 'event-note',
            Scan: 'camera-alt',
            Analysis: 'insights',
            Settings: 'settings'
          };

          const iconName = icons[route.name];

          // 🔥 CENTER FLOATING BUTTON
          if (route.name === 'Scan') {
            return (
              <View style={styles.scanWrapper}>
                <View style={styles.scanShadow} />
                <View style={styles.scanButton}>
                  <MaterialIcons name={iconName} size={30} color="#fff" />
                </View>
              </View>
            );
          }

          return (
            <MaterialIcons
              name={iconName}
              size={26}
              color={focused ? '#FF6A3D' : '#999'}
            />
          );
        },

        // 🔥 PRESS EFFECT (feels premium)
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            activeOpacity={0.7}
            style={styles.tabButton}
          />
        )
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
  // 🔥 MAIN TAB BAR (iOS STYLE FLOATING)
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,

    height: 70,
    borderRadius: 25,

    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopWidth: 0,

    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
  },

  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // 🔥 SCAN BUTTON CONTAINER (creates notch illusion)
  scanWrapper: {
    position: 'absolute',
    top: -30,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // 🔥 SHADOW LAYER (depth)
  scanShadow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF6A3D',
    opacity: 0.25,
    transform: [{ scale: 1.2 }]
  },

  // 🔥 MAIN BUTTON
  scanButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,

    backgroundColor: '#FF6A3D',

    justifyContent: 'center',
    alignItems: 'center',

    elevation: 10,
    shadowColor: '#FF6A3D',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 10,
  }
});
