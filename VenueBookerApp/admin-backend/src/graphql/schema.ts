import { gql } from "graphql-tag";

export const typeDefs = gql`
  type UserAccount {
    id: ID!
    first_name: String!
    last_name: String!
    username: String!
    email: String!
    password: String!
    role: String!
    phone: String
    venues: [VenueProperty]!
    createdAt: String!
    updatedAt: String!
  }

  type VenueProperty {
    id: ID!
    name: String!
    location: String!
    capacity: Int!
    price: Float!
    image: String!
    description: String!
    is_featured: Boolean!
    rating: Float
    num_ratings: Int!
    suitabilities: [String!]!
    discounted_percentage: Float!
    userId: Int!
    bookedTimes: [BookedTime!]!
  }

  type BookedTime {
    id: ID!
    date: String!
    time: String!
    duration: Int!
    venueId: Int!
  }

  type VenueApplication {
    id: ID!
    eventName: String!
    expectedGuests: Int!
    date: String!
    time: String!
    duration: Int!
    vendorReason: String!
    status: String!
    createdAt: String!
    updatedAt: String!

    user: UserAccount!
    userId: Int!

    venue: VenueProperty!
    venueId: Int!
  }

  type PopularVenueTimingReport {
    popular_venue: String!
    popular_weekday: String!
    popular_time: String!
    popular_duration: Int!
    totalBookings: Int!
  }

  type PopularApplicantsReport {
    applicant_name : String!
    totalApplications: Int!
    successfulBookings: Int!
    success_rate : Float!
  }


  input CreateVenueInput {
    name: String!
    location: String!
    capacity: Int!
    price: Float!
    image: String
    description: String!
    is_featured: Boolean
    rating: Float
    num_ratings: Int
    suitabilities: [String!]!
    userId : Int!
  }

  input UpdateVenueInput {
    name: String
    location: String
    capacity: Int
    price: Float
    image: String
    description: String
    is_featured: Boolean
    suitabilities: [String!]
    userId : Int
  }

  type Query {
    users: [UserAccount!]!
    user(id: ID!): UserAccount
    hirers: [UserAccount!]!
    vendors: [UserAccount!]!
    venues: [VenueProperty!]!
    featuredVenues: [VenueProperty!]!
    nonFeaturedVenues : [VenueProperty!]!
    vendorVenues(id: ID!): [VenueProperty!]!
    getOneVenue(id : ID!): VenueProperty
    getThreeMostPopularVenuesAndTimings: [PopularVenueTimingReport!]!
    getThreeMostPopularApplicantsAndTheirSuccessRate : [PopularApplicantsReport]!
  }

  type Mutation {
    login(name: String!, password: String!): UserAccount
    createVenue(venue: CreateVenueInput!): VenueProperty
    updateVenue(id : ID!,venue: UpdateVenueInput!): VenueProperty
    deleteVenue(venueId: ID!): Boolean!
    discountVenue(venueId : ID!) : VenueProperty
    removeDiscountFromVenue(venueId : ID!) : VenueProperty
  }

  type Subscription {
    discountedVenue : VenueProperty!
    removedDiscountedVenue : VenueProperty!
  }
`;
//   type Mutation {
//     createUserAccount(name: String!, email: String!): UserAccount!
//     updateUser(id: ID!, name: String, email: String): User
//     deleteUser(id: ID!): Boolean
//   }

//   type Subscription {
//     userCreated: User!
//     userUpdated: User!
//     userDeleted: ID!
//   }
// `;
