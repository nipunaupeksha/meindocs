import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestReminderPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'MeinDocs reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return requested.granted;
}

function reminderDate(value: string) {
  const date = new Date(`${value}T09:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// fallow-ignore-next-line complexity
export async function scheduleReminderNotification(input: {
  title: string;
  dueDate: string;
  expiryDate?: string;
}) {
  const date = reminderDate(input.dueDate);
  if (!date || date.getTime() <= Date.now()) return null;
  if (!(await requestReminderPermissions())) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'MeinDocs reminder',
      body: input.expiryDate
        ? `${input.title} · due ${input.dueDate}, expires ${input.expiryDate}`
        : input.title,
      data: { type: 'reminder', dueDate: input.dueDate, expiryDate: input.expiryDate },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}

export async function cancelReminderNotification(notificationId?: string) {
  if (notificationId) await Notifications.cancelScheduledNotificationAsync(notificationId);
}
