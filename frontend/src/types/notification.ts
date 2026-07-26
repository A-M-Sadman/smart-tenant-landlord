export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
  rent_reminders: boolean;
  maintenance_updates: boolean;
  complaint_updates: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferenceUpdate {
  email_notifications?: boolean;
  in_app_notifications?: boolean;
  rent_reminders?: boolean;
  maintenance_updates?: boolean;
  complaint_updates?: boolean;
}

export interface NotificationSend {
  user_id: string;
  type?: string;
  title: string;
  message: string;
  related_entity_type?: string | null;
}