export declare const ApplicationStatus: {
    readonly PENDING: "pending",
    readonly ACCEPTED: "accepted",
    readonly REJECTED: "rejected",
};

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export type ApplicationDto = {
    id: number;
    eventName: string;
    expectedGuests: number;
    date: string;
    time: string;
    duration: number;
    vendorReason: string;
    status: ApplicationStatus;
    createdAt: string;
    updatedAt: string;
    userId: number;
    venueId: number;
};
