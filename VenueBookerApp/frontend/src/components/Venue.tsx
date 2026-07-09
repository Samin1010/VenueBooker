import { VenueType } from "@/types/VenueType";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Select,
  SimpleGrid,
  Center,
  Spinner,
  Text,
  VStack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { MapPin, Users, Star, LucideIcon } from "lucide-react";
import {
  Trophy,
  UtensilsCrossed,
  Music2,
  Guitar,
  Cake,
  HeartHandshake,
} from "lucide-react";
// import FavoriteButton from "./FavouriteButton";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { PreferenceType } from "@/types/PreferenceType";
import { useRouter } from "next/router";
import Link from "next/link";
import { UserFetcherService } from "@/services/users.api";
import { Suitability } from "@/types/SuitabilityType";

export default function Venue({
  id,
  name,
  location,
  capacity,
  price,
  image,
  description,
  rating,
  preferences,
  is_featured,
  discounted_percentage,
  onTogglePreferences,
  suitabilities,
  onDelete,
}: Omit<VenueType, "vendor_id" | "applications"> & {
  total: number;
  preferences: PreferenceType[] | null;
  onTogglePreferences:
    | ((e: React.ChangeEvent<HTMLSelectElement>, venueId: number) => void)
    | null;
  onDelete?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
}) {
  const router = useRouter();
  const totalStars = 5;
  const hasDiscount = discounted_percentage > 0;
  // -- this price assumes that the price is already discounted
  const originalPrice = hasDiscount
    ? price / (1 - discounted_percentage / 100)
    : price;
  const formatPrice = (value: number) =>
    value.toLocaleString("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 2,
    });
  let fullStars: number | undefined;
  let hasHalf: boolean | undefined;
  if (rating) {
    fullStars = Math.floor(rating);
    hasHalf = rating % 1 >= 0.5;
  }
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rank, setRank] = useState<number | string>("none");
  const userFetcherService = useMemo(() => new UserFetcherService(), []);

  const { user } = useAuth();

  const suitabilityIcons: Record<Suitability, LucideIcon> = {
    tennis: Trophy,
    dinner: UtensilsCrossed,
    "classical music": Music2,
    "rock concert": Guitar,
    birthday: Cake,
    wedding: HeartHandshake,
  };

  const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  useEffect(() => {
    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }
    setIsLoading(true);
    if (user.role === "hirer") {
      const fetchRank = async (userId: number, venueId: number) => {
        const rank_ = await userFetcherService.getPreferenceByVenue(
          userId,
          venueId,
        );
        setRank(rank_?.pref_no?.toString() ?? "none");
        setIsLoading(false);
      };
      fetchRank(user.id, id);
    }
    else
    {
      setIsLoading(false);
    }
  }, [id, router, user, userFetcherService]);

  if (!user || isLoading || !router.isReady) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  // since i did not have e.stopPropagation() so event Bublling was happening
  // and so the parent element was getting this venues/id route
  return (
    <Box
      onClick={() => {
        if (user?.role === "hirer") {
          router.push(`/venues/${id}`);
        } else if (user?.role === "vendor") {
          router.push(`/user/vendor/venues/${id}`);
        }
      }}
      maxW="sm"
      rounded="xl"
      borderWidth="1px"
      width="100%"
      overflow="hidden"
      bg="white"
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{
        shadow: "md",
        transform: "translateY(-2px)",
      }}
    >
      {/* IMAGE SECTION - KEEP THIS */}
      <Box position="relative">
        {image.trim() ? (
          <Image
            roundedTop="xl"
            src={image}
            h={48}
            w="full"
            objectFit="cover"
            alt={name}
          />
        ) : (
          <Center roundedTop="xl" h={48} w="full" bg="gray.100">
            <Text color="gray.500">No image available</Text>
          </Center>
        )}

        <Box position="absolute" top="2" right="2">
          {rank && rank !== "none" && (
            <Badge colorScheme="purple">#{rank}</Badge>
          )}
        </Box>
      </Box>

      {/* CONTENT SECTION */}
      <Box p="4">
        <HStack mb={3}>
          <HStack gap="1" fontWeight="medium">
            {rating ? (
              <HStack spacing={1}>
                {Array.from({ length: totalStars }).map((_, i) => {
                  if (i < fullStars!) {
                    return <Star key={i} size={14} fill="gold" color="gold" />;
                  }

                  if (i === fullStars! && hasHalf) {
                    return (
                      <Box
                        key={i}
                        position="relative"
                        width="14px"
                        height="14px"
                      >
                        <Star size={14} color="gray" />
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          width="50%"
                          overflow="hidden"
                        >
                          <Star size={14} fill="gold" color="gold" />
                        </Box>
                      </Box>
                    );
                  }

                  return <Star key={i} size={14} color="gray" />;
                })}
              </HStack>
            ) : null}

            <Text fontWeight="semibold">
              {rating ? (
                rating
              ) : (
                <Text as="span" fontSize="sm" color="gray.400">
                  No rating given
                </Text>
              )}
            </Text>
          </HStack>
        </HStack>

        <VStack align="stretch" spacing={3}>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={hasDiscount ? "red.600" : undefined}
            noOfLines={2}
          >
            {name}
          </Text>

          {hasDiscount && (
            <Alert status="warning" borderRadius="md" mt={2}>
              <AlertIcon />

              <Text fontSize="sm">
                Warning:{" "}
                <Text as="span" color="red.600" fontWeight="bold">
                  {name}
                </Text>{" "}
                is now on sale with{" "}
                <Text as="span" color="red.600" fontWeight="bold">
                  {discounted_percentage}% discount
                </Text>
                !
              </Text>
            </Alert>
          )}

          <VStack align="stretch" spacing={3}>
            {hasDiscount ? (
              <HStack spacing={2} flexWrap="wrap">
                <Text
                  color="gray.500"
                  textDecoration="line-through"
                  whiteSpace="nowrap"
                >
                  {formatPrice(originalPrice)}
                </Text>
                <Text fontWeight="bold" color="red.600" whiteSpace="nowrap">
                  {formatPrice(price)}
                </Text>
              </HStack>
            ) : (
              <Text fontWeight="semibold">{formatPrice(price)}</Text>
            )}

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
              <HStack spacing={1}>
                <MapPin size={14} />
                <Text fontSize="sm" noOfLines={2}>
                  {location}
                </Text>
              </HStack>

              <HStack spacing={1}>
                <Users size={14} />
                <Text fontSize="sm">{capacity}</Text>
              </HStack>
            </SimpleGrid>
          </VStack>

          <Flex wrap="wrap" gap={2}>
            {suitabilities.map((suitability) => {
              const IconComponent = suitabilityIcons[suitability];

              return (
                <HStack
                  key={suitability}
                  bg="purple.100"
                  color="purple.800"
                  px={3}
                  py={1}
                  borderRadius="full"
                  spacing={1}
                  maxW="fit-content"
                >
                  <Text fontSize="sm" fontWeight="medium">
                    {suitability}
                  </Text>

                  {IconComponent && <IconComponent size={14} />}
                </HStack>
              );
            })}
          </Flex>
          <VStack>
            <Text fontSize="sm" color="gray.700" lineHeight="1.6" noOfLines={3}>
              {description}
            </Text>
            <Text flex="1">
              {is_featured && (
                <Badge
                  bg="purple.500"
                  color="white"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="semibold"
                >
                  Featured
                </Badge>
              )}
            </Text>
          </VStack>

          {user?.role === "hirer" ? (
            <VStack align="stretch" spacing={2} pt={2}>
              {preferences !== null && onTogglePreferences !== null && (
                <Select
                  value={rank || "none"}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onTogglePreferences(e, id)}
                >
                  <option value="none">None</option>
                  {ranks.map((elem: number) => (
                    <option key={elem} value={elem}>
                      {elem}
                    </option>
                  ))}
                </Select>
              )}

              <Button
                width="full"
                colorScheme="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/venues/${id}/application`);
                }}
              >
                Apply
              </Button>
            </VStack>
          ) : user?.role === "vendor" ? (
            <VStack align="stretch" spacing={2} pt={2}>
              <Link
                href={`/venues/${id}/time_allocation`}
                onClick={(e) => e.stopPropagation()}
              >
                <Button width="full" colorScheme="purple" variant="outline">
                  Block Venue Slot
                </Button>
              </Link>

              <Link
                href={`/venues/${id}/time_allocated`}
                onClick={(e) => e.stopPropagation()}
              >
                <Button width="full" colorScheme="purple" variant="outline">
                  Unblock Venue Slot
                </Button>
              </Link>

              <Button
                width="full"
                colorScheme="red"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDelete) onDelete(e);
                }}
              >
                Delete
              </Button>

              <Button
                width="full"
                colorScheme="purple"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/user/vendor/venues/${id}`);
                }}
              >
                Change Venue Details
              </Button>
            </VStack>
          ) : null}
        </VStack>
      </Box>
    </Box>
  );
}
