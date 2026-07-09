export declare const NotificationType : {
    readonly APPROVED: "APPLICATION_APPROVED",
    readonly REJECTED: "APPLICATION_REJECTED",
};

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export type NotificationDto = {
    id: number;
    date: string;
    time: string;
    type: NotificationType;
    message: string;
    read: boolean;
    userId: number;
    applicationId: number;
    createdAt? : string
    updatedAt? : string
};
