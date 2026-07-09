import type { ApplicationStatus } from "./application";

export type HirerHistoryDto = {
    id: number;
    hirerId: number;
    venueName: string;
    location: string;
    eventName: string;
    dateOfHire: string;
    venueId: number;
    vendorId: number;
    rating: number | null;
    status: Extract<ApplicationStatus, "accepted" | "rejected"> | "approved";
};
