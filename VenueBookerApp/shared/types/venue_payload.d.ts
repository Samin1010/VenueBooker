import type { BookedTimeDto } from "./bookedTime";
import type { VenueDto } from "./venue";

export type VenuesPayload = {
    venues: VenueDto[];
};

export type DeleteBlockTime = 
{
    success : boolean,
    bookedTimes? : BookedTimeDto[],
    message? : string
}

export type DeleteVenueResult =
{
    success: boolean;
    venues?: VenueDto[];
    message?: string;
}

export type VenuePayload = {
    venue: VenueDto;
};

export type HirerOnlyVenuePayload = {
    featured_venues : VenueDto[],
    non_featured_venues : VenueDto[]
}

export type BookedTimesPayload = {
    blockTimes: BookedTimeDto[];
};

export type VenueAvailabilityPayload = {
    unavailableTimes: Pick<BookedTimeDto, "date" | "time" | "duration">[];
};

export type BookedTimePayload = {
    bookedTime: BookedTimeDto;
};
