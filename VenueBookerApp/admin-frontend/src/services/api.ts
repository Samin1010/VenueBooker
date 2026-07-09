import { client } from "./apollo-client";
import type { VenueDto } from "@admin-shared/types";
import {
  CREATE_VENUE,
  DELETE_VENUE,
  GET_ALL_VENDORS,
  GET_FEATURED_VENUES,
  GET_NON_FEATURED_VENUES,
  GET_ONE_VENUE,
  GET_THREE_MOST_POPULAR_VENUES_AND_TIMINGS,
  GET_THREE_MOST_SUCCESSFULL_APPLICANTS,
  GET_VENDOR_VENUES,
  DISCOUNT_VENUE,
  GET_VENUES,
  LOGIN,
  UPDATE_VENUE,
  REMOVE_DISCOUNT_FROM_VENUE,
} from "./graphql";

type CreateVenueInput = Omit<
  VenueDto,
  | "id"
  | "rating"
  | "bookedTimes"
  | "num_ratings"
  | "createdAt"
  | "updatedAt"
  | "discounted_percentage"
>;

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

export const VenueFetcherServices = {
  // Gets all venues for the admin venue pages.
  getAllVenues: async (): Promise<
    Array<
      Omit<
        VenueDto,
        | "vendor_id"
        | "applications"
        | "bookedTimes"
        | "createdAt"
        | "updatedAt"
      >
    >
  > => {
    const { data } = await client.query({ query: GET_VENUES });
    return data.venues || [];
  },
  // Creates a venue through the GraphQL API.
  createVenue: async (venue: CreateVenueInput) => {
    const { data } = await client.mutate({
      mutation: CREATE_VENUE,
      variables: {
        venue,
      },
    });

    return data.createVenue;
  },
  // Updates a venue through the GraphQL API.
  updateVenue: async (id: number, venue: UpdateVenueInput) => {
    const { data } = await client.mutate({
      mutation: UPDATE_VENUE,
      variables: {
        updateVenueId: String(id),
        venue: venue,
      },
    });

    return data.updateVenue;
  },
  getVendorVenues: async (id: number) => {
    const { data } = await client.query({
      query: GET_VENDOR_VENUES,
      variables: {
        id: id,
      },
    });

    return data.vendorVenues;
  },
  getFeaturedVenues: async () => {
    const { data } = await client.query({
      query: GET_FEATURED_VENUES,
    });

    return data.featuredVenues;
  },
  getNonFeaturedVenues: async () => {
    const { data } = await client.query({
      query: GET_NON_FEATURED_VENUES,
    });

    return data.nonFeaturedVenues;
  },
  // Deletes a venue through the GraphQL API.
  deleteVenue: async (id: number) => {
    const { data } = await client.mutate({
      mutation: DELETE_VENUE,
      variables: {
        venueId: String(id),
      },
    });

    if (!data.deleteVenue) {
      throw new Error("Venue deletion failed");
    }

    return true;
  },
  discountVenue : async (id : number) => {
    const { data } = await client.mutate({
      mutation : DISCOUNT_VENUE,
      variables : {
        venueId : String(id)
      }
    });

    return data.discountVenue;
  },
  removedDiscountFromVenue : async (id : number) => {
    const {data} = await client.mutate({
      mutation : REMOVE_DISCOUNT_FROM_VENUE,
      variables : {
        venueId : String(id)
      }
    });

    return data.removeDiscountFromVenue;
  },
  // Gets one venue by id from the GraphQL API.
  getOneVenue: async (id: number) => {
    const { data } = await client.query({
      query: GET_ONE_VENUE,
      variables: {
        getOneVenueId: String(id),
      },
    });
    return data.getOneVenue;
  }
};

export const ReportFetcherServices = {
  getThreeMostPopularVenuesAndTimings: async () => {
    const { data } = await client.query({
      query: GET_THREE_MOST_POPULAR_VENUES_AND_TIMINGS,
    });

    return data.getThreeMostPopularVenuesAndTimings;
  },

  getThreeMostPopularApplicantsAndTheirSuccessRate : async () => {
    const { data } = await client.query({
      query : GET_THREE_MOST_SUCCESSFULL_APPLICANTS
    });

    return data.getThreeMostPopularApplicantsAndTheirSuccessRate;
  }
}

export const UserFetcherServices = {
  // Gets all vendors for admin selection fields.
  getAllVendors: async () => {
    const { data } = await client.query({ query: GET_ALL_VENDORS });

    return data.vendors;
  },
};

export const AuthFetcherServices = {
  // Logs an admin user in through the GraphQL API.
  login: async (name: string, password: string) => {
    const { data } = await client.mutate({
      mutation: LOGIN,
      variables: {
        name: name,
        password: password,
      },
    });

    return data.login;
  },
};
