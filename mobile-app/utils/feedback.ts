// 🔥 OPTIONAL: enable haptics
import * as Haptics from 'expo-haptics';

export async function successFeedback() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function errorFeedback() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
