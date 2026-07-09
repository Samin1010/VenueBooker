import { UserFetcherServices, VenueFetcherServices } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import type { SuitabilityType } from "@admin-shared/types";
import type { VenueDto } from "@admin-shared/types";
import {
  Box,
  Button,
  Center,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

// Shows the admin form used to create a new venue.
export default function AddVenue() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [venue, setVenue] = useState<
    Omit<
      VenueDto,
      | "id"
      | "rating"
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
    is_featured: false,
    suitabilities: [],
    userId: 0,
  });

  const [vendors, setVendors] = useState<
    Array<{ id: number; username: string }>
  >([]);
  const [nameError, setNameError] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [priceError, setPriceError] = useState<string>("");
  const [imagePathError, setImagePathError] = useState<string>("");
  const [capacityError, setCapacityError] = useState<string>("");
  const [descriptionError, setDescriptionError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Clears the venue name error whenever the name changes.
  useEffect(() => {
    setNameError("");
  }, [venue.name]);

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
    }
    setVenue((prev) => ({
      ...prev,
      name: name,
    }));
  };

  // Clears the location error whenever the location field changes.
  useEffect(() => {
    setLocationError("");
  }, [venue.location]);

  // Updates the venue location and checks the length limit.
  const handleVenueLocationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const location = e.target.value;
    if (location.length > 50) {
      setLocationError("The Location should not be greater than 50");
    }
    setVenue((prev) => ({
      ...prev,
      location: e.target.value,
    }));
  };

  // Clears the price error whenever the price field changes.
  useEffect(() => {
    setPriceError("");
  }, [venue.price]);

  // Updates the venue price and flags negative values.
  const handleVenuePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = Number(e.target.value);

    if (price < 0) {
      setPriceError("The Price is negative");
    }

    setVenue((prev) => ({
      ...prev,
      price: Number(e.target.value),
    }));
  };

  // Clears the capacity error whenever the capacity field changes.
  useEffect(() => {
    setCapacityError("");
  }, [venue.capacity]);

  // Updates the venue capacity and flags negative values.
  const handleVenueCapacityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const capacity = Number(e.target.value);
    if (capacity < 0) {
      setCapacityError("The Capacity entered in negative");
    }

    setVenue((prev) => ({
      ...prev,
      capacity: Number(e.target.value),
    }));
  };

  // Clears the description error whenever the description changes.
  useEffect(() => {
    setDescriptionError("");
  }, [venue.description]);

  // Updates the venue description and checks the character limit.
  const handleVenueDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const description = e.target.value;

    if (description.length > 100) {
      setDescriptionError(
        "The Length of the description cannot be greated than 100",
      );
    }

    setVenue((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  // Saves the selected suitability option for the venue.
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

  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "") return;

    setVenue((prev) => ({
      ...prev,
      userId: Number(e.target.value),
    }));
  };

  const isValidImagePath = (path?: string | null): boolean => {
    if (!path) return false;

    const trimmedPath = path.trim();

    if (trimmedPath === "") return false;

    return (
      trimmedPath.startsWith("http://") ||
      trimmedPath.startsWith("https://") ||
      trimmedPath.startsWith("data:image/") ||
      trimmedPath.startsWith("/")
    );
  };

  useEffect(() => {
    if (venue && venue.image && !isValidImagePath(venue.image)) {
      setImagePathError("Invalid Image Path");
    } else {
      setImagePathError("");
    }
  }, [venue?.image]);

  // Stores the image path entered for the venue.
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const image_path = e.target.value;

    setVenue((prev) => ({
      ...prev,
      image: image_path,
    }));
  };

  // Checks whether the venue name matches the allowed format.
  const isValidVenueName = (name: string) => /^[a-zA-Z0-9 ]{3,50}$/.test(name);

  // Validates the form and sends the new venue to the API.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      setIsSubmitting(false);
      toast({
        title: "Fix errors before submitting",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (
      venue.name === "" ||
      venue.location === "" ||
      venue.price === 0 ||
      venue.capacity === 0 ||
      venue.description === "" ||
      venue.suitabilities.length === 0 ||
      venue.image.trim() === "" ||
      (user.role === "admin" && !venue.userId)
    ) {
      setIsSubmitting(false);
      toast({
        title: "Fill all the fields",
        description: "Venue failed to be added",
        status: "error",
        duration: 3000,
      });
      return;
    }

    const ownerId = user.role === "vendor" ? user.id : venue.userId;
    await VenueFetcherServices.createVenue({
      ...venue,
      userId: ownerId,
    });
    setIsSubmitting(false);
    toast({
      title: "Venue Successfully added",
      description: "Venue Added Successfully to the database",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
    setVenue({
      name: "",
      location: "",
      price: 0,
      image: "",
      capacity: 0,
      description: "",
      is_featured: false,
      suitabilities: [],
      userId: 0,
    });
    return;
  };

  const fetchVendors = async () => {
    const vendors_ = await UserFetcherServices.getAllVendors();
    setVendors(vendors_);
    setIsLoading(false);
  };

  // Redirects users who should not be on the add venue page.
  useEffect(() => {
    if (!router.isReady) return;

    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/404");
      return;
    }
    setIsLoading(true);
    fetchVendors();
  }, [user, router.isReady]);

  if (isLoading || !router.isReady) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
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
        <FormControl isInvalid={nameError !== ""}>
          <FormLabel> Name: </FormLabel>
          <Input
            type="text"
            value={venue.name}
            onChange={handleVenueNameChange}
          />
          <FormErrorMessage>{nameError}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={locationError !== ""}>
          <FormLabel> Location: </FormLabel>
          <Input
            type="text"
            value={venue.location}
            onChange={handleVenueLocationChange}
          />
          <FormErrorMessage>{locationError}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={imagePathError !== ""}>
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
        <FormControl isRequired>
          <FormLabel>Vendor</FormLabel>
          <Select
            value={venue.userId ? String(venue.userId) : ""}
            onChange={handleVendorChange}
          >
            <option value="" disabled>
              Select vendor
            </option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={String(vendor.id)}>
                {vendor.username}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>isFeatured</FormLabel>
          {/* Updates whether this venue is marked as featured. */}
          <Checkbox
            checked={venue.is_featured}
            onChange={(e) => {
              setVenue((prev) => ({
                ...prev,
                is_featured: e.target.checked,
              }));
            }}
          />
        </FormControl>
        <FormControl isInvalid={descriptionError !== ""}>
          <FormLabel>Description: </FormLabel>
          <Textarea
            value={venue.description}
            onChange={handleVenueDescriptionChange}
          />
          <FormErrorMessage>{descriptionError}</FormErrorMessage>
        </FormControl>

        <Button
          isLoading={isSubmitting}
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
