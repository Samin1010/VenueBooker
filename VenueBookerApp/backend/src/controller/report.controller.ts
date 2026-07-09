import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Venue } from "../entity/Venue";
import { sendError, sendSuccess } from "../types/responses";

export class ReportController {
  private venueRepository = AppDataSource.getRepository(Venue);


  async generateReport(req: Request, res: Response) {
    try {
      // Validate vendorId — sent as query param on GET requests
      const vendorId = Number(req.query.userId);
      if (!vendorId || isNaN(vendorId)) {
        return sendError(res, 400, "BAD_REQUEST", "userId (vendorId) is required");
      }

      // Fetch only venues belonging to this vendor via the user relation
      const venues = await this.venueRepository.find({
        where: { user: { id: vendorId } },
        relations: {
          applications: {
            user: true,
          }
        },
      });

      // Build the per-venue chart and rejected-only hirer list in one pass.
      const perVenueAllHirerNames = new Set<string>();
      const rejectedHirersPerVenue: { venueName: string; hirers: string[] }[] = [];

      const perVenueRawDataset = venues.map((venue) => {
        const acceptedCounts: Record<string, number> = {};
        const acceptedHirerIds = new Set<number>();

        venue.applications.forEach((app) => {
          if (app.status === "accepted") {
            acceptedHirerIds.add(app.user.id);
            perVenueAllHirerNames.add(app.user.username);
            acceptedCounts[app.user.username] = (acceptedCounts[app.user.username] || 0) + 1;
          }
        });

        const rejectedOnlyHirerIds = new Set<number>();
        const rejectedOnlyHirers: string[] = [];
        venue.applications.forEach((app) => {
          if (
            app.status === "rejected" &&
            !acceptedHirerIds.has(app.user.id) &&
            !rejectedOnlyHirerIds.has(app.user.id)
          ) {
            rejectedOnlyHirerIds.add(app.user.id);
            rejectedOnlyHirers.push(app.user.username);
          }
        });

        rejectedHirersPerVenue.push({ venueName: venue.name, hirers: rejectedOnlyHirers });
        return { venueName: venue.name, ...acceptedCounts };
      });

      const perVenueHirerNames = Array.from(perVenueAllHirerNames);
      const perVenueDataset = perVenueRawDataset.map((row) => {
        const filled: Record<string, string | number> = { ...row };
        perVenueHirerNames.forEach((name) => { if (filled[name] === undefined) filled[name] = 0; });
        return filled;
      });

      // ── Chart 2: Combined stacked bar chart (all venues, per hirer) ──────────
      // Each row = one hirer; columns = each venue's booking count for that hirer
      const combinedHirerMap: Record<string, Record<string, number>> = {};
      const allVenueNames = new Set<string>();

      venues.forEach((venue) => {
        allVenueNames.add(venue.name);
        venue.applications.forEach((app) => {
          if (app.status === "accepted") {
            const hirerName = app.user.username;
            if (!combinedHirerMap[hirerName]) combinedHirerMap[hirerName] = {};
            combinedHirerMap[hirerName][venue.name] =
              (combinedHirerMap[hirerName][venue.name] || 0) + 1;
          }
        });
      });

      const venueNames = Array.from(allVenueNames);
      const combinedDataset = Object.entries(combinedHirerMap).map(([hirerName, venueCounts]) => {
        const row: Record<string, string | number> = { hirerName };
        venueNames.forEach((vName) => { row[vName] = venueCounts[vName] || 0; });
        return row;
      });

      // ── Chart 3: Most & least active hirers pie chart ────────────────────────
      // "Active" = total number of accepted bookings across all vendor's venues
      const hirerTotals: Record<string, number> = {};
      venues.forEach((venue) => {
        venue.applications.forEach((app) => {
          if (app.status === "accepted") {
            const name = app.user.username;
            hirerTotals[name] = (hirerTotals[name] || 0) + 1;
          }
        });
      });

      const hirerTotalEntries = Object.entries(hirerTotals)
        .map(([label, value], id) => ({ id, label, value }))
        .sort((a, b) => b.value - a.value);

      const TOP_N = 3;
      const mostActive = hirerTotalEntries.slice(0, TOP_N);
      const leastActive = [...hirerTotalEntries].reverse().slice(0, TOP_N);

      // ── Assemble final report ─────────────────────────────────────────────────
      const report = {
        acceptedChartData: {
          dataset: perVenueDataset,
          hirerNames: perVenueHirerNames,
        },
        rejectedHirersPerVenue,
        perVenueChart: {
          dataset: perVenueDataset,
          hirerNames: perVenueHirerNames,
        },
        combinedStackedChart: {
          dataset: combinedDataset,
          venueNames,
        },
        pieChart: {
          mostActive,
          leastActive,
        },
      };

      return sendSuccess(res, report, "Successfully returned the hirer report");
    } catch (error) {
      console.error("Report generation error:", error);
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Failed to send report");
    }
  }
}
