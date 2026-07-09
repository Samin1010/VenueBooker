export type AcceptedChartRow = {
  venueName: string;
  [hirerName: string]: string | number;
};

export type RejectedHirersVenue = {
  venueName: string;
  hirers: string[];
};

// Chart 1: hirer tallies per venue (bar chart)
export type PerVenueHirerTallyRow = {
  venueName: string;
  [hirerName: string]: string | number;
};

// Chart 2: stacked bar chart — combined totals across all venues per hirer
export type CombinedHirerTallyRow = {
  hirerName: string;
  [venueName: string]: string | number;
};

// Chart 3: pie chart — most/least active hirers
export type HirerTallyPieEntry = {
  id: number;
  value: number;
  label: string;
};

export type HirerReport = {
  acceptedChartData: {
    dataset: AcceptedChartRow[];
    hirerNames: string[];
  };
  rejectedHirersPerVenue: RejectedHirersVenue[];
  // New chart data
  perVenueChart: {
    dataset: PerVenueHirerTallyRow[];
    hirerNames: string[];
  };
  combinedStackedChart: {
    dataset: CombinedHirerTallyRow[];
    venueNames: string[];
  };
  pieChart: {
    mostActive: HirerTallyPieEntry[];
    leastActive: HirerTallyPieEntry[];
  };
};