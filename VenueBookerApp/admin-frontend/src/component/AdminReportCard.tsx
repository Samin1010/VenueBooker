import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  SimpleGrid,
  Button,
  VStack,
  HStack,
  Badge,
  Divider,
} from "@chakra-ui/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";

import { BarChart } from "@mui/x-charts/BarChart";

import type { PopularVenueReport, ApplicantReport } from "@admin-shared/types";

type Props = {
  popularVenues: PopularVenueReport[];
  activeApplicants: ApplicantReport[];
};

export default function AdminReportsPage({
  popularVenues,
  activeApplicants,
}: Props) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imageData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imageWidth = pdfWidth;
    // the ratio is always the same irrespective of how much it is scaled
    //new image height/ new width = original height / original width
    const imageHeight = (canvas.height * imageWidth) / canvas.width;

    let heightLeft = imageHeight;
    let position = 0;

    pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imageHeight;
      pdf.addPage();
      pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save("admin-reports.pdf");
  };

  return (
    <Box p={6}>
      <HStack justifyContent="space-between" mb={6}>
        <Box>
          <Heading size="lg">Admin Reports</Heading>
          <Text color="gray.600">
            Infographic report for venue popularity and applicant activity.
          </Text>
        </Box>

        <Button colorScheme="purple" onClick={handleDownloadPdf}>
          Download PDF
        </Button>
      </HStack>

      <Box ref={reportRef} bg="white" p={6}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card shadow="md" borderRadius="xl">
            <CardHeader>
              <Heading size="md">Top 3 Most Popular Venues</Heading>
              <Text color="gray.600" mt={1}>
                Shows the venues with the highest number of successful bookings.
              </Text>
            </CardHeader>

            <CardBody>
              <BarChart
                height={300}
                xAxis={[
                  {
                    scaleType: "band",
                    data: popularVenues.map((item) => item.popular_venue),
                    label: "Venue",
                  },
                ]}
                yAxis={[
                  {
                    label: "Total Bookings",
                  },
                ]}
                series={[
                  {
                    data: popularVenues.map((item) => item.totalBookings),
                    label: "Total Bookings",
                  },
                ]}
              />

              <Divider my={4} />

              <VStack align="stretch" spacing={3}>
                {popularVenues.map((venue) => (
                  <Box
                    key={venue.popular_venue}
                    p={3}
                    borderWidth="1px"
                    borderRadius="lg"
                  >
                    <HStack justifyContent="space-between">
                      <Text fontWeight="bold">{venue.popular_venue}</Text>
                      <Badge colorScheme="purple">
                        {venue.totalBookings} bookings
                      </Badge>
                    </HStack>

                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Most popular slot: {venue.popular_weekday} at{" "}
                      {venue.popular_time} for {venue.popular_duration} hours
                    </Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          <Card shadow="md" borderRadius="xl">
            <CardHeader>
              <Heading size="md">Top 3 Most Active Applicants</Heading>
              <Text color="gray.600" mt={1}>
                Compares submitted applications against successful bookings.
              </Text>
            </CardHeader>

            <CardBody>
              <BarChart
                height={300}
                xAxis={[
                  {
                    scaleType: "band",
                    data: activeApplicants.map((item) => item.applicant_name),
                    label: "Applicant",
                  },
                ]}
                yAxis={[
                  {
                    label: "Count",
                  },
                ]}
                series={[
                  {
                    data: activeApplicants.map(
                      (item) => item.totalApplications,
                    ),
                    label: "Applications Submitted",
                  },
                  {
                    data: activeApplicants.map(
                      (item) => item.successfulBookings,
                    ),
                    label: "Successful Bookings",
                  },
                ]}
              />

              <Divider my={4} />

              <VStack align="stretch" spacing={3}>
                {activeApplicants.map((applicant) => (
                  <Box
                    key={applicant.applicant_name}
                    p={3}
                    borderWidth="1px"
                    borderRadius="lg"
                  >
                    <HStack justifyContent="space-between">
                      <Text fontWeight="bold">{applicant.applicant_name}</Text>
                      <Badge colorScheme="green">
                        {applicant.success_rate}% success
                      </Badge>
                    </HStack>

                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {applicant.successfulBookings} successful bookings from{" "}
                      {applicant.totalApplications} submitted applications.
                    </Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
