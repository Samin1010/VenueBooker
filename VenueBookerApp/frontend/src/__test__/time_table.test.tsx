import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TimeAllocation from "@/pages/venues/[id]/time_allocation";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { VenueFetcherService } from "@/services/venues.api";
import type { VenueType } from "@/types/VenueType";

jest.mock("@/context/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/components/Calendar", () => {
  return function MockCalendar({ setCurrentDate }: { setCurrentDate: (date: Date) => void }) {
    return <button type="button" onClick={() => setCurrentDate(new Date(2027, 4, 20))}>Mock Calendar</button>;
  };
});

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;
const mockReplace = jest.fn();
const mockBack = jest.fn();
const venue = { id: 1, userId: 2, bookedTimes: [] } as unknown as VenueType;

describe("TimeAllocation", () => {
  const getOneVenue = jest.spyOn(VenueFetcherService.prototype, "getOneVenue");
  const blockATimeSlot = jest.spyOn(VenueFetcherService.prototype, "blockATimeSlot");

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ isReady: true, query: { id: "1" }, replace: mockReplace, back: mockBack });
    mockedUseAuth.mockReturnValue({ user: { id: 2, role: "vendor" } });
    getOneVenue.mockResolvedValue(venue);
    blockATimeSlot.mockResolvedValue({
      success: true,
      bookedTime: {
        id: 1,
        venueId: 1,
        date: "2027-05-20",
        time: "10:00",
        duration: 2,
      },
    });
  });

  test("redirects signed-out users", async () => {
    mockedUseAuth.mockReturnValue({ user: null });
    render(<TimeAllocation />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/auth/sign-in"));
  });

  test("renders after the venue API resolves and supports back navigation", async () => {
    render(<TimeAllocation />);
    await screen.findByText("Mock Calendar");
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(mockBack).toHaveBeenCalled();
  });

  test("redirects when the venue belongs to another vendor", async () => {
    getOneVenue.mockResolvedValue({ ...venue, userId: 99 });
    render(<TimeAllocation />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/404"));
  });

  test("allows clearing the duration without showing a zero-value error", async () => {
    render(<TimeAllocation />);
    const duration = await screen.findByPlaceholderText(/duration/i);
    fireEvent.change(duration, { target: { value: "1" } });
    fireEvent.change(duration, { target: { value: "" } });
    expect(duration).toHaveValue(null);
  });

  test("rejects durations below two hours", async () => {
    render(<TimeAllocation />);
    fireEvent.click(await screen.findByText("Mock Calendar"));
    fireEvent.change(screen.getByPlaceholderText(/start time/i), { target: { value: "10:00" } });
    fireEvent.change(screen.getByPlaceholderText(/duration/i), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: /allocate/i }));
    expect(blockATimeSlot).not.toHaveBeenCalled();
  });

  test("submits a valid time block through the API", async () => {
    render(<TimeAllocation />);
    fireEvent.click(await screen.findByText("Mock Calendar"));
    fireEvent.change(screen.getByPlaceholderText(/start time/i), { target: { value: "10:00" } });
    fireEvent.change(screen.getByPlaceholderText(/duration/i), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: /allocate/i }));
    await waitFor(() => expect(blockATimeSlot).toHaveBeenCalledWith(
      expect.objectContaining({ venueId: 1, time: "10:00", duration: 2 }),
      1,
      2,
    ));
  });
});
