import type { UserDto } from "./user";
import type { UserDocumentDto } from "./userDocument";
import type { UserPreferenceDto } from "./userPreference";

export type UserPayload = {
    user: Omit<UserDto, "password">;
};



export type DeletePreferenceResult = {
    success: boolean;
    preferences?: UserPreferenceDto[];
    message?: string;
};

export type RankCheckingPayload = {
    allowed : boolean,
    maxAllowedRank : number,
    currentRank : number | null
}

export type UserDocumentsPayload = {
    documents: UserDocumentDto[];
};

export type UserDocumentPayload = {
    document: UserDocumentDto;
};

export type PreferencesPayload = {
    preferences: UserPreferenceDto[];
};

export type PreferencePayload = {
    preference : UserPreferenceDto;
};

export type ApiPreference = {
    preference : UserPreferenceDto;
}

export type VendorHistoryPayload = {
    vendor_history: HirerHistoryDto[];
};

export type HirerHistoryPayload = {
    hirer_history: HirerHistoryType[];
};
