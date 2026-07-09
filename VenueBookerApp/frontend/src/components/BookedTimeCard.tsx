import { BookedTimeType } from "@/types/BookedTimeType";
import {
  Box,
  Button,
  HStack,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CalendarDays, Clock, Trash2 } from "lucide-react";

export default function BookedTimeCard({
  date,
  duration,
  id,
  time,
  delete_time,
  isDeleting,
}: BookedTimeType & {
  delete_time: (blockId: number) => void | Promise<void>;
  isDeleting: boolean;
}) {
  const formatDate = (value: string) => {
    const parsedDate = new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return value;

    return new Intl.DateTimeFormat("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parsedDate);
  };

  const formatTime = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;

    return new Intl.DateTimeFormat("en-AU", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(2000, 0, 1, hours, minutes));
  };

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      px={{ base: 4, md: 5 }}
      py={4}
      transition="border-color 0.15s ease, box-shadow 0.15s ease"
      _hover={{ borderColor: "gray.300", shadow: "sm" }}
    >
      <Stack
        direction={{ base: "column", sm: "row" }}
        align={{ base: "stretch", sm: "center" }}
        justify="space-between"
        spacing={4}
      >
        <HStack spacing={4}>
          <Box
            display={{ base: "none", md: "grid" }}
            placeItems="center"
            bg="blue.50"
            color="blue.600"
            borderRadius="md"
            boxSize="42px"
            flexShrink={0}
          >
            <CalendarDays size={20} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold" color="gray.800">
              {formatDate(date)}
            </Text>
            <HStack spacing={2} color="gray.600">
              <Clock size={15} />
              <Text fontSize="sm">
                {formatTime(time)} · {duration}{" "}
                {duration === 1 ? "hour" : "hours"}
              </Text>
            </HStack>
          </VStack>
        </HStack>
        <Button
          onClick={() => delete_time(id)}
          isLoading={isDeleting}
          loadingText="Removing"
          leftIcon={<Trash2 size={16} />}
          size="sm"
          variant="ghost"
          color="gray.600"
          alignSelf={{ base: "flex-start", sm: "center" }}
          _hover={{ bg: "red.50", color: "red.600" }}
        >
          Remove
        </Button>
      </Stack>
    </Box>
  );
}
