export type PopularVenueReport = {
  popular_venue: string;
  popular_weekday: string;
  popular_time: string;
  popular_duration: number;
  totalBookings: number;
};

export type ApplicantReport = {
  applicant_name: string;
  totalApplications: number;
  successfulBookings: number;
  success_rate: number;
};