import type { VenueDto, SuitabilityType } from "@admin-shared/types";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Image,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  MapPin,
  Users,
  Star,
  LucideIcon,
  Trophy,
  UtensilsCrossed,
  Music2,
  Guitar,
  Cake,
  HeartHandshake,
  CircleOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useVenueOperationContext } from "@/context/VenueOperationContext";

export default function Venue({
  id,
  name,
  location,
  capacity,
  price,
  image,
  description,
  rating,
  suitabilities,
  is_featured,
  discounted_percentage,
}: Omit<
  VenueDto,
  "vendor_id" | "applications" | "bookedTimes" | "createdAt" | "updatedAt"
>) {
  const router = useRouter();
  
  const { onDelete, onDiscount, onRemoveDiscount ,isLoading } = useVenueOperationContext();

  const totalStars = 5;
  const hasDiscount = discounted_percentage > 0;
  const originalPrice = hasDiscount
    ? price / (1 - discounted_percentage / 100)
    : price;
  const formatPrice = (value: number) =>
    value.toLocaleString("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 2,
    });
  const fullStars = rating ? Math.floor(rating) : 0;
  const hasHalf = rating ? rating % 1 >= 0.5 : false;

  const suitabilityIcons: Record<SuitabilityType, LucideIcon> = {
    tennis: Trophy,
    dinner: UtensilsCrossed,
    "classical music": Music2,
    "rock concert": Guitar,
    birthday: Cake,
    wedding: HeartHandshake,
    none: CircleOff,
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleDiscount = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDiscount(id);
  };

  const handleRemoveDiscount = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    onRemoveDiscount(id);
  };

  return (
    <Box
      onClick={() => {
        router.push(`/venues/${id}`);
      }}
      maxW="sm"
      width={{ base: "100%", sm: "383px", md: "100%" }}
      rounded="xl"
      borderWidth="1px"
      overflow="hidden"
      bg="white"
      boxShadow="sm"
      transition="all 0.2s ease"
      _hover={{
        boxShadow: "md",
        transform: "translateY(-2px)",
      }}
    >
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

        {is_featured && (
          <Badge
            position="absolute"
            top={3}
            right={3}
            bg="purple.500"
            color="white"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="semibold"
            boxShadow="sm"
          >
            Featured
          </Badge>
        )}
      </Box>

      <Box p={4}>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" align="center">
            <HStack spacing={1}>
              {rating ? (
                <>
                  <HStack spacing={1}>
                    {Array.from({ length: totalStars }).map((_, i) => {
                      if (i < fullStars) {
                        return (
                          <Star key={i} size={14} fill="gold" color="gold" />
                        );
                      }

                      if (i === fullStars && hasHalf) {
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

                  <Text fontSize="sm" fontWeight="medium">
                    {rating}
                  </Text>
                </>
              ) : (
                <Text fontSize="sm" color="gray.400" fontWeight="medium">
                  No rating given
                </Text>
              )}
            </HStack>
          </HStack>

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
              <Text fontWeight="semibold" color="gray.800">
                {formatPrice(price)}
              </Text>
            )}

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
              <HStack spacing={1} color="gray.600">
                <MapPin size={14} />
                <Text fontSize="sm" noOfLines={2}>
                  {location}
                </Text>
              </HStack>

              <HStack spacing={1} color="gray.600">
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

          <Text
            fontSize="sm"
            color="gray.600"
            wordBreak="break-word"
            noOfLines={3}
          >
            {description}
          </Text>

          <VStack align="stretch" spacing={2} pt={2}>
            <Button
              bg="red.500"
              color="white"
              _hover={{ bg: "red.600" }}
              rounded="md"
              fontWeight="medium"
              onClick={handleDelete}
              isLoading={isLoading}
            >
              Delete
            </Button>

            {discounted_percentage === 0 ? (
              <Button
                bg="red.500"
                color="white"
                _hover={{ bg: "red.600" }}
                rounded="md"
                fontWeight="medium"
                onClick={handleDiscount}
                isLoading={isLoading}
              >
                Discount
              </Button>
            ) : (
              <Button
                bg="red.500"
                color="white"
                _hover={{ bg: "red.600" }}
                rounded="md"
                fontWeight="medium"
                onClick={handleRemoveDiscount}
                isLoading={isLoading}
              >
                Remove Discount
              </Button>
            )}

            <Button
              bg="#6666FF"
              color="white"
              _hover={{ bg: "#3F4FE0" }}
              rounded="md"
              fontWeight="medium"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/venues/${id}`);
              }}
            >
              Change Venue Details
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}
