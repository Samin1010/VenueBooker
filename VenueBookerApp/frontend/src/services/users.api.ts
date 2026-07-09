import { HirerHistoryType } from "@/types/HirerHistoryType";
import { PreferenceType } from "@/types/PreferenceType";
import { UserDocument } from "@/types/UserDocument";
import { api, emptyCollectionWithError, getApiError, type ApiResult } from "./api";
import {
    UserDocumentPayload,
    UserDocumentsPayload,
    UserPayload,
    DeletePreferenceResult,
    RankCheckingPayload,
    PreferencesPayload,
    ApiPreference,
    VendorHistoryPayload,
    HirerHistoryPayload
} from "@shared/types/user_payload";


export class UserFetcherService {
    private  userApi = api;

    // Gets a single user by id.
    async getUser(userId : number)
    {
        try
        {
            const response = await this.userApi.get<ApiResult<UserPayload>>("/api/user/" + userId.toString());

            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return null
            }

            return apiResponse.data.user;
        }
        catch(error)
        {
            getApiError(error);
            return null;
        }
    }
    
    // Gets all uploaded documents for a user.
    async getUserDocuments(userId : number)
    {
        try
        {
            const response = await this.userApi.get<ApiResult<UserDocumentsPayload>>("/api/user/" + userId.toString() + "/documents");
            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return []
            }

            return apiResponse.data.documents;
        }
        catch(error)
        {
            return emptyCollectionWithError<UserDocument>(error);
        }
    }

    // Gets every saved venue preference for a user.
    async getAllPreference(userId : number): Promise<PreferenceType[]>
    {
        try
        {
            const response = await this.userApi.get<ApiResult<PreferencesPayload>>("/api/user/" + String(userId) + "/preference");

            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return []
            }

            return apiResponse.data.preferences;
        }
        catch(error)
        {
            return emptyCollectionWithError<PreferenceType>(error);
        }
    }

    // Updates the basic profile fields for a user.
    async updateUser(userId : number,first_name : string,last_name : string,email : string,username : string,phone : string)
    {
        try
        {
            const response = await this.userApi.patch<ApiResult<UserPayload>>("/api/user/" + String(userId) + "/change",{
                email,
                first_name,
                last_name,
                username,
                phone,
                userId,
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

    // Gets booking history for a vendor.
    async getVendorHistory(vendorId : number): Promise<HirerHistoryType[]>
    {
        try
        {
            const response = await this.userApi.get<ApiResult<VendorHistoryPayload>>("/api/user/" + "/history/vendor/" + String(vendorId));
            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return [];
            }

            return apiResponse.data.vendor_history;
        }
        catch(error : unknown)
        {
            return emptyCollectionWithError<HirerHistoryType>(error);
        }
    }

    // Gets booking history for a hirer.
    async getHirerHistory(hirerId : number): Promise<HirerHistoryType[]>
    {
        try
        {
            const response = await this.userApi.get<ApiResult<HirerHistoryPayload>>("/api/user/" + "/history/hirer/" + String(hirerId));
            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return [];
            }

            return apiResponse.data.hirer_history;
        }
        catch(error : unknown)
        {
            return emptyCollectionWithError<HirerHistoryType>(error);
        }
    }

    // Replaces an existing user document file.
    async updateUserDocumentFile(
        userId : number,
        document_id : number,
        document: Omit<UserDocument, "id" | "createdAt" | "updatedAt">
    )
    {
        try
        {
            const response = await this.userApi.put<ApiResult<UserDocumentPayload>>(
                "/api/user/" + userId.toString() + "/document/" + document_id.toString(),
                {
                    userId : userId,
                    file : document.data,
                    file_name: document.file_name,
                    file_extension_type: document.file_extension_type,
                    file_type: document.file_type
                }
            )

            const apiResponse = response.data;

            if (!apiResponse.success)
            {
                return null;
            }

            return apiResponse.data.document;
        }
        catch (error) 
        {
            getApiError(error);
            return null;
        }
    }

    // Uploads a new document file for a user.
    async uploadUserDocumentFile(
        userId: number,
        document: Omit<UserDocument, "id" | "createdAt" | "updatedAt">
    ) 
    {
        try 
        {
            const response = await this.userApi.post<ApiResult<UserDocumentPayload>>(
                "/api/user/" + userId.toString() + "/document",
                {
                    userId: userId,
                    file: document.data,
                    file_name: document.file_name,
                    file_extension_type: document.file_extension_type,
                    file_type: document.file_type
                }
            );

            const apiResponse = response.data;

            if (!apiResponse.success)
            {
                return null;
            }

            return apiResponse.data.document;
        } 
        catch (error) 
        {
            getApiError(error);
            return null;
        }
    }

    // Gets the user's preference record for one venue.
    async getPreferenceByVenue(userId : number,venueId : number) : Promise<PreferenceType | null>
    {
        try
        {
            const response = await this.userApi.get<ApiResult<ApiPreference>>("/api/user/" + String(userId) + "/preference/venue/" + String(venueId));

            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return null;
            }

            return apiResponse.data.preference;
        }
        catch (error: unknown) {
            getApiError(error);
            return null;
        }
    }

    // Checks whether a preference rank can be assigned to a venue.
    async canAssignNewRank(
        venueId: number,
        userId: number,
        newRank: number
    ): Promise<boolean> {
        try {
            const response = await this.userApi.get<ApiResult<RankCheckingPayload>>(
                `/api/user/${userId}/preferences/venue/${venueId}/can-assign-rank`,
                {
                    params: {
                        rank: newRank
                    }
                }
            );

            const apiResponse = response.data;

            if (!apiResponse.success) {
                return false;
            }

            return apiResponse.data.allowed;

        } catch (error: unknown) {
            getApiError(error);
            return false;
        }
    }

    // Adds a venue to the user's preference list.
    async addOnePreference(venueId : number,userId : number,pref_no : number): Promise<PreferenceType[]>
    {
        try
        {
            const response = await this.userApi.post<ApiResult<PreferencesPayload>>("/api/user/" + String(userId) + "/preference",{
                userId : userId,
                venueId : venueId,
                pref_no : pref_no
            });

            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return [];
            }

            return apiResponse.data.preferences;

        }
        catch(error : unknown)
        {
            getApiError(error);
            return [];
        }
    }

    // Updates the rank for an existing preference.
    async updatePreference(pref_id : number,pref_no : number,userId : number): Promise<PreferenceType[]>
    {
        try
        {
            const response = await this.userApi.put<ApiResult<PreferencesPayload>>("/api/user/" + String(pref_id),{
                pref_no,
                userId
            });

            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return [];
            }

            return apiResponse.data.preferences;
        }
        catch(error)
        {
            getApiError(error);
            return [];
        }
    }


    // Removes a preference and returns the updated list.
    async deleteOnePreference(
        pref_id: number,
        userId: number
    ): Promise<DeletePreferenceResult> {
        try {
            const response =
                await this.userApi.delete<ApiResult<PreferencesPayload>>(
                    "/api/user/" + pref_id.toString(),
                    { data: { userId } }
                );

            const apiResponse = response.data;

            if (!apiResponse.success) {
                return {
                    success: false,
                    message: apiResponse.message,
                };
            }

            return {
                success: true,
                preferences: apiResponse.data.preferences,
            };
        }
        catch (error) {
            const message = getApiError(error)?.message;

            return {
                success: false,
                message,
            };
        }
    }
}
