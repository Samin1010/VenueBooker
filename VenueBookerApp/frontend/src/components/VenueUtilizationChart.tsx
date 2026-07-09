import React, { useMemo, useState } from "react";
import { Box, Button, ButtonGroup, Heading, Text } from "@chakra-ui/react";
import { LineChart } from "@mui/x-charts/LineChart";
import type { ApplicationListItem } from "@shared/types/application_payload";

// Time ranges the vendor can "zoom" to
type TimeRange = "week" | "month" | "lastMonth" | "all";

const RANGE_OPTIONS: Array<{ key: TimeRange; label: string }> = [
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "all", label: "All Time" },
];

type Props = {
  applications: ApplicationListItem[];
};

// Normalises whatever the API returns for a date ("2026-06-12",
// ISO datetime string, or Date) down to a local Date at midnight.
function toDateOnly(value: unknown): Date | null {
  const raw = String(value ?? "").slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return null;
  }

  const [year, month, day] = raw.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export default function VenueUtilizationChart({ applications }: Props) {
  const [range, setRange] = useState<TimeRange>("month");

  //Only accepted applications count towards utilization.
  const acceptedApplications = useMemo(
    () =>
      applications
        .map((application) => ({
          date: toDateOnly(application.date),
          duration: Number(application.duration) || 0,
        }))
        .filter(
          (application): application is { date: Date; duration: number } =>
            application.date !== null,
        ),
    [applications],
  );

  const { labels, values, totalHours } = useMemo(() => {
    const today = startOfDay(new Date());

    let bucketStarts: Date[] = [];
    let bucketLabels: string[] = [];
    let monthly = false;

    if (range === "week") {
      // Last 7 days including today.
      for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        bucketStarts.push(day);
      }
      bucketLabels = bucketStarts.map(formatDayLabel);
    } else if (range === "month" || range === "lastMonth") {
      const offset = range === "month" ? 0 : -1;
      const monthStart = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      const daysInMonth = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0,
      ).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        bucketStarts.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), day));
      }
      bucketLabels = bucketStarts.map(formatDayLabel);
    } else {
      // All time: one bucket per month from the earliest application to now.
      monthly = true;

      const earliest = acceptedApplications.reduce<Date | null>(
        (min, application) =>
          min === null || application.date < min ? application.date : min,
        null,
      );

      const firstMonth = earliest
        ? new Date(earliest.getFullYear(), earliest.getMonth(), 1)
        : new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const cursor = new Date(firstMonth);
      while (cursor <= lastMonth) {
        bucketStarts.push(new Date(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
      }
      bucketLabels = bucketStarts.map(formatMonthLabel);
    }

    const bucketValues = bucketStarts.map(() => 0);

    acceptedApplications.forEach((application) => {
      for (let i = bucketStarts.length - 1; i >= 0; i--) {
        const bucketStart = bucketStarts[i];
        const bucketEnd = new Date(bucketStart);

        if (monthly) {
          bucketEnd.setMonth(bucketEnd.getMonth() + 1);
        } else {
          bucketEnd.setDate(bucketEnd.getDate() + 1);
        }

        if (application.date >= bucketStart && application.date < bucketEnd) {
          bucketValues[i] += application.duration;
          break;
        }
      }
    });

    return {
      labels: bucketLabels,
      values: bucketValues,
      totalHours: bucketValues.reduce((sum, value) => sum + value, 0),
    };
  }, [acceptedApplications, range]);

  return (
    <Box bg="white" p={5} borderRadius="12px" boxShadow="md">
      <Heading size="md" mb={2}>
        Venue Utilization Over Time
      </Heading>
      <Text color="gray.500" fontSize="sm" mb={4}>
        Booked hours from accepted hirer applications across all your venues.
        Use the buttons to zoom in and out of different time periods.
      </Text>

      <ButtonGroup size="sm" isAttached variant="outline" mb={4}>
        {RANGE_OPTIONS.map((option) => (
          <Button
            key={option.key}
            onClick={() => setRange(option.key)}
            colorScheme={range === option.key ? "blue" : "gray"}
            variant={range === option.key ? "solid" : "outline"}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>

      {acceptedApplications.length === 0 ? (
        <Text>No accepted bookings yet.</Text>
      ) : totalHours === 0 ? (
        <Text>No utilization in this period. Try another time range.</Text>
      ) : (
        <LineChart
          xAxis={[
            {
              scaleType: "point",
              data: labels,
              label: range === "all" ? "Month" : "Day",
            },
          ]}
          yAxis={[{ label: "Booked Hours", min: 0 }]}
          series={[
            {
              data: values,
              label: "Booked hours",
              color: "#3182CE",
              area: true,
              showMark: true,
              curve: "monotoneX",
            },
          ]}
          height={320}
          margin={{ top: 30, right: 30, bottom: 60, left: 60 }}
        />
      )}
    </Box>
  );
}
