
import { Review } from "../entity/Review";
import { DEFAULT_HISTORY } from "./sample_history";

// Do NOT filter out null ratings here: seedDatabase pairs DEFAULT_REVIEWS[i]
// with savedApplications[i] by index, so the arrays must stay aligned with
// DEFAULT_HISTORY (which DEFAULT_APPLICATIONS is also derived from).
// Null ratings are skipped inside seedDatabase instead.
export const DEFAULT_REVIEWS: Partial<Review>[] = DEFAULT_HISTORY.map(
  (history) => ({
    rating: history.rating ?? undefined,
  }),
);