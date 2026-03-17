import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { BlurView } from 'expo-blur';
import { supabase } from '../services/supabase';
import { getStreak } from '../utils/streak';

export default function HistoryScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [grouped, setGrouped] = useState<any>({});
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('FoodEntries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setEntries(data || []);
    groupByDate(data || []);

    const s = await getStreak();
    setStreak(s);

    setLoading(false);
  };

  const groupByDate = (data: any[]) => {
    const groupedData: any = {};

    data.forEach(item => {
      const date = new Date(item.created_at).toDateString();

      if (!groupedData[date]) groupedData[date] = [];

      groupedData[date].push(item);
    });

    setGrouped(groupedData);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>History</Text>

      {/* 🔥 STREAK */}
      <BlurView intensity={40} tint="light" style={styles.streakCard}>
        <Text style={styles.streakNumber}>{streak} 🔥</Text>
        <Text style={styles.streakText}>Day streak</Text>
      </BlurView>

      {/* 🔥 ENTRIES */}
      {Object.keys(grouped).length === 0 ? (
        <Text style={styles.empty}>No entries yet</Text>
      ) : (
        Object.keys(grouped).map(date => (
          <View key={date} style={styles.dayBlock}>
            <Text style={styles.date}>{date}</Text>

            {grouped[date].map((item: any) => (
              <BlurView key={item.id} intensity={25} tint="light" style={styles.entry}>
                <Text style={styles.food}>{item.food_name}</Text>
                <Text style={styles.cal}>{item.calories.toFixed(0)} kcal</Text>
              </BlurView>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12
  },

  streakCard: {
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16
  },

  streakNumber: {
    fontSize: 32,
    fontWeight: '700'
  },

  streakText: {
    color: '#666'
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777'
  },

  dayBlock: {
    marginBottom: 16
  },

  date: {
    fontWeight: '600',
    marginBottom: 6
  },

  entry: {
    borderRadius: 14,
    padding: 10,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  food: {
    fontWeight: '500'
  },

  cal: {
    color: '#555'
  }
});
