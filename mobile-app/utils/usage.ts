import AsyncStorage from '@react-native-async-storage/async-storage';

const FREE_LIMIT = 3;

export const getUsage = async () => {
  const count = await AsyncStorage.getItem('scan_count');
  return count ? parseInt(count) : 0;
};

export const incrementUsage = async () => {
  const count = await getUsage();
  await AsyncStorage.setItem('scan_count', (count + 1).toString());
};

export const canUseFeature = async () => {
  const count = await getUsage();
  return count < FREE_LIMIT;
};

export const resetUsage = async () => {
  await AsyncStorage.removeItem('scan_count');
};
