import { useAuth } from "@/context/AuthContext";
import { VenueFetcherService } from "@/services/venues.api";
import { VenueType } from "@/types/VenueType";
import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export default function VenueDetails() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const venueFetcherService = useMemo(() => new VenueFetcherService(), []);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [venue, setVenue] = useState<VenueType | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }

    if (user.role !== "hirer") {
      router.replace("/404");
      return;
    }

    const id = Array.isArray(router.query.id)
      ? router.query.id[0]
      : router.query.id;

    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchVenue = async () => {
      setIsLoading(true);

      try {
        const result = await venueFetcherService.getOneVenue(Number(id));
        setVenue(result);

        if (!result) {
          toast({
            title: "Venue not found",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : String(error));
        toast({
          title: "Could not load venue",
          description: "Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenue();
  }, [router, toast, user, venueFetcherService]);

  if (isLoading || !router.isReady) {
    return (
      <Center minH="60vh">
        <Spinner color="blue.500" />
      </Center>
    );
  }

  if (!venue) {
    return (
      <Center minH="60vh" px={4}>
        <VStack spacing={4}>
          <Heading size="md">Venue not found</Heading>
          <Text color="gray.500">This venue may no longer be available.</Text>
          <Button leftIcon={<ArrowLeft size={16} />} onClick={() => router.back()}>
            Go back
          </Button>
        </VStack>
      </Center>
    );
  }

  const hasDiscount = venue.discounted_percentage > 0;
  const originalPrice = hasDiscount
    ? venue.price / (1 - venue.discounted_percentage / 100)
    : venue.price;
  const formatPrice = (value: number) =>
    value.toLocaleString("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    });

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={{ base: 5, md: 9 }}>
      <Container maxW="6xl">
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<ArrowLeft size={16} />}
          color="gray.600"
          mb={5}
          onClick={() => router.back()}
        >
          Back to venues
        </Button>

        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={0}
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="xl"
          overflow="hidden"
          shadow="sm"
        >
          <Box minH={{ base: "280px", md: "420px", lg: "570px" }}>
            {venue.image.trim() ? (
              <Image
                src={venue.image}
                w="full"
                h="full"
                minH="inherit"
                objectFit="cover"
                alt={venue.name}
              />
            ) : (
              <Center w="full" h="full" minH="inherit" bg="gray.100">
                <Text color="gray.500">No image available</Text>
              </Center>
            )}
          </Box>

          <Flex direction="column" p={{ base: 5, md: 8, lg: 10 }}>
            <Flex wrap="wrap" gap={2} mb={5}>
              {venue.is_featured && (
                <Badge colorScheme="purple" px={2.5} py={1} borderRadius="full">
                  Featured venue
                </Badge>
              )}
              {hasDiscount && (
                <Badge colorScheme="red" px={2.5} py={1} borderRadius="full">
                  {venue.discounted_percentage}% off
                </Badge>
              )}
            </Flex>

            <Heading size={{ base: "lg", md: "xl" }} color="gray.900">
              {venue.name}
            </Heading>

            <HStack mt={3} spacing={4} color="gray.600" flexWrap="wrap">
              <HStack spacing={1.5}>
                <MapPin size={17} />
                <Text fontSize="sm">{venue.location}</Text>
              </HStack>
              <HStack spacing={1.5}>
                <Star size={17} fill="#F6C344" color="#F6C344" />
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  {venue.rating ? venue.rating.toFixed(1) : "Not rated"}
                </Text>
                {venue.num_ratings > 0 && (
                  <Text fontSize="sm" color="gray.500">
                    ({venue.num_ratings})
                  </Text>
                )}
              </HStack>
            </HStack>

            <Divider my={7} />

            <Text
              fontSize="xs"
              fontWeight="bold"
              color="gray.500"
              letterSpacing="wide"
              textTransform="uppercase"
            >
              Venue hire
            </Text>
            <HStack align="baseline" spacing={3} mt={1}>
              <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold">
                {formatPrice(venue.price)}
              </Text>
              {hasDiscount && (
                <Text color="gray.500" textDecoration="line-through">
                  {formatPrice(originalPrice)}
                </Text>
              )}
            </HStack>
            <Text fontSize="sm" color="gray.500">
              Final arrangements are confirmed with the venue owner.
            </Text>

            <SimpleGrid columns={2} spacing={3} my={7}>
              <Box bg="gray.50" borderRadius="lg" p={4}>
                <HStack color="gray.500" spacing={2} mb={1}>
                  <Users size={16} />
                  <Text fontSize="sm">Capacity</Text>
                </HStack>
                <Text fontWeight="semibold">
                  Up to {venue.capacity} guests
                </Text>
              </Box>
              <Box bg="gray.50" borderRadius="lg" p={4}>
                <HStack color="gray.500" spacing={2} mb={1}>
                  <Star size={16} />
                  <Text fontSize="sm">Rating</Text>
                </HStack>
                <Text fontWeight="semibold">
                  {venue.rating ? `${venue.rating.toFixed(1)} out of 5` : "New venue"}
                </Text>
              </Box>
            </SimpleGrid>

            <Button
              as={Link}
              href={`/venues/${venue.id}/application`}
              colorScheme="blue"
              size="lg"
              rightIcon={<ArrowRight size={18} />}
              mt="auto"
            >
              Apply for this venue
            </Button>
          </Flex>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={6}>
          <Box
            gridColumn={{ base: "auto", md: "span 2" }}
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="xl"
            p={{ base: 5, md: 7 }}
          >
            <Heading size="md" mb={4}>
              About this venue
            </Heading>
            <Text color="gray.600" lineHeight="tall" whiteSpace="pre-wrap">
              {venue.description}
            </Text>
          </Box>

          <Box
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="xl"
            p={{ base: 5, md: 7 }}
          >
            <Heading size="md" mb={4}>
              Suitable for
            </Heading>
            <VStack align="stretch" spacing={3}>
              {venue.suitabilities.map((suitability) => (
                <HStack key={suitability} spacing={3}>
                  <Center
                    bg="blue.50"
                    color="blue.600"
                    borderRadius="full"
                    boxSize="24px"
                    flexShrink={0}
                  >
                    <Check size={14} />
                  </Center>
                  <Text textTransform="capitalize" color="gray.700">
                    {suitability}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
