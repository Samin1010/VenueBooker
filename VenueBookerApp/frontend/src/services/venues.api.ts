import { VenueType } from "@/types/VenueType";
import {api, emptyCollectionWithError, getApiError, type ApiResult} from "./api"
import type { ApiError } from "@shared/types";
import { BookedTimeType } from "@/types/BookedTimeType";
import { Suitability } from "@/types/SuitabilityType";
import type {VenuePayload,VenuesPayload,BookedTimePayload,BookedTimesPayload,DeleteVenueResult,DeleteBlockTime, HirerOnlyVenuePayload, VenueAvailabilityPayload} from "@shared/types/venue_payload";
import type { BookedTimeDto } from "@shared/types";

type BookingResponse = {
    success : false,
    message : string
} | {
    success : true,
    bookedTime : BookedTimeDto
}   

export class VenueFetcherService {
    private VenueApi = api;

    // Gets venues using the provided filter values.
    async getAllVenues(name : string | undefined, location : string | undefined,price : number | undefined, capacity : number | undefined, suitability : Suitability | undefined) : Promise<{
        featured_venues : VenueType[],
        non_featured_venues : VenueType[],
        error?: ApiError,
    }> {
        try
        {
            const response = await this.VenueApi.get<ApiResult<HirerOnlyVenuePayload>>(
                "/api/venue/",
                {
                    params: {
                        name,
                        location,
                        price,
                        capacity,
                        suitability
                    }
                }
            );
            const apiResponse = response.data;

            if(!apiResponse.success){
                return {
                    featured_venues : [],
                    non_featured_venues : []
                }
            }

            return {
                featured_venues : apiResponse.data.featured_venues,
                non_featured_venues : apiResponse.data.non_featured_venues
            }
        }
        catch(error)
        {
            const apiError = getApiError(error) ?? {
                code: "UNKNOWN_ERROR",
                message: "Unable to load venues",
            };
            return {
                featured_venues : [],
                non_featured_venues : [],
                error: apiError,
            }
        }
    }

    // Gets one venue by id.
    async getOneVenue(venueId : number){
        try
        {
            const response = await this.VenueApi.get<ApiResult<VenuePayload>>("/api/venue/" + venueId.toString());
            const apiResponse = response.data;

            if(!apiResponse.success) {
                return null;
            }

            return apiResponse.data.venue;
        }
        catch(error)
        {
            getApiError(error);
            return null
        }
        
    }

    async getAvailability(venueId: number) {
        try {
            const response = await this.VenueApi.get<ApiResult<VenueAvailabilityPayload>>(
                `/api/venue/${venueId}/availability`,
            );

            if (!response.data.success) {
                return [];
            }

            return response.data.data.unavailableTimes;
        } catch (error) {
            return emptyCollectionWithError<Omit<BookedTimeType, "id" | "venueId">>(error);
        }
    }

    // Gets all venues owned by a vendor.
    async getAllVenuesForVendor(vendorId : number): Promise<VenueType[]>
    {
        try
        {
            const response = await this.VenueApi.get<ApiResult<VenuesPayload>>("/api/venue/vendor/" + vendorId.toString());
            const apiResponse = response.data;
            if(!apiResponse.success){
                return [];
            }

            return apiResponse.data.venues;
        }
        catch(error)
        {
            return emptyCollectionWithError<VenueType>(error);
        }
    }

    // Adds a new venue for a vendor.
    async addOneVenue(venue : Omit<VenueType,"id"| "rating" | "userId" | "num_ratings" | "bookedTimes" | "createdAt" | "updatedAt" | "discounted_percentage">,vendorId : number)
    {
        try
        {
            const response = await this.VenueApi.post<ApiResult<VenuePayload>>("/api/venue/",{...venue,userId :vendorId});
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

    // Updates an existing venue for a vendor.
    async updateOneVenue(venue : Omit<VenueType, "rating" | "vendor_id" | "bookedTimes">,vendorId : number)
    {
        try
        {
            const response = await this.VenueApi.put<ApiResult<VenuePayload>>("/api/venue/" + venue.id.toString(),{...venue,userId : vendorId});
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

    // Deletes a venue and returns the updated venue list.
    async deleteOneVenue(venueId: number): Promise<DeleteVenueResult> {
        try {
            const response =
                await this.VenueApi.delete<ApiResult<VenuesPayload>>(
                    "/api/venue/" + String(venueId)
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
                venues: apiResponse.data.venues,
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

    // Gets all blocked time slots for a venue.
    async getAllTimeSlots(venueId : number)
    {
        try
        {
            const response = await this.VenueApi.get<ApiResult<BookedTimesPayload>>("/api/venue/" + String(venueId) + "/timeslots");
            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return [];
            }

            return apiResponse.data.blockTimes;
        }
        catch(error)
        {
            return emptyCollectionWithError<BookedTimeType>(error);
        }
    }

    // Blocks a new time slot for a venue.
    async blockATimeSlot(timeSlot : Omit<BookedTimeType,"id">,venueId : number,userId : number) : Promise<BookingResponse>
    {
        try
        {
            const response = await this.VenueApi.post<ApiResult<BookedTimePayload>>("/api/venue/" + String(venueId) + "/addTimeBlock",{...timeSlot,userId});
            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return {
                    success : false,
                    message : apiResponse.message
                }
            }

            return {
                success : true,
                bookedTime: apiResponse.data.bookedTime
            }
        }
        catch(error)
        {
            const err = getApiError(error);
            return {
                success : false,
                message : err?.message || "Failed to book a time slot for the venue"
            }
        }
    }

    // Removes a blocked time slot.
    async unblockATimeSlot(venueId : number, timeslot_id : number, userId : number) : Promise<DeleteBlockTime>
    {
        try
        {
            const response = await this.VenueApi.delete<ApiResult<BookedTimesPayload>>(
                "/api/venue/" + String(venueId) + "/bookedTime/" + String(timeslot_id),
                {
                    data: {
                        userId
                    }
                }
            );
            const apiResponse = response.data;
            if(!apiResponse.success)
            {
                return {success : false,message : "Failed to delete venues"}
            }

            return {success : true, bookedTimes : apiResponse.data.blockTimes};
        }
        catch(error)
        {
            const apierror = getApiError(error);
            return {success : false, message : apierror?.message};
        }
    }
}
