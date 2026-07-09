import type { ApplicationDto } from "./application";
import type { VenueDto } from "./venue";

export type ApplicationDetails = ApplicationDto & {
    hirer_name: string;
    venue: VenueDto;
};

export type ApplicationListItem = ApplicationDto & {
    venue_name: string;
    hirer_name: string;
    hirer_rating: number | null;
};

export type ApplicationPayload = {
    application: ApplicationDetails;
};

export type Application2Payload = {
    application : ApplicationDto;
}

export type ApplicationsPayload = {
    applications: ApplicationListItem[];
};
