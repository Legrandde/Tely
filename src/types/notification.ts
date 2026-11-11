export interface AppNotification {
  id: number;
  user_id: number | null;
  role_target: string | null;
  titre: string;
  message: string;
  type: "candidature" | "exercice" | "sujet" | "ressource" | "securite" | "systeme" | string;
  lien: string | null;
  read_at: string | null;
  is_read: boolean;
  time_ago: string;
  created_at: string;
}

export interface NotificationResponse {
  status: string;
  unread_count: number;
  notifications: AppNotification[];
}
