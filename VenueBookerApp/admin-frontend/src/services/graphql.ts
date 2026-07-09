import { gql } from "@apollo/client";

export const GET_ONE_VENUE = gql`
  query GetOneVenue($getOneVenueId: ID!) {
    getOneVenue(id: $getOneVenueId) {
      bookedTimes {
        date
        duration
        id
        time
      }
      capacity
      description
      discounted_percentage
      id
      image
      is_featured
      location
      name
      num_ratings
      price
      rating
      suitabilities
      userId
    }
  }
`;

export const LOGIN = gql`
  mutation Login($name: String!, $password: String!) {
    login(name: $name, password: $password) {
      id
      username
      email
      role
      phone
    }
  }
`;

export const GET_VENUES = gql`
  query Venues {
    venues {
      capacity
      id
      image
      description
      discounted_percentage
      is_featured
      location
      name
      price
      rating
      suitabilities
      userId
    }
  }
`;

export const CREATE_VENUE = gql`
  mutation CreateVenue($venue: CreateVenueInput!) {
    createVenue(venue: $venue) {
      userId
      description
      discounted_percentage
      capacity
      image
      is_featured
      location
      name
      price
      rating
      suitabilities
    }
  }
`;

export const GET_FEATURED_VENUES = gql`
  query FeaturedVenues {
    featuredVenues {
      capacity
      description
      discounted_percentage
      id
      image
      is_featured
      location
      name
      price
      rating
      suitabilities
      userId
    }
  }
`;

export const GET_NON_FEATURED_VENUES = gql`
  query NonFeaturedVenues {
    nonFeaturedVenues {
      capacity
      description
      discounted_percentage
      id
      image
      is_featured
      location
      name
      price
      rating
      suitabilities
      userId
    }
  }
`;

export const UPDATE_VENUE = gql`
  mutation UpdateVenue($updateVenueId: ID!, $venue: UpdateVenueInput!) {
    updateVenue(id: $updateVenueId, venue: $venue) {
      capacity
      description
      discounted_percentage
      image
      is_featured
      location
      name
      price
      suitabilities
      rating
      id
      num_ratings
      userId
    }
  }
`;

export const DISCOUNT_VENUE = gql`
  mutation DiscountedVenue($venueId: ID!) {
    discountVenue(venueId: $venueId) {
      discounted_percentage
      capacity
      description
      id
      image
      is_featured
      location
      name
      price
      rating
      suitabilities
    }
  }
`;

export const REMOVE_DISCOUNT_FROM_VENUE = gql`
  mutation RemoveDiscountFromVenue($venueId: ID!) {
    removeDiscountFromVenue(venueId: $venueId) {
      discounted_percentage
      description
      id
      image
      is_featured
      location
      name
      price
      rating
      suitabilities
    }
  }
`;

export const DELETE_VENUE = gql`
  mutation DeleteVenue($venueId: ID!) {
    deleteVenue(venueId: $venueId)
  }
`;

export const GET_THREE_MOST_POPULAR_VENUES_AND_TIMINGS = gql`
  query GetThreeMostPopularVenuesAndTimings {
    getThreeMostPopularVenuesAndTimings {
      popular_venue
      popular_weekday
      popular_time
      popular_duration
      totalBookings
    }
  }
`;

export const GET_THREE_MOST_SUCCESSFULL_APPLICANTS = gql`
  query GetThreeMostPopularApplicantsAndTheirSuccessRate {
    getThreeMostPopularApplicantsAndTheirSuccessRate {
      applicant_name
      totalApplications
      successfulBookings
      success_rate
    }
  }
`;

export const GET_VENDOR_VENUES = gql`
  query VendorVenues($id: ID!) {
    vendorVenues(id: $id) {
      id
      name
      location
      capacity
      price
      image
      description
      discounted_percentage
      is_featured
      rating
      num_ratings
      suitabilities
      userId
    }
  }
`;

export const GET_ALL_VENDORS = gql`
  query GetVendors {
    vendors {
      id
      username
    }
  }
`;
