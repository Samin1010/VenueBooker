import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import VenueListing from "@/pages/venues/venue-listing";
import { VenueFetcherService } from "@/services/venues.api";
import { UserFetcherService } from "@/services/users.api";
import type { VenueType } from "@/types/VenueType";
import { ChakraProvider } from "@chakra-ui/react";

const pushMock = jest.fn();

jest.mock("next/router", () => ({
  useRouter: () => ({ isReady: true, query: {}, push: pushMock, replace: jest.fn() }),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1, role: "hirer" } }),
}));

jest.mock("@/services/graphql", () => ({
  SUBCRIPTION_DISCOUNTED_VENUE: "",
  SUBSCRIPTION_REMOVED_DISCOUNTED_VENUE: "",
  wsClient: { subscribe: () => () => undefined },
}));

jest.mock("@/components/Venue", () => {
  return function MockVenue(props: VenueType) {
    return <div data-testid="venue-card">{props.name} {props.location} {props.capacity} {props.price} {props.description}</div>;
  };
});

const venue = {
  id: 1,
  userId: 2,
  name: "Hall A",
  location: "Melbourne",
  capacity: 100,
  price: 500,
  image: "/img.jpg",
  description: "Nice venue",
  rating: 4,
  num_ratings: 1,
  bookedTimes: [],
  suitabilities: [],
  is_featured: false,
  discounted_percentage: 0,
  createdAt: "",
  updatedAt: "",
} as VenueType;

describe("VenueListing Page", () => {
  const getAllVenues = jest.spyOn(VenueFetcherService.prototype, "getAllVenues");
  const getAllPreference = jest.spyOn(UserFetcherService.prototype, "getAllPreference");

  beforeEach(() => {
    pushMock.mockReset();
    jest.clearAllMocks();
    getAllPreference.mockResolvedValue([]);
    getAllVenues.mockResolvedValue({ featured_venues: [], non_featured_venues: [venue] });
  });

  const renderPage = () => render(<ChakraProvider><VenueListing /></ChakraProvider>);

  test("displays venues returned by the API", async () => {
    renderPage();
    expect(await screen.findByText(/Hall A/)).toBeInTheDocument();
  });

  test("passes venue details to each venue card", async () => {
    renderPage();
    const card = await screen.findByTestId("venue-card");
    expect(card).toHaveTextContent("Hall A");
    expect(card).toHaveTextContent("Melbourne");
    expect(card).toHaveTextContent("100");
    expect(card).toHaveTextContent("500");
    expect(card).toHaveTextContent("Nice venue");
  });

  test("shows no venues when the API returns empty lists", async () => {
    getAllVenues.mockResolvedValue({ featured_venues: [], non_featured_venues: [] });
    renderPage();
    await waitFor(() => expect(screen.getByText(/no venues/i)).toBeInTheDocument());
  });

  test("reset filter clears the suitability selection back to none", async () => {
    renderPage();

    const suitabilitySelect = (await screen.findAllByRole("combobox"))[0];
    fireEvent.change(suitabilitySelect, { target: { value: "wedding" } });

    expect(suitabilitySelect).toHaveValue("wedding");

    fireEvent.click(screen.getByRole("button", { name: /reset filter/i }));

    await waitFor(() => expect(suitabilitySelect).toHaveValue(""));
  });
});
