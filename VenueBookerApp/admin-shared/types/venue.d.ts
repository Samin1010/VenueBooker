export declare const SuitabilityType: {
    readonly TENNIS: "tennis";
    readonly DINNER: "dinner";
    readonly CLASSICAL_MUSIC: "classical music";
    readonly ROCK_CONCERT: "rock concert";
    readonly BIRTHDAY: "birthday";
    readonly WEDDING: "wedding";
    readonly NONE: "none";
};

export type SuitabilityType =
    (typeof SuitabilityType)[keyof typeof SuitabilityType];


export type VenueDto = {
    id: number;
    name: string;
    location: string;
    capacity: number;
    price: number;
    is_featured : boolean,
    bookedTimes : { date: string; time: string; duration: number }[];
    image: string;
    description: string;
    rating: number | null;
    num_ratings: number;
    suitabilities: SuitabilityType[];
    createdAt: string;
    updatedAt: string;
    userId: number;
    discounted_percentage : number;
};
