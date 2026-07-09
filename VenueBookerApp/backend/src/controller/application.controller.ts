import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entity/Application";
import { User } from "../entity/User";
import { Venue } from "../entity/Venue";
import { BookedTime } from "../entity/BookedTime";
import { ApplicationStatus, Notification } from "../entity/Notification";
import { sendError, sendSuccess } from "../types/responses";
import type { ApiError, ApiResponse, ApplicationDto } from "@shared/types";
import type {
  Application2Payload,
  ApplicationPayload,
  ApplicationsPayload,
} from "@shared/types/application_payload";
// import { Booking } from "../entity/Booking";
export class ApplicationController {
  private applicationRepository = AppDataSource.getRepository(Application);
  private userRepository = AppDataSource.getRepository(User);
  private venueRepository = AppDataSource.getRepository(Venue);
  private notificationRepository = AppDataSource.getRepository(Notification);

  private createDateTime(date: string, time: string): Date {
    return new Date(`${date}T${time}`);
  }

  private localDate(value: Date): string {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("-");
  }

  private localTime(value: Date): string {
    return [
      String(value.getHours()).padStart(2, "0"),
      String(value.getMinutes()).padStart(2, "0"),
      String(value.getSeconds()).padStart(2, "0"),
    ].join(":");
  }

  private isValidDate(date: string) {
    // Expected format: YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false;
    }

    const [year, month, day] = date.split("-").map(Number);
    const parsedDate = new Date(year, month - 1, day);

    return (
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month - 1 &&
      parsedDate.getDate() === day
    );
  }

  private isValidTime(time: string) {
    // Expected format: HH:MM, 24-hour time
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
  }
  // private bookingRepository = AppDataSource.getRepository(Booking);
  async addApplication(
    req: Request,
    res: Response<ApiResponse<Application2Payload>>,
  ) {
    try {
      const application: ApplicationDto = req.body;

      if (!this.isValidDate(application.date)) {
        return sendError(res, 400, "INVALID_DATE", "Date is not valid");
      }

      if (!this.isValidTime(application.time)) {
        return sendError(res, 400, "INVALID_TIME", "Time is not valid");
      }

      if (
        !Number.isInteger(application.duration) ||
        application.duration < 2 ||
        application.duration > 10
      ) {
        return sendError(
          res,
          400,
          "INVALID_DURATION",
          "Duration must be between 2 and 10 hours",
        );
      }

      const user: User | null = await this.userRepository.findOne({
        where: {
          id: application.userId,
        },
      });

      if (!user) {
        return sendError(res, 400, "BAD_REQUEST", "The user does not exist");
      }

      const venueId = Number(req.params.venueId);

      const venue: Venue | null = await this.venueRepository.findOne({
        where: {
          id: venueId,
        },
        relations: {
          bookedTimes: true,
        },
      });

      if (!venue) {
        return sendError(res, 404, "NOT_FOUND", "Venue not found");
      }

      const newStart = this.createDateTime(application.date, application.time);
      if (newStart <= new Date()) {
        return sendError(
          res,
          400,
          "APPLICATION_DATE_IN_PAST",
          "Application date and time must be in the future",
        );
      }

      if (application.expectedGuests > venue.capacity) {
        return sendError(
          res,
          400,
          "VENUE_CAPACITY_EXCEEDED",
          `Expected guests cannot exceed venue capacity of ${venue.capacity}`,
        );
      }

      const newEnd = new Date(
        newStart.getTime() + application.duration * 60 * 60 * 1000,
      );

      const acceptedApplications = await this.applicationRepository.find({
        where: {
          venue: {
            id: venueId,
          },
          status: "accepted",
        },
        relations: {
          venue: true,
        },
      });

      const hasAcceptedApplicationCollision = acceptedApplications.some((existingApplication) => {
        const existingStart = this.createDateTime(
          existingApplication.date,
          existingApplication.time,
        );

        const existingEnd = new Date(
          existingStart.getTime() +
            existingApplication.duration * 60 * 60 * 1000,
        );

        return newStart < existingEnd && newEnd > existingStart;
      });

      const hasBlockedTimeCollision = (venue.bookedTimes ?? []).some((bookedTime) => {
        const bookedStart = this.createDateTime(bookedTime.date, bookedTime.time);
        const bookedEnd = new Date(
          bookedStart.getTime() + bookedTime.duration * 60 * 60 * 1000,
        );

        return newStart < bookedEnd && newEnd > bookedStart;
      });

      if (hasAcceptedApplicationCollision || hasBlockedTimeCollision) {
        return sendError(
          res,
          400,
          "TIME_SLOT_NOT_AVAILABLE",
          "This venue is unavailable during the selected time",
        );
      }

      const newApplication = new Application();

      newApplication.user = user;
      newApplication.eventName = application.eventName;
      newApplication.expectedGuests = application.expectedGuests;
      newApplication.date = application.date;
      newApplication.time = application.time;
      newApplication.duration = application.duration;
      newApplication.venue = venue;

      // usually new applications should start as pending
      newApplication.status = "pending";

      const applicationDto: ApplicationDto =
        await this.applicationRepository.save(newApplication);

      return sendSuccess(
        res,
        {
          application: applicationDto,
        },
        "Application has been submitted successfully",
        201,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return sendError(res, 400, "BAD_REQUEST", error.message);
      }

      return sendError(res, 400, "BAD_REQUEST", String(error));
    }
  }
  async getApplication(
    req: Request,
    res: Response<ApiResponse<ApplicationPayload>>,
  ) {
    try {
      const applicationId = req.params.applicationId;
      const application = await this.applicationRepository
        .createQueryBuilder("application")
        .leftJoinAndSelect("application.venue", "venue")
        .leftJoinAndSelect("application.user", "user")
        .where("application.id = :id", { id: Number(applicationId) })
        .andWhere("venue.userId = :vendorId", {
          vendorId: Number(req.params.vendorId),
        })
        .getOne();
      if (!application) {
        return sendError(res, 404, "NOT_FOUND", "Application not found");
      }
      const { user, ...applicationWithoutUser } = application;
      return sendSuccess(
        res,
        {
          application: {
            ...applicationWithoutUser,
            hirer_name: user.username,
          },
        },
        "Application found successfully",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
      }
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
  async getApplications(
    req: Request,
    res: Response<ApiResponse<ApplicationsPayload>>,
  ) {
    try {
      const vendorId = req.params.vendorId;
      const user: User | null = await this.userRepository.findOne({
        where: {
          id: Number(vendorId),
        },
      });
      if (!user) {
        return sendError(res, 404, "NOT_FOUND", "User not available");
      }
      const vendor = await this.userRepository
        .createQueryBuilder("vendor_venues")
        .leftJoinAndSelect("vendor_venues.venues", "venues")
        .leftJoinAndSelect("venues.applications", "applications")
        .leftJoinAndSelect("applications.user", "user")
        .leftJoinAndSelect("applications.review", "review")
        .where("vendor_venues.id = :userId", { userId: Number(vendorId) })

        .orderBy(
          `CASE 
            WHEN applications.status = 'pending' THEN 0
            ELSE 1
            END`,
          "ASC",
        )
        .addOrderBy("applications.date", "DESC")
        .addOrderBy("applications.time", "DESC")

        .getOne();
      if (!vendor) {
        return sendError(
          res,
          404,
          "NOT_FOUND",
          "There is no vendor which exists with this id",
        );
      }

      // the hirer rating shown to the vendor is the hirer's AVERAGE rating
      // across all of their reviewed applications, not the rating of this
      // single application (pending applications never have a review yet)
      const hirerIds = Array.from(
        new Set(
          vendor.venues.flatMap((venue) =>
            venue.applications.map((application) => application.user.id),
          ),
        ),
      );

      const averageRatingByHirer = new Map<number, number>();

      if (hirerIds.length > 0) {
        const averageRatingRows: Array<{
          hirerId: number;
          avg_rating: string | number;
        }> = await this.applicationRepository
          .createQueryBuilder("application")
          .innerJoin("application.review", "review")
          .select("application.userId", "hirerId")
          .addSelect("AVG(CAST(review.rating AS FLOAT))", "avg_rating")
          .where("application.userId IN (:...hirerIds)", { hirerIds })
          .groupBy("application.userId")
          .getRawMany();

        averageRatingRows.forEach((row) => {
          averageRatingByHirer.set(Number(row.hirerId), Number(row.avg_rating));
        });
      }

      // i did an additional sort in order to make
      // sure the sorting order is pending -> latest date/time -> uptill oldest date and time
      const allApplications = vendor.venues.flatMap((venue) =>
        venue.applications.map((application) => ({
          ...application,
          venue_name: venue.name,
          hirer_name: application.user.username,
          hirer_rating:
            averageRatingByHirer.get(application.user.id) ?? null,
        })),
      ).sort((first, second) => {
        if (first.status !== second.status) {
          if (first.status === "pending") return -1;
          if (second.status === "pending") return 1;
        }

        const dateComparison = String(second.date).localeCompare(
          String(first.date),
        );

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return String(second.time).localeCompare(String(first.time));
      });
      return sendSuccess(
        res,
        {
          applications: allApplications,
        },
        "Successfully received all the venues",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
      }
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
  async updateApplicationComment(
    req: Request,
    res: Response<ApiResponse<Application2Payload>>,
  ) {
    try {
      const applicationId = req.params.applicationId;
      const { comment, userId } = req.body;
      const application: Application | null =
        await this.applicationRepository.findOne({
          where: {
            id: Number(applicationId),
          },
          relations: {
            user: true,
          },
        });
      // if application does not exists then return
      if (!application) {
        return sendError(res, 404, "NOT_FOUND", "The application is not found");
      }
      const venueId = application.venueId;
      const venue: Venue | null = await this.venueRepository.findOne({
        where: {
          id: Number(venueId),
        },
      });
      // if venue does not exists then return a 404 response
      if (!venue) {
        return sendError(res, 404, "NOT_FOUND", "Message not found");
      }
      if (venue.userId !== Number(userId)) {
        return sendError(
          res,
          403,
          "FORBIDDEN",
          "Other vendor cannot update the status of other vendors",
        );
      }
      application.vendorReason = comment;
      await this.applicationRepository.save(application);
      return sendSuccess(
        res,
        {
          application,
        },
        "Application has been updated",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
      }
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
  async updateApplicationStatus(
    req: Request,
    res: Response<ApiResponse<Application2Payload>>,
  ) {
    try {
      const applicationId = req.params.applicationId;
      const { status, userId } = req.body;
      const application: Application | null =
        await this.applicationRepository.findOne({
          where: {
            id: Number(applicationId),
          },
          relations: {
            user: true,
          },
        });
      // if application does not exists then return
      if (!application) {
        return sendError(res, 404, "NOT_FOUND", "The application is not found");
      }

      const date = application.date;
      const time = application.time;
      const venueId = application.venueId;
      const venue: Venue | null = await this.venueRepository.findOne({
        where: {
          id: Number(venueId),
        },
        relations: {
          bookedTimes: true,
        },
      });
      // if venue does not exists then return a 404 response
      if (!venue) {
        return sendError(res, 404, "NOT_FOUND", "Message not found");
      }
      if (venue.userId !== Number(userId)) {
        return sendError(
          res,
          403,
          "FORBIDDEN",
          "Other vendor cannot update the status of other vendors",
        );
      }

      const formatDate = (value: Date | string) => {
        if (value instanceof Date) {
          return value.toISOString().slice(0, 10);
        }

        return String(value).slice(0, 10);
      };

      const formatTime = (value: Date | string) => {
        if (value instanceof Date) {
          return value.toTimeString().slice(0, 5);
        }

        return String(value).slice(0, 5);
      };

      const createDateTime = (
        dateValue: Date | string,
        timeValue: Date | string,
      ) => {
        return new Date(`${formatDate(dateValue)}T${formatTime(timeValue)}:00`);
      };

      const startDateTime = createDateTime(date, time);
      const endDateTime = new Date(
        startDateTime.getTime() + application.duration * 60 * 60 * 1000,
      );

      if (status === "accepted") {
        const bookedTimes: BookedTime[] = venue.bookedTimes ?? [];
        let collision: boolean = false;

        for (let i = 0; i < bookedTimes.length; i++) {
          const bookedStart = createDateTime(
            bookedTimes[i].date,
            bookedTimes[i].time,
          );
          const bookedEnd = new Date(
            bookedStart.getTime() + bookedTimes[i].duration * 60 * 60 * 1000,
          );

          if (startDateTime < bookedEnd && bookedStart < endDateTime) {
            collision = true;
            break;
          }
        }

        if (collision) {
          return sendError(
            res,
            400,
            "BAD_REQUEST",
            "The timing is already booked",
          );
        }

        const acceptedApplications = await this.applicationRepository.find({
          where: {
            venue: {
              id: venueId,
            },
            status: "accepted",
          },
        });

        const applicationCollision = acceptedApplications.some((existingApplication) => {
          if (existingApplication.id === application.id) {
            return false;
          }

          const existingStart = createDateTime(
            existingApplication.date,
            existingApplication.time,
          );
          const existingEnd = new Date(
            existingStart.getTime() +
              existingApplication.duration * 60 * 60 * 1000,
          );

          return startDateTime < existingEnd && existingStart < endDateTime;
        });

        if (applicationCollision) {
          return sendError(
            res,
            400,
            "TIME_SLOT_NOT_AVAILABLE",
            "Another application has already been accepted for this time",
          );
        }
      }

      application.status = status;
      await this.applicationRepository.save(application);
      const notification = new Notification();
      notification.application = application;
      notification.user = application.user;
      const notificationCreatedAt = new Date();
      notification.date = this.localDate(notificationCreatedAt);
      notification.time = this.localTime(notificationCreatedAt);
      // rejecting the application
      if (application.status === "rejected") {
        notification.message = "Successfully rejected the application";
        notification.type = ApplicationStatus.REJECTED;
        await this.notificationRepository.save(notification);
        return sendSuccess(
          res,
          {
            application,
          },
          "Successfully rejected the application",
        );
      }
      notification.message = "Successfully accepted the application";
      notification.type = ApplicationStatus.APPROVED;
      await this.notificationRepository.save(notification);
      // accepting the application response
      return sendSuccess(
        res,
        {
          application,
        },
        "The application is updated successfully",
      );
    } catch (error) {
      if (error instanceof Error) {
        return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
      }
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
}
