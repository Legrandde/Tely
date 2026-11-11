import api from "../api/axio";
import type { NotificationResponse } from "../types/notification";

export async function fetchNotifications(): Promise<NotificationResponse> {
  const res = await api.get<NotificationResponse>("/api/notifications");
  return res.data;
}

export async function markNotificationAsRead(id: number): Promise<void> {
  await api.post(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.post("/api/notifications/read-all");
}
