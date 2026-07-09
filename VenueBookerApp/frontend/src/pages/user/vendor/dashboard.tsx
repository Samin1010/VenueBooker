import { VenueFetcherService } from "@/services/venues.api";
import { useAuth } from "@/context/AuthContext";
import { VenueType } from "@/types/VenueType";
import {
  Box,
  Center,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ReportFetcherServices } from "@/services/report.api";
import { ApplicationFetcherService } from "@/services/application.api";
import VenueUtilizationChart from "@/components/VenueUtilizationChart";
import type { HirerReport } from "@shared/types";
import type { ApplicationListItem } from "@shared/types/application_payload";

const EMPTY_REPORT: HirerReport = {
  acceptedChartData: { dataset: [], hirerNames: [] },
  rejectedHirersPerVenue: [],
  perVenueChart: { dataset: [], hirerNames: [] },
  combinedStackedChart: { dataset: [], venueNames: [] },
  pieChart: { mostActive: [], leastActive: [] },
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [venues, setVenues] = useState<VenueType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<HirerReport>(EMPTY_REPORT);
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);

  const venueFetcherService = new VenueFetcherService();
  const reportFetcherService = new ReportFetcherServices();
  const applicationFetcherService = new ApplicationFetcherService();

  useEffect(() => {
    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }
    if (user.role !== "vendor") {
      router.replace("/404");
      return;
    }

    setIsLoading(true);

    const fetchAll = async () => {
      const [vendorVenues, vendorApplications] = await Promise.all([
        venueFetcherService.getAllVenuesForVendor(user.id),
        applicationFetcherService.getAllApplications(user.id),
      ]);
      setVenues(vendorVenues);
      setApplications(
        vendorApplications.filter(
          (application) => application.status === "accepted",
        ),
      );
      setIsLoading(false);
    };

    fetchAll();
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    const loadReport = async () => {
      try {
        const data = await reportFetcherService.getReport(user.id);
        if (!data) return;

        // If backend is old and doesn't return new chart fields, derive them
        // from the legacy acceptedChartData so charts still render.
        const perVenueChart = data.perVenueChart ?? {
          dataset: data.acceptedChartData.dataset,
          hirerNames: data.acceptedChartData.hirerNames,
        };

        // Build combinedStackedChart from legacy dataset if missing
        const combinedStackedChart = data.combinedStackedChart ?? (() => {
          const venueNames = data.acceptedChartData.dataset.map((r: any) => r.venueName as string);
          const hirerNames = data.acceptedChartData.hirerNames;
          const hirerMap: Record<string, Record<string, number>> = {};
          data.acceptedChartData.dataset.forEach((row: any) => {
            hirerNames.forEach((hirer: string) => {
              if (!hirerMap[hirer]) hirerMap[hirer] = {};
              hirerMap[hirer][row.venueName] = (row[hirer] as number) || 0;
            });
          });
          const dataset = hirerNames.map((hirer: string) => {
            const entry: Record<string, string | number> = { hirerName: hirer };
            venueNames.forEach((v: string) => { entry[v] = hirerMap[hirer]?.[v] || 0; });
            return entry;
          });
          return { dataset, venueNames };
        })();

        // Build pieChart from legacy dataset if missing
        const pieChart = data.pieChart ?? (() => {
          const totals: Record<string, number> = {};
          data.acceptedChartData.dataset.forEach((row: any) => {
            data.acceptedChartData.hirerNames.forEach((hirer: string) => {
              totals[hirer] = (totals[hirer] || 0) + ((row[hirer] as number) || 0);
            });
          });
          const sorted = Object.entries(totals)
            .map(([label, value], id) => ({ id, label, value }))
            .sort((a, b) => b.value - a.value);
          return {
            mostActive: sorted.slice(0, 3),
            leastActive: [...sorted].reverse().slice(0, 3),
          };
        })();

        setReportData({ ...data, perVenueChart, combinedStackedChart, pieChart });
      } catch (error) {
        console.error("Failed to load report", error);
      }
    };

    loadReport();
  }, [user]);

  if (isLoading || !router.isReady) {
    return (
      <Center h="100vh">
        <Center><Spinner /></Center>
      </Center>
    );
  }

  const { perVenueChart, combinedStackedChart, pieChart } = reportData;

  // Pie chart data — combine most & least, deduplicated by label
  const allPieEntries = [
    ...pieChart.mostActive,
    ...pieChart.leastActive.filter(
      (le) => !pieChart.mostActive.find((ma) => ma.label === le.label)
    ),
  ].map((entry, idx) => ({ ...entry, id: idx }));

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={8}>
        <Heading size="lg">Vendor Dashboard</Heading>

        {/* ── CHANGE 3: Venue utilization over time (line chart) ── */}
        <VenueUtilizationChart applications={applications} />

        {/* ── Chart 1: Hirer tallies per venue (grouped bar chart) ── */}
        <Box bg="white" p={5} borderRadius="12px" boxShadow="md">
          <Heading size="md" mb={2}>
            Hirer Booking Tallies per Venue
          </Heading>
          <Text color="gray.500" fontSize="sm" mb={4}>
            Number of accepted bookings each hirer has made at each of your venues.
          </Text>
          {perVenueChart.dataset.length === 0 ? (
            <Text>No accepted bookings yet.</Text>
          ) : (
            <BarChart
              dataset={perVenueChart.dataset}
              xAxis={[{ scaleType: "band", dataKey: "venueName", label: "Venue" }]}
              yAxis={[{ label: "Bookings" }]}
              series={perVenueChart.hirerNames.map((name) => ({
                dataKey: name,
                label: name,
              }))}
              height={360}
              margin={{ top: 30, right: 30, bottom: 70, left: 60 }}
            />
          )}
        </Box>

        {/* ── Chart 2: Combined stacked bar chart (all venues, per hirer) ── */}
        <Box bg="white" p={5} borderRadius="12px" boxShadow="md">
          <Heading size="md" mb={2}>
            Combined Hirer Totals Across All Venues (Stacked)
          </Heading>
          <Text color="gray.500" fontSize="sm" mb={4}>
            Total accepted bookings per hirer, broken down by venue.
          </Text>
          {combinedStackedChart.dataset.length === 0 ? (
            <Text>No accepted bookings yet.</Text>
          ) : (
            <BarChart
              dataset={combinedStackedChart.dataset}
              xAxis={[{ scaleType: "band", dataKey: "hirerName", label: "Hirer" }]}
              yAxis={[{ label: "Total Bookings" }]}
              series={combinedStackedChart.venueNames.map((vName) => ({
                dataKey: vName,
                label: vName,
                stack: "total",
              }))}
              height={360}
              margin={{ top: 30, right: 30, bottom: 70, left: 60 }}
            />
          )}
        </Box>

        {/* ── Chart 3: Most & least active hirers (pie charts) ── */}
        <Box bg="white" p={5} borderRadius="12px" boxShadow="md">
          <Heading size="md" mb={2}>
            Most &amp; Least Active Hirers
          </Heading>
          <Text color="gray.500" fontSize="sm" mb={4}>
            Hirer names and their total number of accepted bookings across all your venues.
          </Text>
          {allPieEntries.length === 0 ? (
            <Text>No accepted bookings yet.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Heading size="sm" mb={3} textAlign="center" color="green.600">
                  Most Active Hirers
                </Heading>
                {pieChart.mostActive.length === 0 ? (
                  <Text>No data.</Text>
                ) : (
                  <PieChart
                    series={[
                      {
                        data: pieChart.mostActive.map((e, idx) => ({
                          id: idx,
                          value: e.value,
                          label: `${e.label} (${e.value})`,
                        })),
                        highlightScope: { fade: "global", highlight: "item" },
                        innerRadius: 40,
                        paddingAngle: 3,
                        cornerRadius: 4,
                      },
                    ]}
                    height={260}
                  />
                )}
              </Box>
              <Box>
                <Heading size="sm" mb={3} textAlign="center" color="red.500">
                  Least Active Hirers
                </Heading>
                {pieChart.leastActive.length === 0 ? (
                  <Text>No data.</Text>
                ) : (
                  <PieChart
                    series={[
                      {
                        data: pieChart.leastActive.map((e, idx) => ({
                          id: idx,
                          value: e.value,
                          label: `${e.label} (${e.value})`,
                        })),
                        highlightScope: { fade: "global", highlight: "item" },
                        innerRadius: 40,
                        paddingAngle: 3,
                        cornerRadius: 4,
                      },
                    ]}
                    height={260}
                  />
                )}
              </Box>
            </SimpleGrid>
          )}
        </Box>

        {/* ── Existing: Failed applicants by venue ── */}
        <Box bg="white" p={5} borderRadius="12px" boxShadow="md">
          <Heading size="md" mb={4}>
            Failed Applicants by Venue
          </Heading>
          {reportData.rejectedHirersPerVenue.every((v) => v.hirers.length === 0) ? (
            <Text>No 100% rejected hirers found.</Text>
          ) : (
            <VStack align="stretch" spacing={4}>
              {reportData.rejectedHirersPerVenue.map((venue) => (
                <Box key={venue.venueName}>
                  <Text fontWeight="bold" mb={1}>
                    {venue.venueName}
                  </Text>
                  {venue.hirers.length === 0 ? (
                    <Text color="gray.500">None</Text>
                  ) : (
                    <VStack align="start" spacing={1}>
                      {venue.hirers.map((name) => (
                        <Text key={name} color="red.500">
                          • {name}
                        </Text>
                      ))}
                    </VStack>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        {/* ── My Venues ── */}
        <Box bg="white" p={5} borderRadius="12px" boxShadow="md">
          <Heading size="md" mb={4}>
            My Venues
          </Heading>
          {venues.length === 0 ? (
            <Text>No venues found.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {venues.map((venue) => (
                <Box
                  key={venue.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="12px"
                  boxShadow="sm"
                >
                  <Text fontWeight="bold">{venue.name}</Text>
                  <Text>{venue.location}</Text>
                  <Text>Capacity: {venue.capacity ?? "N/A"}</Text>
                  <Text>Price: ${venue.price ?? "N/A"}</Text>
                  <Text>
                    Rating:{" "}
                    {venue.rating !== undefined ? venue.rating : "No rating"}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
