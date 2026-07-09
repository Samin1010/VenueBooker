import { VenueFetcherService } from "@/services/venues.api";
import { useAuth } from "@/context/AuthContext";
import { Suitability } from "@/types/SuitabilityType";
import { VenueType } from "@/types/VenueType";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Center, Spinner,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { trimString } from "@/utils/trim";
import type { SuitabilityType } from "@shared/types";
import { ArrowLeft } from "lucide-react";

// Shows a vendor's venue details and lets them edit the venue.
export default function VenuePage() {
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [venue, setVenue] = useState<VenueType | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [fullStars, setFullStars] = useState<number>(0);
  const [hasHalfStart, setHasHalfStar] = useState<boolean>(false);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [nameError, setNameError] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [priceError, setPriceError] = useState<string>("");
  const [capacityError, setCapacityError] = useState<string>("");
  const [descriptionError, setDescriptionError] = useState<string>("");

  const venueFetcherService = new VenueFetcherService();

  // Sends users away if they are not signed in as a vendor.
  useEffect(() => {
    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }

    if (user.role !== "vendor") {
      router.replace("/404");
      return;
    }
  }, [user]);

  const handleSuitabilityChange = (value: SuitabilityType) => {
    setVenue((prev) => {
      if (!prev) return prev;
      const suitabilities_ = prev.suitabilities;
      if (suitabilities_.includes(value)) {
        return {
          ...prev,
          suitabilities: suitabilities_.filter((item) => item !== value),
        };
      }

      return {
        ...prev,
        suitabilities: [...prev.suitabilities, value],
      };
    });
  };

  const suitabilityOptions: SuitabilityType[] = [
    "wedding",
    "birthday",
    "classical music",
    "dinner",
    "rock concert",
    "tennis",
  ];

  // Updates the venue name and checks it for basic validation issues.
  const handleVenueNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name: string = e.target.value;
    if (!isValidVenueName(name)) {
      setNameError(
        "Venue Name needs to be a valid name and no special characters",
      );
    }

    if (name.length > 40) {
      setNameError("Name Should not exceed 40 characters");
    } else if (isValidVenueName(name)) {
      setNameError("");
    }

    setVenue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        name: name,
      };
    });
  };

  // Updates the venue location and checks the length limit.
  const handleVenueLocationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const location = e.target.value;
    if (location.length > 40) {
      setLocationError("The Location should not be greater than 40");
    } else {
      setLocationError("");
    }
    setVenue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        location: e.target.value,
      };
    });
  };

  // Updates the venue price and flags negative values.
  const handleVenuePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = Number(e.target.value);

    setPriceError(price <= 0 ? "The Price must be greater than zero" : "");

    setVenue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        price: Number(e.target.value),
      };
    });
  };

  // Updates the venue capacity and flags negative values.
  const handleVenueCapacityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const capacity = Number(e.target.value);
    setCapacityError(capacity < 10 ? "The Capacity must be at least 10" : "");

    setVenue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        capacity: Number(e.target.value),
      };
    });
  };

  // Updates the venue description and checks the character limit.
  const handleVenueDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const description = e.target.value;

    if (description.length > 100) {
      setDescriptionError(
        "The length of the description cannot be greater than 100",
      );
    } else {
      setDescriptionError("");
    }

    setVenue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        description: e.target.value,
      };
    });
  };

  // converting the image data in to binary string
  // which can be easily transmitted

  // const handleImageChange = async (e : React.ChangeEvent<HTMLInputElement>) => {
  //     const file = e.target.files?.[0];
  //     if(!file) return;

  //     if (!file.type.startsWith("image/")) {
  //         alert("Only image files are allowed!");
  //         return;
  //     }

  //     const base64String = await convertImageToBase64(file);

  //     setVenue(prev => {
  //         if(!prev) return prev;
  //         return {
  //             ...prev,
  //             image : base64String
  //         }
  //     });
  // }

  // Stores the image path entered for the venue.
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const image_path = e.target.value;

    setVenue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        image: image_path,
      };
    });
  };

  // Checks whether the venue name matches the allowed format.
  const isValidVenueName = (name: string) => /^[a-zA-Z0-9 ]{3,40}$/.test(name);

  const isValidImagePath = (path?: string | null): boolean => {
    if (!path) return false;

    const trimmedPath = path.trim();

    return /^(https?:\/\/.+|\/.+)\.(jpg|jpeg|png|webp|gif)$/i.test(trimmedPath);
  };

  const imagePathError =
    venue?.image && !isValidImagePath(venue.image) ? "Invalid Image Path" : "";

  // Validates the form and sends the updated venue to the API.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!user) {
      setIsSubmitting(false);
      return;
    }
    if (
      nameError ||
      locationError ||
      capacityError ||
      priceError ||
      descriptionError ||
      imagePathError
    ) {
      toast({
        title: "Fix errors before submitting",
        status: "error",
        duration: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    if (!venue) {
      setIsSubmitting(false);
      return;
    }

    if (
      venue.name === "" ||
      venue.location === "" ||
      venue.price === 0 ||
      venue.capacity === 0 ||
      venue.description === "" ||
      venue.suitabilities.length === 0 ||
      venue.image.trim() === ""
    ) {
      toast({
        title: "Fill all the fields",
        description: "Venue failed to be added",
        status: "error",
        duration: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    const venueToSend = {
      ...venue,
      name: trimString(venue.name),
      location: trimString(venue.location),
      description: trimString(venue.description),
      image: trimString(venue.image),
    } as VenueType;

    const result: boolean = await venueFetcherService.updateOneVenue(
      venueToSend,
      user.id,
    );
    if (!result) {
      toast({
        title: "Venue update failed",
        description: "Venue update completely failed",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setIsSubmitting(false);
      return;
    }
    toast({
      title: "Venue Successfully updated",
      description: "Venue updated Successfully to the database",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
    setIsSubmitting(false);
    setIsDisabled(true);
    return;
  };

  // Loads the venue from the route id once the router is ready.
  useEffect(() => {
    if (!router.isReady) return;
    const id = Array.isArray(router.query.id)
      ? router.query.id[0]
      : router.query.id;
    // Fetches one venue and prepares its rating display.
    const fetchVenue = async (id: number) => {
      const venue = await venueFetcherService.getOneVenue(id);
      if (!venue) {
        toast({
          title: "Venue is not found",
          description: "Venue not found",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setVenue(venue);
        if (venue.rating) {
          setHasHalfStar(venue.rating % 1 >= 0.5);
          setFullStars(Math.floor(venue.rating));
        }
      }
      setIsLoading(false);
    };

    setIsLoading(true);
    fetchVenue(Number(id));
  }, [router.isReady]);

  const handleDeleteVenue = async () => {
    setIsDeleting(true);
    if (!venue) {
      setIsDeleting(false);
      return;
    }
    const result = await venueFetcherService.deleteOneVenue(venue.id);
    if (!result.success) {
      toast({
        title: "FAILURE_DELETION",
        description: "Failed to delete venue",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsDeleting(false);
      return;
    }

    toast({
      title: "SUCCESS_DELETION",
      description: "Sucessfully deleted the venue",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    router.replace("/user/vendor/venues");
    setVenue(undefined);
  };

  if (isLoading || !router.isReady || !venue) {
    return <Center><Spinner /></Center>;
  }

  return (
    <Box px={4}>
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
        <FormControl isInvalid={nameError !== ""}>
          <FormLabel>Name</FormLabel>
          <Input
            maxLength={40}
            isDisabled={isDisabled}
            value={venue?.name}
            onChange={handleVenueNameChange}
            type="text"
          />
          <FormErrorMessage>{nameError}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={priceError !== ""}>
          <FormLabel>Price</FormLabel>
          <Input
            isDisabled={isDisabled}
            value={venue?.price}
            onChange={handleVenuePriceChange}
            type="number"
          />
          <FormErrorMessage>{priceError}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={locationError !== ""}>
          <FormLabel>Location</FormLabel>
          <Input
            maxLength={40}
            isDisabled={isDisabled}
            value={venue?.location}
            onChange={handleVenueLocationChange}
            type="text"
          />
          <FormErrorMessage>{locationError}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={capacityError !== ""}>
          <FormLabel>Capacity</FormLabel>
          <Input
            isDisabled={isDisabled}
            value={venue?.capacity}
            onChange={handleVenueCapacityChange}
            type="text"
          />
          <FormErrorMessage>{capacityError}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel>Recommended Suitabilities</FormLabel>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {suitabilityOptions.map((option) => (
              <Checkbox
                key={option}
                isDisabled={isDisabled}
                isChecked={venue.suitabilities.includes(option)}
                onChange={() => handleSuitabilityChange(option)}
                colorScheme="purple"
              >
                {option}
              </Checkbox>
            ))}
          </SimpleGrid>
        </FormControl>
        <FormControl isRequired isInvalid={Boolean(imagePathError)}>
          <FormLabel>Image: </FormLabel>
          <Input
            isDisabled={isDisabled}
            type="text"
            value={venue?.image}
            onChange={handleImageChange}
          />
          <FormErrorMessage>{imagePathError}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={descriptionError !== ""}>
          <FormLabel>Description: </FormLabel>
          <Textarea
            maxLength={100}
            value={venue?.description}
            onChange={handleVenueDescriptionChange}
            isDisabled={isDisabled}
          />
          <FormErrorMessage>{descriptionError}</FormErrorMessage>
        </FormControl>
        <HStack mt={3} mb={4}>
          <Button isLoading={isSubmitting} isDisabled={isDisabled} type="submit">
            Submit
          </Button>
          {/* Toggles the form between read-only and editable states. */}
          <Button
            onClick={(e) => {
              e.preventDefault();
              setIsDisabled((prev) => !prev);
            }}
            type="button"
          >
            Edit Toggler
          </Button>
          <Button
            disabled={isDeleting}
            onClick={(e) => {
              e.preventDefault();
              handleDeleteVenue();
            }}
            type="button"
          >
            Delete
          </Button>
        </HStack>
      </form>
    </Box>
  );
}
