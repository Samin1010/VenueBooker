import { PubSub } from "graphql-subscriptions";
import { AppDataSource } from "../data-source";
import { UserAccount } from "../entities/UserAccount";
import { VenueProperty } from "../entities/VenueProperty";
import type { VenueDto } from "@admin-shared/types";
import { VenueApplication } from "../entities/VenueApplication";
import type {PopularVenueReport, ApplicantReport } from "@admin-shared/types/report";
import bcrypt from "bcrypt"

export const pubsub = new PubSub();
const userRepository = AppDataSource.getRepository(UserAccount);
const venuePropertyRepository = AppDataSource.getRepository(VenueProperty);
const venueApplicationRepostory = AppDataSource.getRepository(VenueApplication);

const TOP_REPORT_LIMIT = 3;
const ACCEPTED_APPLICATION_STATUS = "accepted";
const PERCENT_MULTIPLIER = 100.0;
const DEFAULT_RATINGS_COUNT = 0;
const DISCOUNT_PERCENTAGE = 45;
const DISCOUNT_MULTIPLIER = 0.55;
const DISCOUNT_VENUE = 'DISCOUNT_VENUE';
const REMOVE_DISCOUNT_VENUE = 'REMOVE_DISCOUNT_VENUE'

type VenueInput = Partial<Omit<VenueDto, "userId">> & { userId: number };
type UpdateVenueInput = Partial<
  Pick<
    VenueDto,
    | "name"
    | "location"
    | "capacity"
    | "price"
    | "image"
    | "description"
    | "is_featured"
    | "suitabilities"
    | "userId"
  >
>;

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export const resolvers = {
  Query: {
    getOneVenue: async (_: any, args: { id: string }) => {
      const venue = await venuePropertyRepository.findOne({
        where: {
          id: Number(args.id),
        },
        relations: {
          bookedTimes: true,
        },
      });

      return venue;
    },
    users: async () => {
      return await userRepository.find({
        relations: {
          venues: true,
        },
      });
    },
    user: async (_: any, { id }: { id: string }) => {
      return await userRepository.findOneBy({
        id: parseInt(id),
      });
    },
    hirers: async () => {
      return await userRepository.find({
        where: {
          role: "hirer",
        },
      });
    },
    vendors: async () => {
      return await userRepository.find({
        where: {
          role: "vendor",
        },
        relations: {
          venues: true,
        },
      });
    },
    featuredVenues: async () => {
      return await venuePropertyRepository.find({
        where: {
          is_featured: true,
        },
      });
    },
    nonFeaturedVenues : async () => {
      return await venuePropertyRepository.find({
        where: {
          is_featured: false,
        },
      });
    },
    vendorVenues: async (_: any, args: { id: string }) => {
      const vendor = await userRepository.findOne({
        where: {
          id: Number(args.id),
        },
        relations: {
          venues: true,
        },
      });

      return vendor?.venues || [];
    },
    venues: async () => {
      return await venuePropertyRepository.find({
      });
    },
    getThreeMostPopularVenuesAndTimings: async () : Promise<PopularVenueReport[]> => {
      const result = await AppDataSource.query(`
        WITH VenuePopularity AS (
          SELECT
            v.id,
            v.name,
            COUNT(*) AS totalBookings
          FROM venue v
          JOIN application va ON va.venueId = v.id
          WHERE va.status = @1
          GROUP BY v.id, v.name
        ),
        TopVenues AS (
          SELECT TOP (@0) id, name, totalBookings
          FROM VenuePopularity
          ORDER BY totalBookings DESC, id ASC
        ),
        RankedTimings AS (
          SELECT
            tv.id,
            tv.name AS popular_venue,
            DATENAME(WEEKDAY, va.date) AS popular_weekday,
            CAST(va.time AS varchar(8)) AS popular_time,
            va.duration AS popular_duration,
            tv.totalBookings,
            ROW_NUMBER() OVER (
              PARTITION BY tv.id
              ORDER BY COUNT(*) DESC, va.time ASC, va.duration ASC
            ) AS timingRank
          FROM TopVenues tv
          JOIN application va ON va.venueId = tv.id
          WHERE va.status = @1
          GROUP BY
            tv.id,
            tv.name,
            tv.totalBookings,
            DATENAME(WEEKDAY, va.date),
            va.time,
            va.duration
        )
        SELECT
          popular_venue,
          popular_weekday,
          popular_time,
          popular_duration,
          totalBookings
        FROM RankedTimings
        WHERE timingRank = 1
        ORDER BY totalBookings DESC, id ASC;
      `, [TOP_REPORT_LIMIT, ACCEPTED_APPLICATION_STATUS]);

      return result;
    },
    getThreeMostPopularApplicantsAndTheirSuccessRate: async () : Promise<ApplicantReport[]> => {
      const result = await AppDataSource.query(`
        SELECT TOP (@0)
          usr.username AS applicant_name,

          COUNT(va.id) AS totalApplications,

          SUM(CASE 
            WHEN va.status = @1 THEN 1
            ELSE 0
          END) AS successfulBookings,

          CAST(
            SUM(CASE 
              WHEN va.status = @1 THEN 1
              ELSE 0
            END) * @2 / COUNT(va.id)
            AS DECIMAL(5, 2)
          ) AS success_rate

        FROM [user] usr

        JOIN application va
          ON usr.id = va.userId

        GROUP BY usr.id, usr.username

        ORDER BY 
          totalApplications DESC,
          successfulBookings DESC,
          success_rate DESC;
      `, [TOP_REPORT_LIMIT, ACCEPTED_APPLICATION_STATUS, PERCENT_MULTIPLIER]);

      return result;
    },
  },
  Mutation: {
    login: async (
      _: any,
      { name, password }: { name: string; password: string },
    ) => {
      const user: UserAccount | null = await userRepository.findOne({
        where: {
          username: name
        },
      });

      if(!user)
      {
        throw new Error("Invalid Username Or password")
      }

      const isPasswordCorrect = await bcrypt.compare(password,user.password);

      if(!isPasswordCorrect)
      {
        throw new Error("Invalid Username Or Password");
      }

      if(user.role !== "admin")
      {
        throw new Error("Only admins allowed")
      }

      return user;
    },
    createVenue: async (_: any, { venue }: { venue: VenueInput }) => {
      const { userId, ...venueInput } = venue;
      const venueEntity: VenueProperty = venuePropertyRepository.create(venueInput);

      if (!userId) {
        throw new Error("Venue owner is required");
      }

      const user = await userRepository.findOne({
        where: { id: userId },
      });

      if (!user || user.role !== "vendor") {
        throw new Error("Vendor not found");
      }

      venueEntity.user = user;

      if (venueEntity.is_featured === undefined) {
        venueEntity.is_featured = false;
      }

      if (venueEntity.rating === undefined) {
        venueEntity.rating = null;
      }

      if (venueEntity.num_ratings === undefined) {
        venueEntity.num_ratings = DEFAULT_RATINGS_COUNT;
      }

      venueEntity.original_price = null;

      return venuePropertyRepository.save(venueEntity);
    },
    updateVenue: async (
      _: any,
      { id, venue }: { id: string; venue: UpdateVenueInput },
    ) => {
      try {
        const { userId, price, ...venueInput } = venue;
        const existingVenue = await venuePropertyRepository.findOne({
          where: { id : Number(id) },
          relations: {
            user: true,
          },
        });

        if (!existingVenue) {
          throw new Error("Venue not found");
        }

        if (userId !== undefined) {
          const user = await userRepository.findOne({
            where: { id: userId },
          });

          if (!user || user.role !== "vendor") {
            throw new Error("User not found");
          }

          existingVenue.user = user;
        }

        if (
          price !== undefined &&
          Number(existingVenue.discounted_percentage) !== 0
        ) {
          throw new Error("Remove the venue discount before changing its price");
        }

        if (venueInput.name !== undefined) {
          existingVenue.name = venueInput.name;
        }
        if (venueInput.location !== undefined) {
          existingVenue.location = venueInput.location;
        }
        if (venueInput.capacity !== undefined) {
          existingVenue.capacity = venueInput.capacity;
        }
        if (venueInput.image !== undefined) {
          existingVenue.image = venueInput.image;
        }
        if (venueInput.description !== undefined) {
          existingVenue.description = venueInput.description;
        }
        if (venueInput.is_featured !== undefined) {
          existingVenue.is_featured = venueInput.is_featured;
        }
        if (venueInput.suitabilities !== undefined) {
          existingVenue.suitabilities = venueInput.suitabilities;
        }

        if (price !== undefined) {
          const numericPrice = Number(price);
          if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            throw new Error("Venue price must be greater than zero");
          }
          existingVenue.price = roundCurrency(numericPrice);
        }

        await venuePropertyRepository.save(existingVenue);

        return existingVenue;
      } catch (error) {
        throw error;
      }
    },
    deleteVenue: async (_: any, args: { venueId: string }) => {
      const venue = await venuePropertyRepository.findOne({
        where: { id: Number(args.venueId) },
      });

      if (!venue) {
        throw new Error("Venue not found");
      }

      await venuePropertyRepository.remove(venue);
      return true;
    },
    discountVenue : async (_ : any,args : { venueId : string}) => {
      const venue = await venuePropertyRepository.findOne({
        where : {
          id : Number(args.venueId)
        }
      });

      if(!venue)
      {
        throw new Error("Venue not found");
      }

      if (Number(venue.discounted_percentage) !== 0) {
        throw new Error("Venue already has a discount");
      }

      venue.original_price = Number(venue.price);
      venue.price = roundCurrency(venue.original_price * DISCOUNT_MULTIPLIER);
      venue.discounted_percentage = DISCOUNT_PERCENTAGE;
      const discounted_venue = await venuePropertyRepository.save(venue);
      pubsub.publish(DISCOUNT_VENUE,{ discountedVenue : discounted_venue});
      return discounted_venue;
    },
    removeDiscountFromVenue : async (_ : any, args : {venueId : string}) => {
      const venue = await venuePropertyRepository.findOne({
        where : {
          id : Number(args.venueId)
        }
      });

      if(!venue)
      {
        throw new Error("Venue not found");
      }

      if (
        Number(venue.discounted_percentage) !== DISCOUNT_PERCENTAGE ||
        venue.original_price === null
      ) {
        throw new Error("Venue does not have a removable 45% discount");
      }

      venue.price = Number(venue.original_price);
      venue.original_price = null;
      venue.discounted_percentage = 0;
      const removedDiscountedVenue = await venuePropertyRepository.save(venue);
      pubsub.publish(REMOVE_DISCOUNT_VENUE,{ removedDiscountedVenue });
      return removedDiscountedVenue;
    }
  },
  Subscription: {
    discountedVenue : {
      subscribe : () => pubsub.asyncIterator([DISCOUNT_VENUE])
    },

    removedDiscountedVenue : {
      subscribe : () => pubsub.asyncIterator([REMOVE_DISCOUNT_VENUE])
    }
  }
};
