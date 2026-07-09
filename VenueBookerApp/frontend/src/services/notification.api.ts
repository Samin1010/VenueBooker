import { api, emptyCollectionWithError, getApiError, type ApiResult } from "./api";
import {NotificationListItem,NotificationPayload,NotificationsPayload} from "@shared/types/notification_payload";


export class NotificationFetcherService {
    private notificationApi = api;

    // Gets all notifications for the given user.
    async getNotification(userId : number)
    {
        try
        {
            const response = await this.notificationApi.get<ApiResult<NotificationsPayload>>("/api/notification/" + userId.toString());
            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return [];
            }

            return apiResponse.data.notifications;
        }
        catch(error)
        {
            return emptyCollectionWithError<NotificationListItem>(error);
        }
    }

    // Marks a notification as read for the user.
    async updateReadStatus(userId : number,notificationId : number)
    {
        try
        {
            const response = await this.notificationApi.put<ApiResult<NotificationPayload>>("/api/notification/" + String(notificationId),{
                userId
            });

            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return false;
            }

            return true;
            
        }
        catch(error)
        {
            getApiError(error);
            return false;
        }
    }
}
