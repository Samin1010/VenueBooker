import AcceptanceRate from "@/components/HirerAcceptanceRate";
import CredibilityMeter from "@/components/CredibilityMeter";
import VenueHistoryCard from "@/components/VenueHistoryCard";
import { useAuth } from "@/context/AuthContext";
import { UserFetcherService } from "@/services/users.api";
import { HirerHistoryType } from "@/types/HirerHistoryType";
import { UserDocument } from "@/types/UserDocument";
import { UserType } from "@/types/UserType";
import {
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

type Files = {
  identity: UserDocument | null;
  insurance: UserDocument | null;
  risk: UserDocument | null;
  alcohol: UserDocument | null;
};

type DocumentType = keyof Files;

const EMPTY_FILES: Files = {
  identity: null,
  insurance: null,
  risk: null,
  alcohol: null,
};

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  identity: "Proof of Identity",
  insurance: "Public Liability Insurance",
  risk: "Risk Acknowledgement Form",
  alcohol: "Alcohol Serving Permit",
};

function formatDate(date: string | undefined) {
  if (!date) return "Not available";

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function HirerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const userFetcherService = useMemo(() => new UserFetcherService(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [hirerUser, setHirerUser] = useState<Omit<UserType, "password"> | null>(null);
  const [hirerDocs, setHirerDocs] = useState<Files>(EMPTY_FILES);
  const [hirerHistory, setHirerHistory] = useState<HirerHistoryType[]>([]);

  useEffect(() => {
    if (!router.isReady) return;

    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }

    if (user.role !== "vendor") {
      router.replace("/404");
      return;
    }

    const hirerId = Number(router.query.hirerId);
    if (!Number.isInteger(hirerId) || hirerId <= 0) {
      router.replace("/404");
      return;
    }

    const loadHirerDashboard = async () => {
      setIsLoading(true);

      const [selectedHirer, history, documents] = await Promise.all([
        userFetcherService.getUser(hirerId),
        userFetcherService.getHirerHistory(hirerId),
        userFetcherService.getUserDocuments(hirerId),
      ]);

      if (!selectedHirer || selectedHirer.role !== "hirer") {
        router.replace("/404");
        return;
      }

      const files = documents.reduce<Files>((result, document) => {
        if (document.file_type && document.file_type in result) {
          result[document.file_type as DocumentType] = document;
        }
        return result;
      }, { ...EMPTY_FILES });

      setHirerUser(selectedHirer);
      setHirerHistory(history);
      setHirerDocs(files);
      setIsLoading(false);
    };

    loadHirerDashboard();
  }, [router, router.isReady, router.query.hirerId, user, userFetcherService]);

  const handleViewFile = (file: UserDocument | null) => {
    if (!file?.data) return;

    const [metadata, encodedData] = file.data.split(",");
    if (!metadata || !encodedData) return;

    const mimeType = metadata.split(":")[1]?.split(";")[0];
    if (!mimeType) return;

    const byteString = atob(encodedData);
    const bytes = new Uint8Array(byteString.length);

    for (let index = 0; index < byteString.length; index += 1) {
      bytes[index] = byteString.charCodeAt(index);
    }

    const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  if (isLoading || !router.isReady) {
    return (
      <Center minH="50vh">
        <Spinner />
      </Center>
    );
  }

  if (!hirerUser) return null;

  const uploadedDocuments = Object.values(hirerDocs).filter(Boolean).length;
  const credibility = uploadedDocuments * 25;
  const acceptedBookings = hirerHistory.filter(
    (item) => item.status === "accepted",
  ).length;
  const acceptanceRate =
    hirerHistory.length === 0 ? 0 : acceptedBookings / hirerHistory.length;
  const differentVenues = new Set(
    hirerHistory.map((item) => item.venueName),
  ).size;
  const ratedEvents = hirerHistory.filter((item) => item.rating != null);
  const averageStarRating =
    ratedEvents.length === 0
      ? "n/a"
      : (
          ratedEvents.reduce((sum, item) => sum + (item.rating ?? 0), 0) /
          ratedEvents.length
        ).toFixed(1);
  const fullName =
    `${hirerUser.first_name} ${hirerUser.last_name}`.trim() ||
    hirerUser.username;

  return (
    <Box w="100%" p={{ base: 4, md: 6, lg: 8 }}>
      <VStack align="stretch" spacing={6}>
        <Flex
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
          justify="space-between"
        >
          <Box>
            <Button
              mb={3}
              onClick={() => router.back()}
              size="sm"
              variant="ghost"
            >
              <ArrowLeft/>
              Back
            </Button>
            <HStack spacing={3}>
              <Heading size="lg">{fullName}</Heading>
              <Badge colorScheme="purple">Hirer profile</Badge>
            </HStack>
            <Text color="gray.500" mt={1}>
              @{hirerUser.username}
            </Text>
          </Box>
          <HStack
            bg="white"
            borderRadius="12px"
            boxShadow="md"
            p={4}
            spacing={5}
          >
            <Box textAlign="center">
              <Text fontSize="sm" fontWeight="semibold" mb={2}>
                Credibility
              </Text>
              <CredibilityMeter value={credibility} />
            </Box>
            <Box textAlign="center">
              <Text fontSize="sm" fontWeight="semibold" mb={2}>
                Acceptance
              </Text>
              <AcceptanceRate
                userId={hirerUser.id}
                percentage={acceptanceRate}
              />
            </Box>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Box bg="white" borderRadius="12px" boxShadow="md" p={5}>
            <Heading size="md" mb={5}>
              Profile details
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={5}>
              <ProfileDetail label="First name" value={hirerUser.first_name} />
              <ProfileDetail label="Last name" value={hirerUser.last_name} />
              <ProfileDetail label="Email" value={hirerUser.email} />
              <ProfileDetail
                label="Phone number"
                value={hirerUser.phone || "Not provided"}
              />
              <ProfileDetail
                label="Member since"
                value={formatDate(hirerUser.createdAt)}
              />
              <ProfileDetail label="Account type" value="Hirer" />
            </SimpleGrid>
          </Box>

          <Box bg="white" borderRadius="12px" boxShadow="md" p={5}>
            <Flex align="center" justify="space-between" mb={5}>
              <Box>
                <Heading size="md">Documents</Heading>
                <Text color="gray.500" fontSize="sm" mt={1}>
                  {uploadedDocuments} of 4 documents uploaded
                </Text>
              </Box>
              <Badge colorScheme={credibility === 100 ? "green" : "orange"}>
                {credibility}% complete
              </Badge>
            </Flex>
            <VStack align="stretch" divider={<Divider />} spacing={0}>
              {(Object.keys(DOCUMENT_LABELS) as DocumentType[]).map((type) => {
                const document = hirerDocs[type];
                return (
                  <Flex
                    key={type}
                    align={{ base: "flex-start", sm: "center" }}
                    direction={{ base: "column", sm: "row" }}
                    gap={3}
                    justify="space-between"
                    py={3}
                  >
                    <Box>
                      <Text fontWeight="semibold">{DOCUMENT_LABELS[type]}</Text>
                      <Text color="gray.500" fontSize="sm">
                        {document?.file_name || "Not uploaded"}
                      </Text>
                    </Box>
                    {document ? (
                      <Button
                        onClick={() => handleViewFile(document)}
                        size="sm"
                        variant="outline"
                      >
                        View document
                      </Button>
                    ) : (
                      <Badge colorScheme="gray">Unavailable</Badge>
                    )}
                  </Flex>
                );
              })}
            </VStack>
          </Box>
        </SimpleGrid>

        <Divider />

        <Box>
          <Heading size="lg">Hiring history</Heading>
          <Text color="gray.500" mt={1}>
            Previous venue bookings and activity for this hirer.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
          <StatCard label="Total events" value={hirerHistory.length} />
          <StatCard label="Accepted bookings" value={acceptedBookings} />
          <StatCard label="Different venues" value={differentVenues} />
          <StatCard label="Average rating" value={averageStarRating} />
        </SimpleGrid>

        {hirerHistory.length === 0 ? (
          <Center
            bg="white"
            borderRadius="12px"
            boxShadow="sm"
            minH="160px"
            p={6}
          >
            <Text color="gray.500">No past hiring history available.</Text>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {hirerHistory.map((item) => (
              <VenueHistoryCard
                key={item.id}
                id={item.id}
                hirerId={item.hirerId}
                venueName={item.venueName}
                location={item.location}
                eventName={item.eventName}
                dateOfHire={item.dateOfHire}
                rating={item.rating}
                status={item.status}
                vendorId={item.vendorId}
                venueId={item.venueId}
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Box>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text color="gray.500" fontSize="sm">
        {label}
      </Text>
      <Text fontWeight="semibold" mt={1} overflowWrap="anywhere">
        {value}
      </Text>
    </Box>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Box bg="white" borderRadius="12px" boxShadow="md" p={4}>
      <Text color="gray.500" fontSize="sm">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" mt={1}>
        {value}
      </Text>
    </Box>
  );
}
