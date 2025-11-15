export type NotificationType = "success" | "info" | "warning" | "error";

export interface NotProps {
  type: NotificationType;
  message?: string;
  description?: string;
}
