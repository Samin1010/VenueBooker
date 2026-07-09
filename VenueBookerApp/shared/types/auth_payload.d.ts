import type { UserDto } from "./user";

export type AuthPayload = {
    user: Omit<UserDto, "password">;
};