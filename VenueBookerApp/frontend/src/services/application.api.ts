import Application from "@/types/ApplicationType";
import { api, emptyCollectionWithError, getApiError, type ApiResult } from "./api";

import type {
  ApplicationPayload,
  ApplicationsPayload,
} from "@shared/types/application_payload";

type AddApplicationResult = {
  success: boolean;
  message: string;
};

type Result = { success: true } | { success: false; reason: string };

export class ApplicationFetcherService {
  private applicationApi = api;

  // Sends a new application for a venue to the backend.
  async addOne(
    application: Omit<Application, "id" | "createdAt" | "updatedAt">,
  ): Promise<AddApplicationResult> {
    try {
      const response = await this.applicationApi.post<
        ApiResult<ApplicationPayload>
      >("/api/application/" + application.venueId.toString(), application);

      const apiResponse = response.data;

      if (!apiResponse.success) {
        return {
          success: false,
          message: apiResponse.message || "Failed to submit application",
        };
      }

      return {
        success: true,
        message: apiResponse.message || "Application submitted successfully",
      };
    } catch (error) {
      const apiError = getApiError(error);

      return {
        success: false,
        message: apiError?.message || "Failed to submit application",
      };
    }
  }

  // Gets all applications for the selected vendor.
  async getAllApplications(vendorId: number) {
    try {
      const response = await this.applicationApi.get<
        ApiResult<ApplicationsPayload>
      >("/api/application/" + String(vendorId));

      const apiResponse = response.data;

      if (!apiResponse.success) {
        return [];
      }

      return apiResponse.data.applications;
    } catch (error) {
      return emptyCollectionWithError<ApplicationsPayload["applications"][number]>(error);
    }
  }

  // Gets one application for a vendor by its id.
  async getApplication(vendorId: number, applicationId: number) {
    try {
      if (applicationId < 0) {
        return null;
      }
      const response = await this.applicationApi.get<
        ApiResult<ApplicationPayload>
      >(
        "/api/application/" +
          vendorId.toString() +
          "/" +
          applicationId.toString(),
      );

      const apiResponse = response.data;

      if (!apiResponse.success) {
        return null;
      }

      return apiResponse.data.application;
    } catch (error) {
      getApiError(error);
      return null;
    }
  }

  // Updates the vendor comment attached to an application.
  async updateComment(
    applicationId: number,
    vendorId: number,
    comment: string,
  ): Promise<Result> {
    try {
      const response = await this.applicationApi.put<
        ApiResult<ApplicationPayload>
      >("/api/application/" + applicationId.toString() + "/comment", {
        userId: vendorId,
        comment,
      });

      const apiResponse = response.data;

      if (!apiResponse.success) {
        return {
          success: false,
          reason: apiResponse.message,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      const err = getApiError(error);
      return {
        success: false,
        reason: err?.message || "Failed to update the comment",
      };
    }
  }

  // Changes an application status to accepted or rejected.
  async updateStatus(
    applicationId: number,
    vendorId: number,
    status: "accepted" | "rejected",
  ): Promise<Result> {
    try {
      const response = await this.applicationApi.put<
        ApiResult<ApplicationPayload | null>
      >("/api/application/" + applicationId.toString() + "/status", {
        userId: vendorId,
        status,
      });

      const apiResponse = response.data;

      if (!apiResponse.success) {
        return {
          success: false,
          reason: apiResponse.message,
        };
      }

      return { success: true };
    } catch (error) {
      const err = getApiError(error);
      return {
        success: false,
        reason: err?.message || "Failed to update Status",
      };
    }
  }
}
