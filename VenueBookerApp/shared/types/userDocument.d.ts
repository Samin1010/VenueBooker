// shared/types/userDocument.ts

export declare const FileType: {
    readonly IDENTITY: "identity",
    readonly INSURANCE: "insurance",
    readonly RISK: "risk",
    readonly ALCOHOL: "alcohol",
} ;

export type FileType = (typeof FileType)[keyof typeof FileType];

export declare const FileExtensionType : {
    readonly PDF: ".pdf",
    readonly JPG: ".jpg",
    readonly JPEG: ".jpeg",
    readonly PNG: ".png",
};

export type FileExtensionType = (typeof FileExtensionType)[keyof typeof FileExtensionType];

export type UserDocumentDto = {
    id: number;
    userId: number;
    data: string | null;
    file_type: FileType | null;
    file_extension_type: FileExtensionType | null;
    file_name: string | null;
    createdAt?: string;
    updatedAt?: string;
};
