import { ApplicationFetcherService } from "@/services/application.api";
import { VenueFetcherService } from "@/services/venues.api";
import { useAuth } from "@/context/AuthContext";
import ApplicationType from "@/types/ApplicationType";
import { BookedTimeType } from "@/types/BookedTimeType";
import { VenueType } from "@/types/VenueType";
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Button,
  useToast,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { trimString } from "@/utils/trim";

export default function ApplicationPage() {
  const router = useRouter();
  const toast = useToast();
  const { user} = useAuth();

  const [venue,setVenue]= useState<VenueType | undefined>(undefined);

  const [isSubmitting,setIsSubmitting] = useState<boolean>(false);

  const [eventName, setEventName] = useState("");
  const [eventNameError, setEventNameError] = useState("");

  const [guests, setGuests] = useState<number | "">("");
  const [guestsError, setGuestsError] = useState("");

  const [day, setDay] = useState<number | "">("");
  const [month, setMonth] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");
  const [dateError, setDateError] = useState("");

  const [time, setTime] = useState("");
  const [timeError, setTimeError] = useState("");

  const [duration, setDuration] = useState<number | "">("");
  const [durationError, setDurationError] = useState("");
  
  const [maxGuests,setMaxGuests] = useState<number | undefined>(undefined);
  const [bookedTimes,setBookedTimes] = useState<Omit<BookedTimeType,"id" | "venueId">[]>([]);

  const venueFetcherService = useMemo(() => new VenueFetcherService(), []);
  const applicationFetcherService = useMemo(() => new ApplicationFetcherService(), []);

  useEffect(() => {
    if ( !router.isReady) return;

    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }

    if (user.role !== "hirer") {
      router.replace("/404");
      return;
    }

    const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;

    const fetchVenue = async (venueId : number) => {
      const [venue_, unavailableTimes] = await Promise.all([
        venueFetcherService.getOneVenue(venueId),
        venueFetcherService.getAvailability(venueId),
      ]);
      if(!venue_)
      {
        router.replace("/venues/venue-listing");
        return;
      }
      setVenue(venue_);
      setMaxGuests(venue_.capacity);
      setBookedTimes(unavailableTimes);
    }

    fetchVenue(Number(id));

  }, 
  [
    user,
    router, 
    router.isReady,
    router.query,
    venueFetcherService,
  ]);


  const isValidEventName = (name: string) =>
    /^[a-zA-Z0-9 ]{3,40}$/.test(name);

  const isValidTime = (t: string) =>
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);

  const validateDate = (d: number, m: number, y: number)=> 
    {
    const date = new Date(y, m - 1, d);
    return (
      date.getFullYear() === y  
      && date.getMonth() === m - 1 
      && date.getDate() === d
    );
  };


  const handleEventNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEventName(value);

    if (!isValidEventName(value)) 
    {
      setEventNameError("3–40 chars, letters & numbers only");
    } 
    else 
    {
      setEventNameError("");
    }
  };

  const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!maxGuests) return;

    const value = e.target.value === "" ? "" : Number(e.target.value);
    setGuests(value);

    if (value === "" || value <= 0) {
      setGuestsError("At least 1 guest required");
    } 
    else if (value > maxGuests)
    {   
        setGuestsError(`At most ${maxGuests} allowed`);
    }
    else 
    {
      setGuestsError("");
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : Number(e.target.value);
    setDay(value);
    validateFullDate(value, month, year);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : Number(e.target.value);
    setMonth(value);
    validateFullDate(day, value, year);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : Number(e.target.value);
    setYear(value);
    validateFullDate(day, month, value);
  };

  const validateFullDate = (d: number | "",m: number | "",y: number | "") => {
    if (d === "" || m === "" || y === "")
    {

      setDateError("");
      return;
    }

    if (!validateDate(d, m, y)) 
    {
      setDateError("Invalid date");
      return;
    }

    const selected = new Date(y, m - 1, d);
    selected.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (selected < now) 
    {
      setTimeError("Select a valid Date First");

      setDateError("Date must be in the future");
    } 
    else if(Number(y) > now.getFullYear() + 1)
    {
      setDateError(`Year must be with in ${now.getFullYear()+1}`);
      setTimeError("Select a valid Date First");
    }
    else 
    {
      setDateError("");

      setTimeError("");
    }
  };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTime(value);

        if (!isValidTime(value)) {
            setTimeError("Invalid time (HH:MM)");
            return;
        }

        if (!day || !month || !year) {
            setTimeError("Select a valid date first");
            return;
        }

        const [h, m] = value.split(":").map(Number);

        const selectedDateTime = new Date(Number(year),Number(month) - 1,Number(day),h,m,0,0);

        const now = new Date();

        if (selectedDateTime <= now) 
        {
            setTimeError("Must be in the future");
        } 
        else 
        {
            setTimeError("");
        }
    };

    const formatDate = (y: number, m: number, d: number) =>
      `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty input
    if (value === "") {
      setDuration("");
      setDurationError("");
      return;
    }

    const numericDuration = Number(value);
    setDuration(numericDuration);

    if (!Number.isInteger(numericDuration) || numericDuration < 2 || numericDuration > 10)
    {
      setDurationError("Duration must be between 2–10 hours");
    } 
    else 
    {
      setDurationError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if(!user) {
      setIsSubmitting(false);
      return;
    }
    if(!router.isReady){
      setIsSubmitting(false);
      return;
    }

    if(!maxGuests) {
      setIsSubmitting(false);
      return;
    }

    let {id} = router.query;
    
    if(id === undefined){
      toast({
        title: "Venue Id is not defined",
        description: `Venue id is not defined`,
        status: "error",
        duration: 4000,
      });
      setIsSubmitting(false);
      return;
    }

    if (Array.isArray(id)) {
      id = id[0];
    }

    if (!venue) {
      setIsSubmitting(false);
      return;
    }
    if(!eventName ||!guests ||!day ||!month ||!year ||!time ||!duration)
    {
      toast({
        title : "Failed",
        description : "Fill out all the details first before submitting",
        status : "error",
        isClosable : true,
        duration : 3000
      })
      setIsSubmitting(false);
      return;
    }

    if (
      eventNameError ||guestsError ||dateError ||timeError ||durationError 
    ) 
    {
      toast({
        title: "Fix errors before submitting"   ,
        status: "error",
        duration: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    const selectedStart = new Date(year, month - 1, day);
    const [selectedHour, selectedMinute] = time.split(":").map(Number);
    selectedStart.setHours(selectedHour, selectedMinute, 0, 0);
    const selectedEnd = new Date(selectedStart.getTime() + duration * 60 * 60 * 1000);
    const unavailableTimeCollision = bookedTimes.some((unavailableTime) => {
      const unavailableStart = new Date(`${String(unavailableTime.date).slice(0, 10)}T${String(unavailableTime.time).slice(0, 5)}:00`);
      const unavailableEnd = new Date(unavailableStart.getTime() + unavailableTime.duration * 60 * 60 * 1000);
      return selectedStart < unavailableEnd && selectedEnd > unavailableStart;
    });

    if (unavailableTimeCollision) {
      toast({
        title: "Venue unavailable",
        description: "The selected time overlaps with an unavailable time.",
        status: "error",
        duration: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    // application object
    const application : Omit<ApplicationType,"id" | "createdAt" | "updatedAt"> = {
      date : formatDate(year, month, day),
      time : trimString(time),
      duration : duration,
      eventName : trimString(eventName),
      expectedGuests : guests,
      userId : user.id,
      status : "pending",
      vendorReason : "",
      venueId : Number(id)
    }


    const {message , success} = await applicationFetcherService.addOne(application);

    if (!success)
    {

      toast({
        title: "FAILED TO BOOK",
        description: message,
        status: "error",
        duration: 4000,
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: "Application submitted!",
      status: "success",
      duration: 3000,
    });

  
    setDay("");
    setDuration("");
    setEventName("");
    setGuests("");
    setMonth("");
    setYear("");
    setTime("");
    setIsSubmitting(false);
  }

  return (
    <Box maxW="500px" mx="auto">
      <HStack mb={3}>
        <Button
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
        <FormControl isInvalid={eventNameError !== ""}>

          <FormLabel>Event Name</FormLabel>

          <Input maxLength={40} value={eventName} onChange={handleEventNameChange} />

          <FormErrorMessage>{eventNameError}</FormErrorMessage>

        </FormControl>

        <FormControl isInvalid={guestsError !== ""} mt={4}>

          <FormLabel>Expected Guests</FormLabel>

          <Input type="number" value={guests} onChange={handleGuestsChange} />

          <FormErrorMessage>{guestsError}</FormErrorMessage>
          
        </FormControl>

        <HStack mt={4}>
          <FormControl isInvalid={dateError !== ""}>
            <FormLabel>Day</FormLabel>
            <Input type="number" value={day}
             onChange={handleDayChange} />
          </FormControl>

          <FormControl isInvalid={dateError !== ""}>
            <FormLabel>Month</FormLabel>
            <Input type="number" value={month} 
            onChange={handleMonthChange} />
          </FormControl>

          <FormControl isInvalid={dateError !== ""}>
            <FormLabel>Year</FormLabel>

            <Input type="number" value={year} 
            onChange={handleYearChange} />
          </FormControl>

        </HStack>

        {dateError && (

          <Box color="red.500" fontSize="sm" mt={1}>
          {dateError}
          </Box>
        )}

        <FormControl isInvalid={timeError !== ""} mt={4}>
          <FormLabel>Start Time</FormLabel>

          <Input type="time" value={time} 
          onChange={handleTimeChange} />
          <FormErrorMessage>{timeError}</FormErrorMessage>
        </FormControl>

        { /** The booked times is only going to be shown if there are any booked times on that date */
          // year !== "" && month !== "" && day !== "" && bookedTimes && 
          // bookedTimes.filter((bt: any) => 
          //   new Date(bt.date).toDateString() ===
          //   new Date(Number(year),Number(month) - 1, Number(day)).toDateString()
          // )
          // .map((bt: any, index: number) => {
          //   const start = bt.time;

          //   const[h , m] = bt.time
          //   .split(":").map(Number);
          //   const endDate = new Date(bt.date);

          //   endDate.setHours(h + bt.duration, m);

          //   const end = endDate
          //   .toLocaleTimeString([], {
          //     hour: "2-digit",
          //     minute: "2-digit",
          //   });

          //   return (
          //     <Box key={index} color="red.500" fontSize="sm">
          //       {/** I used a block symbol here wurg HTML entity symbol since html thing was not working not sure why
          //        * did not have time to fix but this works too
          //       */}
          //       🚫 Booked: {start} - {end}
          //     </Box>
          //   );
          // })
          }

        <FormControl isInvalid={durationError !== ""} mt={4}>

          <FormLabel>Duration (hours)</FormLabel>

          <Input
            type="number"
            min="2"
            max="10"
            step="1"
            value={duration}
            onChange={handleDurationChange}
          />

          <FormErrorMessage>{durationError}</FormErrorMessage>

        </FormControl>

        <Button isLoading={isSubmitting} type="submit" mt={6} colorScheme="blue" width="100%">

          Submit Application

        </Button>
      </form>
    </Box>
  );
}
