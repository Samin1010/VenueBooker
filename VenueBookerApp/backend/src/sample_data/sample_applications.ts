import { Application } from "../entity/Application";
import { DEFAULT_HISTORY } from "./sample_history";

export const DEFAULT_APPLICATIONS: Partial<Application>[] = DEFAULT_HISTORY.map(
  (history) => ({
    eventName: history.eventName,
    expectedGuests: 50,
    date: history.dateOfHire,
    time: "18:00",
    duration: 3,
    vendorReason:
      history.status === "rejected"
        ? "Venue unavailable"
        : "",
    status:
      history.status === "accepted"
        ? "accepted"
        : "rejected"
  })
);
