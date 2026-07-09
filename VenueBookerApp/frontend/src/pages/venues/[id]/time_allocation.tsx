import { VenueFetcherService } from "@/services/venues.api";
import CalendarComponent from "@/components/Calendar";
import { useAuth } from "@/context/AuthContext";
import { BookedTimeType } from "@/types/BookedTimeType";
import { VenueType } from "@/types/VenueType";
import {
  Button,
  FormControl,
  HStack,
  Input,
  Center,
  Spinner,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { trimString } from "@/utils/trim";

export default function TimeAllocation() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [venue, setVenue] = useState<VenueType | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentDateError, setCurrentDateError] = useState<string>("");
  const [startTime, setStartTime] = useState<string | undefined>(undefined);
  const [startTimeError, setStartTimeError] = useState<string>("");
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [durationError, setDurationError] = useState<string>("");
  const venueFetcherService = new VenueFetcherService();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!router.isReady) return;

    // console.log(user);

    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }

    // toast({
    //     title : "Checking User",
    //     description : JSON.stringify(user),
    //     status : "success",
    //     duration : 3000,
    //     isClosable : true
    //   });

    if (user.role !== "vendor") {
      router.replace("/404");
      return;
    }

    const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;

    const fetchVenue = async () => {
      try {
        const venue_ = await venueFetcherService.getOneVenue(Number(id));
        if (!venue_ || venue_.userId !== user.id) {
          router.replace("/404");
          return;
        }
        setVenue(venue_);
      } catch {
        router.replace("/404");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchVenue();
  }, [user, router, router.isReady, router.query.id]);

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(e.target.value === "" ? undefined : Number(e.target.value));
  };

  useEffect(() => {
    const selected = new Date(currentDate);
    const today = new Date();

    // Remove time from both
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      setCurrentDateError("Date is in the past ❌");
    } else {
      setCurrentDateError("");
    }
  }, [currentDate]);

  useEffect(() => {
    if (!startTime) {
      setStartTimeError("");
      return;
    }

    const now = new Date();

    const selectedDateTime = new Date(currentDate);

    const [hours, minutes] = startTime.split(":").map(Number);

    selectedDateTime.setHours(hours, minutes, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDateOnly = new Date(currentDate);
    selectedDateOnly.setHours(0, 0, 0, 0);

    if (selectedDateOnly.getTime() === today.getTime()) {
      if (selectedDateTime < now) {
        setStartTimeError("Select a future time to make the venue unavailable");
        return;
      }
    }
    setStartTimeError("");
  }, [startTime, currentDate]);

  useEffect(() => {
    if (duration === undefined) {
      setDurationError("");
      return;
    }

    if (!Number.isInteger(duration) || duration < 2 || duration > 10) {
      setDurationError("The Duration needs to be between 2 and 10 hours");
      return;
    }
    setDurationError("");
  }, [duration]);

  const formattedDate = (date: Date) => {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!user || !router.isReady) {
      setIsSubmitting(false);
      return;
    }

    if (!startTime || !duration) {
      toast({
        title: "Missing required fields",
        description: "Please select a start time and duration",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

    if (currentDateError || startTimeError || durationError) {
      toast({
        title: "Unable to submit because of error",
        description: "Need to fix the data given before submitting",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

    const id = Array.isArray(router.query.id)
      ? router.query.id[0]
      : router.query.id;

    const newBookTime: Omit<BookedTimeType, "id"> = {
      date: formattedDate(currentDate),
      time: trimString(startTime),
      duration: duration,
      venueId: Number(id),
    };

    const response = await venueFetcherService.blockATimeSlot(
      newBookTime,
      Number(id),
      user.id,
    );

    if (!response.success) {
      toast({
        title: "Failed to block a time",
        description: response.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Time allocated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    setCurrentDate(new Date());
    setStartTime(undefined);
    setDuration(undefined);
    setIsSubmitting(false);
  };

  // rendered hooks or useEffect or useLayout Effect hooks should be called in the same order

  if (isLoading || !router.isReady || !venue) {
    return (
      <div className="p-4">
        <Center>
          <Spinner />
        </Center>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-blue-500 p-4">
      <HStack mb={3}>
        <Button
          bgColor={"white"}
          size="sm"
          variant="ghost"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => router.back()}
          _hover={{ bg: "gray.200" }}
        >
          Back
        </Button>
      </HStack>
      <form onSubmit={handleSubmit}>
        <HStack mb={4}>
          <CalendarComponent
            currentDate={new Date(currentDate)}
            setCurrentDate={setCurrentDate}
          />
          {currentDateError && <p>{currentDateError}</p>}
          <VStack spacing={4}>
            <FormControl isInvalid={startTimeError !== ""} mt={4}>
              <Input
                bgColor={"white"}
                color={"black"}
                placeholder="Start Time"
                value={startTime ?? ""}
                onChange={handleStartTimeChange}
                type="time"
              />
            </FormControl>
            <FormControl isInvalid={durationError !== ""}>
              <Input
                bgColor={"white"}
                color={"black"}
                placeholder="Duration"
                value={duration ?? ""}
                onChange={handleDurationChange}
                type="number"
                min="2"
                max="10"
                step="1"
              />
            </FormControl>
          </VStack>
        </HStack>
        <Button isLoading={isSubmitting} type="submit">
          Allocate
        </Button>
      </form>
    </div>
  );
}
