import Application from "@/types/ApplicationType";
import {
  Box,
  Text,
  Badge,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";


export default function ApplicationCard(props: Omit<Application,"venueId"> & {venueName : string , hirerName : string, hirerRating: number | null}) {
  const statusColor = {
    pending: "yellow",
    accepted: "green",
    approved: "green",
    rejected: "red",
  };

  const router = useRouter();

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="xl"
      shadow="sm"
      _hover={{ shadow: "md", cursor: "pointer" }}
      onClick = {() => {
        router.push(`/booking/applications/${props.id}`)
      }}
    >
        <VStack align="start" spacing={1}>
          <HStack justify="space-between" w="100%">
            <Text fontWeight={"bold"}>{props.venueName}</Text>
            <Text fontWeight="bold">{props.eventName}</Text>
            <Badge colorScheme={statusColor[props.status]}>
              {props.status}
            </Badge>
          </HStack>

          <Text fontSize="sm" color="gray.600">
            {new Date(props.date).toDateString()} • {props.time}
          </Text>

          <Text fontSize="sm">
            {props.hirerName} • {props.expectedGuests} ppl
          </Text>

          <Text fontSize="sm" color="gray.600">
            Hirer rating: {props.hirerRating === null ? "Not rated" : props.hirerRating.toFixed(1)}
          </Text>

          <HStack>
            <Text fontSize="sm" color="gray.500">
                {props.venueName}
            </Text>

            <Text fontSize="sm" color="gray.500">
                {props.duration}
            </Text>
          </HStack>
          
        </VStack>
    </Box>
  );
}
