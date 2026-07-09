import type { HirerReport } from "@shared/types";
import { api, ApiResult, getApiError } from "./api";

export class ReportFetcherServices {
    private reportApi = api;
    // Gets the hirer report data from the backend. Requires vendorId for scoped query.
    async getReport(vendorId: number)
    {
        try
        {
        const response = await this.reportApi.get<ApiResult<HirerReport>>("/api/report/", {
            params: { userId: vendorId },
        });
        const apiResponse = response.data;

        if(!apiResponse.success)
        {
            return null;
        }

        return apiResponse.data;
        }
        catch(error)
        {
            throw getApiError(error) ?? new Error("Unable to load report");
        }
    }
}
