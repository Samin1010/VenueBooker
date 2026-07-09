import { AppDataSource } from "../data-source";
import { Notification } from "../entity/Notification";
import { Request, Response } from "express";
import { User } from "../entity/User";
import { sendError, sendSuccess } from "../types/responses";
import type { ApiResponse } from "@shared/types";
import type { NotificationsPayload } from "@shared/types/notification_payload";
export class NotificationController {
    private notificationRepository = AppDataSource.getRepository(Notification);
    private userRepository = AppDataSource.getRepository(User);
    async getNotifications(req: Request, res: Response<ApiResponse<NotificationsPayload>>) {
        try {
            const userId = req.params.userId;
            const user: User | null = await this.userRepository.findOne({
                where: {
                    id: Number(userId)
                }
            });
            if (!user) {
                return sendError(res, 404, "NOT_FOUND", "The user is not found");
            }
            const notifications = await this.notificationRepository
                .createQueryBuilder("notification")
                .leftJoinAndSelect("notification.application", "application")
                .leftJoinAndSelect("application.venue", "venue")
                .where("notification.userid = :userId", { userId: Number(userId) })
                .getMany();
            const notificationStructs = notifications.map((elem) => {
                const { application, ...notification } = elem;
                const { venue, ...applicationData } = application;
                return {
                    ...notification,
                    venueName: venue.name,
                    eventName: applicationData.eventName
                };
            });
            return sendSuccess(res, {
                notifications: notificationStructs
            }, "The notifications are successfully retreived");
        }
        catch (error: unknown) {
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }
    async updateReadStatusNotification(req: Request, res: Response) {
        try {
            const { userId } = req.body;
            const notificationId = req.params.notificationId;
            const notification: Notification | null = await this.notificationRepository.findOne({
                where: {
                    id: Number(notificationId)
                }
            });
            if (!notification) {
                return sendError(res, 404, "NOT_FOUND", "Notification does not exists with this id");
            }
            if (notification.userId !== Number(userId)) {
                return sendError(res, 400, "BAD_REQUEST", "Other users should not update the read status of notifications of other users");
            }
            notification.read = true;
            await this.notificationRepository.save(notification);
            return sendSuccess(res, {
                notification
            }, "Successfully updated the read status of the notification");
        }
        catch (error: unknown) {
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }
}
