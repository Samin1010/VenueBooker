import { createClient } from "graphql-ws";

// Create WebSocket client
export const wsClient = createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL ?? "ws://localhost:4000/graphql",
});

export const SUBCRIPTION_DISCOUNTED_VENUE = `
subscription DiscountedVenue {
  discountedVenue {
    description
    capacity
    discounted_percentage
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

export const SUBSCRIPTION_REMOVED_DISCOUNTED_VENUE = `
  subscription RemovedDiscountedVenue {
    removedDiscountedVenue {
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
    }
  }
`;
