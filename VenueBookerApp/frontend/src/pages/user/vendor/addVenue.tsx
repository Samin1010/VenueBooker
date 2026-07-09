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
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { trimString } from "@/utils/trim";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { SuitabilityType } from "@shared/types";

// Shows the form vendors use to create a new venue.
export default function AddVenue() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [venue, setVenue] = useState<
    Omit<
      VenueType,
      | "id"
      | "rating"
      | "userId"
      | "bookedTimes"
      | "num_ratings"
      | "createdAt"
      | "updatedAt"
      | "discounted_percentage"
    >
  >({
    name: "",
    location: "",
    price: 0,
    image: "",
    capacity: 0,
    description: "",
    suitabilities: [],
    is_featured: false,
  });

  const [nameError, setNameError] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [priceError, setPriceError] = useState<string>("");
  const [capacityError, setCapacityError] = useState<string>("");
  const [descriptionError, setDescriptionError] = useState<string>("");
  const venueFetcherService = new VenueFetcherService();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
    setVenue({
      ...venue,
      name: name,
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
    setVenue({
      ...venue,
      location: e.target.value,
    });
  };

  // Updates the venue price and flags negative values.
  const handleVenuePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = Number(e.target.value);

    setPriceError(price <= 0 ? "The Price must be greater than zero" : "");

    setVenue({
      ...venue,
      price: Number(e.target.value),
    });
  };

  // Updates the venue capacity and flags negative values.
  const handleVenueCapacityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const capacity = Number(e.target.value);
    setCapacityError(capacity < 10 ? "The Capacity must be at least 10" : "");

    setVenue({
      ...venue,
      capacity: Number(e.target.value),
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

    setVenue({
      ...venue,
      description: e.target.value,
    });
  };

  // Saves the selected suitability option for the venue.
  const handleSuitabilityChange = (value: SuitabilityType) => {
    setVenue((prev) => {
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

  const isValidImagePath = (path?: string | null): boolean => {
    if (!path) return false;

    const trimmedPath = path.trim();

    return /^(https?:\/\/.+|\/.+)\.(jpg|jpeg|png|webp|gif)$/i.test(trimmedPath);
  };

  const imagePathError =
    venue.image && !isValidImagePath(venue.image) ? "Invalid Image Path" : "";

  // Stores the image path entered for the venue.
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const image_path = e.target.value;

    setVenue({
      ...venue,
      image: image_path,
    });
  };

  // Checks whether the venue name matches the allowed format.
  const isValidVenueName = (name: string) => /^[a-zA-Z0-9 ]{3,40}$/.test(name);

  // Validates the form and sends the new venue to the API.
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
    };

    const success = await venueFetcherService.addOneVenue(venueToSend, user.id);
    if (!success) {
      toast({
        title: "Venue could not be added",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setIsSubmitting(false);
      return;
    }
    toast({
      title: "Venue Successfully added",
      description: "Venue Added Successfully to the database",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
    setIsSubmitting(false);
    return;
  };

  // Redirects users who should not be on the add venue page.
  useEffect(() => {
    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }

    if (user.role !== "vendor") {
      router.replace("/404");
      return;
    }
  }, [user, router.isReady]);

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
        <FormControl isInvalid={nameError !== ""}>
          <FormLabel> Name: </FormLabel>
          <Input
            maxLength={40}
            type="text"
            value={venue.name}
            onChange={handleVenueNameChange}
          />
          <FormErrorMessage>{nameError}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={locationError !== ""}>
          <FormLabel> Location: </FormLabel>
          <Input
            maxLength={40}
            type="text"
            value={venue.location}
            onChange={handleVenueLocationChange}
          />
          <FormErrorMessage>{locationError}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={Boolean(imagePathError)}>
          <FormLabel>Image: </FormLabel>
          <Input type="text" value={venue.image} onChange={handleImageChange} />
          <FormErrorMessage>{imagePathError}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={capacityError !== ""}>
          <FormLabel> Capacity: </FormLabel>
          <Input
            type="number"
            step="1"
            value={venue.capacity}
            onChange={handleVenueCapacityChange}
          />
          <FormErrorMessage>{capacityError}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={priceError !== ""}>
          <FormLabel> Price: </FormLabel>
          <Input
            type="number"
            value={venue.price}
            onChange={handleVenuePriceChange}
          />
          <FormErrorMessage>{priceError}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Recommended Suitabilities</FormLabel>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {suitabilityOptions.map((option) => (
              <Checkbox
                key={option}
                isChecked={venue.suitabilities.includes(option)}
                onChange={() => handleSuitabilityChange(option)}
                colorScheme="purple"
              >
                {option}
              </Checkbox>
            ))}
          </SimpleGrid>
        </FormControl>

        <FormControl isInvalid={descriptionError !== ""}>
          <FormLabel>Description: </FormLabel>
          <Textarea
            maxLength={100}
            value={venue.description}
            onChange={handleVenueDescriptionChange}
          />
          <FormErrorMessage>{descriptionError}</FormErrorMessage>
        </FormControl>

        <Button
          isDisabled={isSubmitting}
          type="submit"
          mt={6}
          colorScheme="blue"
          width="100%"
        >
          Add Venue
        </Button>
      </form>
    </Box>
  );
}

//const {
//     name,
//     location,
//     price,
//     capacity,
//     description,
//     image
// } = req.body;
