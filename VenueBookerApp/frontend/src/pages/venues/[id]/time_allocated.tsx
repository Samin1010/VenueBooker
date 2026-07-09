import { VenueFetcherService } from "@/services/venues.api";
import BookedTimeCard from "@/components/BookedTimeCard";
import { useAuth } from "@/context/AuthContext";
import { BookedTimeType } from "@/types/BookedTimeType";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import type { BookedTimeDto } from "@shared/types";
import { ArrowLeft, ArrowLeftIcon, CalendarClock, Clock3, Plus } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

export default function TimeAllocated() {
  const venueFetcherService = useMemo(() => new VenueFetcherService(), []);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const toast = useToast();
  const [bookedTimes, setBookedTimes] = useState<BookedTimeType[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const sortedBookedTimes = [...bookedTimes].sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
  );
  const totalBlockedHours = bookedTimes.reduce(
    (total, booking) => total + booking.duration,
    0,
  );

  const handleDelete = async (blockId: number) => {
    setDeletingId(blockId);
    if (!user || typeof router.query.id !== "string") {
      setDeletingId(null);
      return;
    }

    try {
      const result = await venueFetcherService.unblockATimeSlot(
        Number(router.query.id),
        blockId,
        user.id,
      );

      if (!result.success) {
        toast({
          title: "Could not remove blocked time",
          description: result.message ?? "Please try again.",
          isClosable: true,
          duration: 3000,
          status: "error",
        });
        return;
      }

      setBookedTimes(result.bookedTimes ?? []);
      toast({
        title: "Blocked time removed",
        isClosable: true,
        duration: 3000,
        status: "success",
      });
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : String(error));
      toast({
        title: "Could not remove blocked time",
        description: "Please try again.",
        isClosable: true,
        duration: 3000,
        status: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

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

    setIsLoading(true);
    const fetchTimeSlots = async () => {
      const { id } = router.query;

      if (typeof id !== "string") {
        setIsLoading(false);
        return;
      }
      try {
        const bookedTimes: BookedTimeDto[] =
          await venueFetcherService.getAllTimeSlots(Number(id));
        setBookedTimes(bookedTimes);
      } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : String(error));
        toast({
          title: "Could not load blocked times",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [router, toast, user, venueFetcherService]);

  if (isLoading || !router.isReady) {
    return (
      <Center minH="50vh">
        <Spinner color="blue.500" />
      </Center>
    );
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={{ base: 6, md: 10 }}>
      <Container maxW="5xl">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeftIcon size={16} />}
          color="gray.600"
          mb={5}
          onClick={() => router.back()}
        >
            Back
        </Button>

        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "center" }}
          justify="space-between"
          gap={4}
          mb={8}
        >
          <Box>
            <Text
              color="blue.600"
              fontSize="sm"
              fontWeight="bold"
              letterSpacing="wide"
              textTransform="uppercase"
              mb={1}
            >
              Availability
            </Text>
            <Heading size={{ base: "lg", md: "xl" }} color="gray.900">
              Blocked times
            </Heading>
            <Text color="gray.600" mt={2}>
              Review the times when this venue is unavailable for bookings.
            </Text>
          </Box>
          <Button
            leftIcon={<Plus size={18} />}
            colorScheme="blue"
            alignSelf={{ base: "flex-start", md: "center" }}
            onClick={() =>
              router.push(`/venues/${router.query.id}/time_allocation`)
            }
          >
            Block another time
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={8}>
          <HStack
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="lg"
            p={5}
            spacing={4}
          >
            <Center bg="blue.50" color="blue.600" borderRadius="md" boxSize="42px">
              <CalendarClock size={20} />
            </Center>
            <Box>
              <Text fontSize="sm" color="gray.500">
                Blocked periods
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                {bookedTimes.length}
              </Text>
            </Box>
          </HStack>
          <HStack
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="lg"
            p={5}
            spacing={4}
          >
            <Center bg="orange.50" color="orange.600" borderRadius="md" boxSize="42px">
              <Clock3 size={20} />
            </Center>
            <Box>
              <Text fontSize="sm" color="gray.500">
                Total unavailable time
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                {totalBlockedHours} {totalBlockedHours === 1 ? "hour" : "hours"}
              </Text>
            </Box>
          </HStack>
        </SimpleGrid>

        <HStack justify="space-between" mb={3}>
          <Heading size="sm" color="gray.800">
            Schedule
          </Heading>
          {bookedTimes.length > 0 && (
            <Text fontSize="sm" color="gray.500">
              Earliest first
            </Text>
          )}
        </HStack>

        {bookedTimes.length > 0 ? (
          <VStack align="stretch" spacing={3}>
            {sortedBookedTimes.map((elem: BookedTimeType) => (
              <BookedTimeCard
                date={elem.date}
                delete_time={handleDelete}
                duration={elem.duration}
                id={elem.id}
                time={elem.time}
                venueId={elem.venueId}
                key={elem.id}
                isDeleting={deletingId === elem.id}
              />
            ))}
          </VStack>
        ) : (
          <Center
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="lg"
            minH="230px"
            px={6}
          >
            <VStack spacing={3} textAlign="center">
              <Center bg="gray.100" color="gray.500" borderRadius="full" boxSize="48px">
                <CalendarClock size={22} />
              </Center>
              <Heading size="sm" color="gray.800">
                No blocked times
              </Heading>
              <Text color="gray.500" fontSize="sm" maxW="sm">
                This venue is currently available for bookings across its full
                schedule.
              </Text>
            </VStack>
          </Center>
        )}
      </Container>
    </Box>
  );
}
