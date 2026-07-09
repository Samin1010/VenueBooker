import express from "express"
import { NotificationController } from "../controller/notification.controller";

const router = express.Router();
const notificationController = new NotificationController();

router.put("/:notificationId",notificationController.updateReadStatusNotification.bind(notificationController));
router.get("/:userId",notificationController.getNotifications.bind(notificationController));

export default router;
