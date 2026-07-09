import axios from "axios";
import type { ApiError, ApiResponse } from "@shared/types";

// NEXT_PUBLIC_* env variables are inlined by Next.js at build time,
// so no dotenv is needed (dotenv is Node-only and breaks the browser bundle).
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
});

export type ApiResult<T> = ApiResponse<T>;
export type ApiCollection<T> = T[] & { error?: ApiError };
// i have this getApiError which i thought of using it and return the specific error
// but since the user is going to be having no idea so i preferred not to return to the UI elements
// and moreover i used it every where , i mostly did not use it , it is just there 
// it would be tedious to change the codebase so i did not remove it and moreover if i ever 
// plan to use the error in the UI then i can use it so it is an undetermined plan
// Converts API and JavaScript errors into a common error shape.
export function getApiError(error: unknown): ApiError | null {
    if (axios.isAxiosError<ApiResponse<never>>(error)) {
        return error.response?.data.success === false
            ? error.response.data.error
            : {
                code: "NETWORK_ERROR",
                message: error.message || "Unable to reach the server",
            };
    }

    if (error instanceof Error) {
        return {
            code: "UNKNOWN_ERROR",
            message: error.message
        };
    }

    return {
        code: "UNKNOWN_ERROR",
        message: String(error)
    };
}

export function emptyCollectionWithError<T>(error: unknown): ApiCollection<T> {
    const result: ApiCollection<T> = [];
    result.error = getApiError(error) ?? {
        code: "UNKNOWN_ERROR",
        message: "The request failed",
    };
    return result;
}
