import { UserType } from "@/types/UserType";
import { api, getApiError, type ApiResult } from "./api";
import type {AuthPayload} from "@shared/types/auth_payload";
import type { ApiError } from "@shared/types";

export class AuthFetcherService {

    private authenApi = api;

    // Creates a new hirer account with the provided login details.
    async signUp(email : string,first_name : string, last_name : string,username : string, password : string)
    {
        try
        {
            const response = await this.authenApi.post<ApiResult<AuthPayload>>("/api/auth/signup",{
                email,
                first_name,
                last_name,
                username,
                password,
                role : "hirer"
            });

            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return {
                    success : false,
                    message : apiResponse.message
                }
            }

            return {
                success : true,
                message : apiResponse.message
            };
        }
        catch(error)
        {
            const api_error : ApiError | string = getApiError(error) || "Sign Up failed";

            return {
                success : false,
                message : typeof api_error === "string" ? api_error : api_error.message,
            };
        }
    }
    
    // Signs a user in and returns their account details.
    async signIn(username : string,password : string)
    {
        try
        {
            const response = await this.authenApi.post<ApiResult<AuthPayload>>("/api/auth/login",{
                username,
                password
            });

            const apiResponse = response.data;

            if(!apiResponse.success)
            {
                return null;
            }

            return apiResponse.data.user;
        }
        catch(error)
        {
            getApiError(error);
            return null;
        }
    }
}
