export declare const UserRole: {
    readonly HIRER: "hirer",
    readonly VENDOR: "vendor",
    readonly ADMIN: "admin"
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export type UserDto = {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    password : string;
    email: string;
    role: UserRole;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
};
