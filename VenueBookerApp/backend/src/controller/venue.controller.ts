import { sendError, sendSuccess } from "../types/responses";
import { LessThanOrEqual, Like, MoreThanOrEqual } from "typeorm";
// Venue controller for managing venue-related operations
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Venue } from "../entity/Venue";
import { User } from "../entity/User";
// import { Application } from "../entity/Application";
import { BookedTime } from "../entity/BookedTime";
import { Application } from "../entity/Application";
import type {
  BookedTimePayload,
  BookedTimesPayload,
  HirerOnlyVenuePayload,
  VenueAvailabilityPayload,
  VenuePayload,
  VenuesPayload,
} from "@shared/types/venue_payload";
import type { ApiResponse } from "@shared/types/api";
import type { BookedTimeDto, VenueDto } from "@shared/types";
// import { BookedTime } from "../entity/BookedTime";
export class VenueController {
  // Repositories for database access
  private venueRepository = AppDataSource.getRepository(Venue);
  private ApplicationRepository = AppDataSource.getRepository(Application);
  private userRepository = AppDataSource.getRepository(User);
  private bookedTimesRepository = AppDataSource.getRepository(BookedTime);
  // CRUD Operations
  // Get all venues with optional filters
  async getAll(request: Request, res: Response<ApiResponse<HirerOnlyVenuePayload>>) {
    try {
      const { name, location, capacity, price, suitability } = request.query;

      const where: any = {};

      if (typeof name === "string" && name.trim() !== "") {
        where.name = Like(`%${name.trim()}%`);
      }

      if (typeof location === "string" && location.trim() !== "") {
        where.location = Like(`%${location.trim()}%`);
      }

      if (typeof capacity === "string" && capacity.trim() !== "") {
        where.capacity = MoreThanOrEqual(Number(capacity));
      }

      if (typeof price === "string" && price.trim() !== "") {
        where.price = LessThanOrEqual(Number(price));
      }

      if (typeof suitability === "string" && suitability.trim() !== "") {
        where.suitabilities = Like(`%${suitability.trim()}%`);
      }

      const venues = await this.venueRepository.find({
        where,
      });

      const featured_venues = venues.filter(
        (venue) => venue.is_featured === true,
      );

      const non_featured_venues = venues.filter(
        (venue) => venue.is_featured !== true,
      );

      return sendSuccess(
        res,
        {
          featured_venues,
          non_featured_venues,
        },
        "Successfully retrieved the venues",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
      }

      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
  // Get all venues for a specific vendor
  async getAllForVendor(
    req: Request,
    res: Response<ApiResponse<VenuesPayload>>,
  ) {
    try {
      const vendorId = req.params.vendorId;

      const user = await this.userRepository.findOne({
        where: {
          id: Number(vendorId),
        },
      });

      if (!user) {
        return sendError(res, 404, "NOT_FOUND", "Vendor not found");
      }
      const venues = await this.venueRepository.find({
        where: {
          user: {
            id: Number(vendorId),
          },
        },
      });
      return sendSuccess(
        res,
        {
          // venues: venues.map(elem => ({
          //     ...elem,
          //     image : `data:image/jpeg;base64,${elem.image.toString("base64")}`
          // }))
          venues,
        },
        "Retrived all the venues successfully",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
        return;
      }
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
  // Get a single venue by ID
  async getOne(req: Request, res: Response<ApiResponse<VenuePayload>>) {
    try {
      const venueId = req.params.venueId;
      const venue = await this.venueRepository
        .createQueryBuilder("venue")
        .leftJoinAndSelect("venue.bookedTimes", "bookedTimes")
        .where("venue.id = :venueId", { venueId: Number(venueId) })
        .getOne();

      if (!venue) {
        return sendError(res, 404, "NOT_FOUND", "Venue not found");
      }

      return sendSuccess(
        res,
        {
          venue,
        },
        "Successfully Retrived the venue",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
        return;
      }
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
  async getAvailability(
    req: Request,
    res: Response<ApiResponse<VenueAvailabilityPayload>>,
  ) {
    try {
      const venueId = Number(req.params.venueId);
      const venue = await this.venueRepository.findOne({
        where: { id: venueId },
        relations: { bookedTimes: true },
      });

      if (!venue) {
        return sendError(res, 404, "NOT_FOUND", "Venue not found");
      }

      const acceptedApplications = await this.ApplicationRepository.find({
        where: {
          venue: { id: venueId },
          status: "accepted",
        },
      });

      return sendSuccess(
        res,
        {
          unavailableTimes: [
            ...(venue.bookedTimes ?? []),
            ...acceptedApplications,
          ].map(({ date, time, duration }) => ({ date, time, duration })),
        },
        "Successfully retrieved venue availability",
      );
    } catch (error: unknown) {
      return sendError(
        res,
        500,
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : String(error),
      );
    }
  }
  // Add a new venue
  async addOne(req: Request, res: Response<ApiResponse<VenuePayload>>) {
    try {
      const {
        name,
        location,
        price,
        capacity,
        description,
        suitabilities,
        image,
        userId,
        is_featured,
      } = req.body;

      const numericPrice = Number(price);
      const numericCapacity = Number(capacity);

      if (
        typeof name !== "string" ||
        typeof location !== "string" ||
        typeof description !== "string" ||
        typeof image !== "string" ||
        userId === undefined ||
        !Array.isArray(suitabilities) ||
        suitabilities.length === 0
      ) {
        return sendError(
          res,
          400,
          "BAD_REQUEST",
          "All the required details are not being sent",
        );
      }

      if (!Number.isFinite(numericPrice) || numericPrice < 0.01) {
        return sendError(res, 400, "BAD_REQUEST", "Price is not valid");
      }

      if (!Number.isInteger(numericCapacity) || numericCapacity < 10) {
        return sendError(res, 400, "BAD_REQUEST", "Capacity is not valid");
      }

      const user = await this.userRepository.findOne({
        where: {
          id: Number(userId),
        },
      });

      if (!user) {
        return sendError(res, 404, "NOT_FOUND", "User not found");
      }

      if (user.role !== "vendor") {
        return sendError(
          res,
          400,
          "BAD_REQUEST",
          "Venue owner must be a vendor",
        );
      }

      // Remove data:image/jpeg;base64,
      //const base64Data = image.split(",")[1];

      // Convert base64 -> Buffer
      //const imageBuffer = Buffer.from(base64Data, "base64");

      const venue = this.venueRepository.create({
        name,
        location,
        price: numericPrice,
        capacity: numericCapacity,
        description,
        rating: null,
        suitabilities: suitabilities,
        num_ratings: 0,
        image: image,
        is_featured: Boolean(is_featured),
        user,
      });

      await this.venueRepository.save(venue);

      return sendSuccess(
        res,
        {
          // venue: {
          //     ...venue,
          //     image: `data:image/jpeg;base64,${venue.image.toString("base64")}`
          // }
          venue,
        },
        "Successfully created the venue",
        201,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
        return;
      }

      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
  async getAllBlockedTimeSlot(
    req: Request,
    res: Response<ApiResponse<BookedTimesPayload>>,
  ) {
    try {
      const venueId = req.params.venueId;
      const venue: Venue | null = await this.venueRepository.findOne({
        where: {
          id: Number(venueId),
        },
        relations: {
          bookedTimes: true,
        },
      });
      if (!venue) {
        return sendError(res, 404, "NOT_FOUND", "Venue not found");
      }

      return sendSuccess(
        res,
        {
          blockTimes: venue.bookedTimes,
        },
        "SuccessFully got all the blockTimes",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
        return;
      }
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }

  private formattedDate(date: Date) {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  }
  // Block a time slot for a venue
  async blockTimeSlot(
    req: Request,
    res: Response<ApiResponse<BookedTimePayload>>,
  ) {
    try {
      const bookedTime = req.body;
      const userId = bookedTime.userId;
      if (!userId) {
        return sendError(res, 401, "UNAUTHORIZED", "User is not authenticated");
      }
      if (
        !Number.isInteger(bookedTime.duration) ||
        bookedTime.duration < 2 ||
        bookedTime.duration > 10
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
          id: Number(userId),
        },
      });
      if (!user) {
        return sendError(res, 404, "NOT_FOUND", "User not found");
      }
      const venueId = req.params.venueId;
      const venue: Venue | null = await this.venueRepository.findOne({
        where: {
          id: Number(venueId),
        },
        relations: {
          bookedTimes: true,
          applications: true,
        },
      });
      // if venue does not exists then it is 404 error
      // so return response with that error
      if (!venue) {
        return sendError(res, 404, "NOT_FOUND", "Venue does not exists");
      }
      if (venue.userId !== user.id) {
        return sendError(
          res,
          403,
          "FORBIDDEN",
          "The Vendor cannot block Time slots because that person does not own it",
        );
      }
      const bookedTimes: BookedTime[] = venue.bookedTimes;
      let collision: boolean = false;
      const date = bookedTime.date;
      const time = bookedTime.time;
      const blockStart_time = new Date("1970-01-01T" + time);
      const datetime = new Date(`${date}T${time}`);
      const endTimeBooking = new Date(
        blockStart_time.getTime() + bookedTime.duration * 60 * 60 * 1000,
      );
      // Check for time slot collisions
      for (let i = 0; i < bookedTimes.length; i++) {
        if (bookedTimes[i].date === this.formattedDate(datetime)) {
          const startTime = new Date("1970-01-01T" + bookedTimes[i].time);
          const endTime = new Date(
            startTime.getTime() + bookedTimes[i].duration * 60 * 60 * 1000,
          );
          if (blockStart_time < endTime && endTimeBooking > startTime) {
            collision = true;
            break;
          }
        }
      }

      for (let i = 0; i < venue.applications.length; i++) {
        if (venue.applications[i].status === "accepted") {
          if (venue.applications[i].date === this.formattedDate(datetime)) {
            const startTime = new Date(
              "1970-01-01T" + venue.applications[i].time,
            );
            const endTime = new Date(
              startTime.getTime() +
                venue.applications[i].duration * 60 * 60 * 1000,
            );
            if (blockStart_time < endTime && endTimeBooking > startTime) {
              collision = true;
              break;
            }
          }
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
      // created and added a new time slot
      const newBookedTime: BookedTime = new BookedTime();
      newBookedTime.date = bookedTime.date;
      newBookedTime.time = bookedTime.time;
      newBookedTime.duration = bookedTime.duration;
      newBookedTime.venue = venue;
      await this.bookedTimesRepository.save(newBookedTime);
      return sendSuccess(
        res,
        {
          bookedTime: newBookedTime,
        },
        "Successfully added the booked Time into the system",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
        return;
      }
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
  // Unblock a time slot
  async unblockTimeSlot(
    req: Request,
    res: Response<ApiResponse<BookedTimesPayload>>,
  ) {
    try {
      const blockId = req.params.blockId;
      const venueId = req.params.venueId;
      const { userId } = req.body;
      const venue = await this.venueRepository.findOne({
        where: {
          id: Number(venueId),
        },
      });
      // .createQueryBuilder("venueUser")
      // .leftJoinAndSelect("venue.user","user")
      // .where("venue.id = :venueId",{venueId})
      // .getOne();
      if (!venue) {
        return sendError(
          res,
          404,
          "NOT_FOUND",
          "There is no venue which exists with this id",
        );
      }
      if (venue.userId !== Number(userId)) {
        return sendError(
          res,
          403,
          "FORBIDDEN",
          "The Vendor cannot unblock time slots because that person does not own it",
        );
      }
      const bookedTime: BookedTime | null =
        await this.bookedTimesRepository.findOne({
          where: {
            id: Number(blockId),
            venue: {
              id: Number(venueId),
            },
          },
        });
      if (!bookedTime) {
        return sendError(
          res,
          404,
          "NOT_FOUND",
          "There is no bookedTime which exists with this id",
        );
      }
      await this.bookedTimesRepository.remove(bookedTime);

      const blockTimes: BookedTime[] = await this.bookedTimesRepository.find({
        where: {
          venue: {
            id: Number(venueId),
          },
        },
      });
      return sendSuccess(
        res,
        {
          blockTimes,
        },
        "booked Time removed successfully",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
        return;
      }
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
  // Update a venue
  async updateOne(req: Request, res: Response<ApiResponse<VenuePayload>>) {
    try {
      const venueId = req.params.venueId;
      const {
        name,
        location,
        capacity,
        price,
        description,
        suitabilities,
        image,
        userId,
        is_featured,
      } = req.body;
      const user: User | null = await this.userRepository.findOne({
        where: {
          id: Number(userId),
        },
      });
      const venue: Venue | null = await this.venueRepository.findOne({
        where: {
          id: Number(venueId),
        },
      });
      // .createQueryBuilder("venueUser")
      // .leftJoinAndSelect("venue.user","user")
      // .where("venue.id = :venueId",{venueId : Number(venueId)})
      // .getOne();
      if (!venue) {
        return sendError(res, 404, "NOT_FOUND", "Venue not found");
      }
      if (!user) {
        return sendError(res, 404, "NOT_FOUND", "User not found");
      }
      if (user.role !== "vendor") {
        return sendError(
          res,
          400,
          "BAD_REQUEST",
          "Venue owner must be a vendor",
        );
      }
      if (venue.userId !== user.id) {
        return sendError(
          res,
          403,
          "FORBIDDEN",
          "The Owner of the venue can only update it",
        );
      }
      // Update fields if provided
      if (name) {
        venue.name = name;
      }
      if (location) {
        venue.location = location;
      }
      if (suitabilities) {
        venue.suitabilities = suitabilities;
      }
      if (price) {
        // if (typeof price !== 'string') return false; // Must be a string
        // if (price.trim() === '') return false;       // Empty string is invalid
        const num = Number(price);
        if (isNaN(num) || !isFinite(num)) {
          return sendError(res, 400, "BAD_REQUEST", "Price is not valid");
        }
        venue.price = num;
      }
      if (description) {
        venue.description = description;
      }
      if (capacity) {
        venue.capacity = capacity;
      }
      if (image) {
        // storing the image Buffer as string
        // which is binary string of base64 encoded
        // into the database

        venue.image = image;
      }
      if (is_featured !== undefined) {
        venue.is_featured = Boolean(is_featured);
      }
      await this.venueRepository.save(venue);
      return sendSuccess(
        res,
        {
          venue,
        },
        "updated the venue successfully",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
        return;
      }
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
  // Delete a venue
  async deleteOne(req: Request, res: Response<ApiResponse<VenuesPayload>>) {
    try {
      const venueId = req.params.venueId;

      const venue: Venue | null = await this.venueRepository.findOne({
        where: {
          id: Number(venueId),
        },
        relations: {
          user: true,
        },
      });
      if (!venue) {
        return sendError(res, 404, "NOT_FOUND", "Venue not found");
      }

      const userId: number = venue.user.id;

      await this.venueRepository.remove(venue);

      const user: User | null = await this.userRepository.findOne({
        where: {
          id: userId,
        },
        relations: {
          venues: true,
        },
      });

      if (!user) {
        return sendError(res, 404, "NOT_FOUND", "User not found");
      }
      return sendSuccess(
        res,
        {
          venues: user.venues,
        },
        "SuccessFully deleted the venue",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
        return;
      }
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
}
