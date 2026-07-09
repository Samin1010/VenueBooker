import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ApplicationPage from "@/pages/venues/[id]/application";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { VenueFetcherService } from "@/services/venues.api";
import { ApplicationFetcherService } from "@/services/application.api";
import type { VenueType } from "@/types/VenueType";

jest.mock("@/context/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;
const mockReplace = jest.fn();
const mockBack = jest.fn();

const futureDate = new Date();
futureDate.setMonth(futureDate.getMonth() + 2);
futureDate.setDate(20);
const dateString = [
  futureDate.getFullYear(),
  String(futureDate.getMonth() + 1).padStart(2, "0"),
  String(futureDate.getDate()).padStart(2, "0"),
].join("-");

const venue = {
  id: 1,
  capacity: 180,
  bookedTimes: [{ id: 1, venueId: 1, date: dateString, time: "10:00", duration: 3 }],
} as unknown as VenueType;

const unavailableTimes = [
  { date: dateString, time: "10:00", duration: 3 },
  { date: dateString, time: "18:00", duration: 2 },
];

function fillForm(time = "15:00", duration = "3") {
  fireEvent.change(screen.getByLabelText(/event name/i), { target: { value: "Birthday Party" } });
  fireEvent.change(screen.getByLabelText(/expected guests/i), { target: { value: "50" } });
  fireEvent.change(screen.getByLabelText(/day/i), { target: { value: String(futureDate.getDate()) } });
  fireEvent.change(screen.getByLabelText(/month/i), { target: { value: String(futureDate.getMonth() + 1) } });
  fireEvent.change(screen.getByLabelText(/year/i), { target: { value: String(futureDate.getFullYear()) } });
  fireEvent.change(screen.getByLabelText(/start time/i), { target: { value: time } });
  fireEvent.change(screen.getByLabelText(/duration \(hours\)/i), { target: { value: duration } });
}

describe("ApplicationPage", () => {
  const getOneVenue = jest.spyOn(VenueFetcherService.prototype, "getOneVenue");
  const getAvailability = jest.spyOn(VenueFetcherService.prototype, "getAvailability");
  const addOne = jest.spyOn(ApplicationFetcherService.prototype, "addOne");

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ isReady: true, query: { id: "1" }, replace: mockReplace, back: mockBack });
    mockedUseAuth.mockReturnValue({ user: { id: 2, role: "hirer" } });
    getOneVenue.mockResolvedValue(venue);
    getAvailability.mockResolvedValue(unavailableTimes);
    addOne.mockResolvedValue({ success: true, message: "Submitted" });
  });

  test("loads the venue and renders the application form", async () => {
    render(<ApplicationPage />);
    expect(await screen.findByLabelText(/event name/i)).toBeInTheDocument();
    expect(getOneVenue).toHaveBeenCalledWith(1);
    expect(getAvailability).toHaveBeenCalledWith(1);
  });

  test("redirects signed-out users and vendors", async () => {
    mockedUseAuth.mockReturnValue({ user: null });
    const { unmount } = render(<ApplicationPage />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/auth/sign-in"));
    unmount();

    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({ user: { id: 3, role: "vendor" } });
    render(<ApplicationPage />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/404"));
  });

  test("validates capacity after venue loading", async () => {
    render(<ApplicationPage />);
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.change(screen.getByLabelText(/expected guests/i), { target: { value: "181" } });
    expect(screen.getByText("At most 180 allowed")).toBeInTheDocument();
  });

  test("validates the two-to-ten hour duration rule", async () => {
    render(<ApplicationPage />);
    await screen.findByLabelText(/duration \(hours\)/i);
    fireEvent.change(screen.getByLabelText(/duration \(hours\)/i), { target: { value: "1" } });
    expect(screen.getByText("Duration must be between 2–10 hours")).toBeInTheDocument();
  });

  test("allows selecting today so a future time today can be entered", async () => {
    const today = new Date();
    render(<ApplicationPage />);
    await screen.findByLabelText(/day/i);
    fireEvent.change(screen.getByLabelText(/day/i), { target: { value: String(today.getDate()) } });
    fireEvent.change(screen.getByLabelText(/month/i), { target: { value: String(today.getMonth() + 1) } });
    fireEvent.change(screen.getByLabelText(/year/i), { target: { value: String(today.getFullYear()) } });

    expect(screen.queryByText("Date must be in the future")).not.toBeInTheDocument();
  });

  test("submits a valid application through the API and clears the form", async () => {
    render(<ApplicationPage />);
    await screen.findByLabelText(/event name/i);
    fillForm("15:00", "2");
    fireEvent.click(screen.getByRole("button", { name: /submit application/i }));

    await waitFor(() => expect(addOne).toHaveBeenCalledWith(expect.objectContaining({
      venueId: 1,
      userId: 2,
      date: dateString,
      time: "15:00",
      duration: 2,
      expectedGuests: 50,
    })));
    expect(screen.getByLabelText(/event name/i)).toHaveValue("");
  });

  test("rejects an application overlapping a blocked venue time", async () => {
    render(<ApplicationPage />);
    await screen.findByLabelText(/event name/i);
    fillForm("11:00", "3");
    fireEvent.click(screen.getByRole("button", { name: /submit application/i }));
    await waitFor(() => expect(addOne).not.toHaveBeenCalled());
  });

  test("rejects an application overlapping an accepted application", async () => {
    render(<ApplicationPage />);
    await screen.findByLabelText(/event name/i);
    fillForm("19:00", "2");
    fireEvent.click(screen.getByRole("button", { name: /submit application/i }));
    await waitFor(() => expect(addOne).not.toHaveBeenCalled());
  });

  test("keeps the form populated when the API rejects submission", async () => {
    addOne.mockResolvedValue({ success: false, message: "Unavailable" });
    render(<ApplicationPage />);
    await screen.findByLabelText(/event name/i);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /submit application/i }));
    await waitFor(() => expect(addOne).toHaveBeenCalled());
    expect(screen.getByLabelText(/event name/i)).toHaveValue("Birthday Party");
  });

  test("calls router.back from the back button", async () => {
    render(<ApplicationPage />);
    await screen.findByLabelText(/event name/i);
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(mockBack).toHaveBeenCalled();
  });
});
