import { api } from "@/lib/api";
import {
  type Notification as StoreNotification,
} from "@/lib/store";

export type Notification = StoreNotification;

export const notificationsService = {
  list: async (): Promise<Notification[]> => {
    return api.get<Notification[]>("/notifications");
  },

  markRead: async (id: string): Promise<void> => {
    return api.post<void>(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    return api.post<void>("/notifications/read-all");
  },
};
