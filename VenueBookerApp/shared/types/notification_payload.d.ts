import type { NotificationDto } from "./notification";
export type NotificationListItem = NotificationDto & {
    venueName: string;
    eventName: string;
};

export type NotificationsPayload = {
    notifications: NotificationListItem[];
};

export type NotificationPayload = {
    notification: Notification;
};
