import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { Star } from "lucide-react";
import { HirerHistoryType } from "@/types/HirerHistoryType";

type VenueHistoryCardProps = HirerHistoryType;

export default function VenueHistoryCard({
  venueName,
  location,
  eventName,
  dateOfHire,
  rating,
  status
}: VenueHistoryCardProps) {
  const totalStars = 5;
  const fullStars = !rating? 0 : Math.floor(rating);
  const hasHalf = !rating? 0 : rating % 1 >= 0.5;

  return (
    <Box
      bg="white"
      p={5}
      borderRadius="12px"
      boxShadow="md"
      w="100%"
    >
      <VStack align="start" spacing={3}>
        <HStack gap="1" fontWeight="medium">
          <HStack spacing={1}>
            {Array.from({ length: totalStars }).map((_, i) => {
              if (i < fullStars) {
                return <Star key={i} size={14} fill="gold" color="gold" />;
              }

              if (i === fullStars && hasHalf) {
                return (
                  <Box key={i} position="relative" width="14px" height="14px">
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

          <Text>{rating ?? "Not rated"}</Text>
        </HStack>

        <Text fontWeight="bold" fontSize="lg">
          {venueName}
        </Text>

        <Text color="gray.600">{location}</Text>

        <Text>
          <strong>Event:</strong> {eventName}
        </Text>

        <Text>
          <strong>Date of Hire:</strong> {dateOfHire}
        </Text>
        <Text><strong>Status:</strong> {status}</Text>
      </VStack>
    </Box>
  );
}
