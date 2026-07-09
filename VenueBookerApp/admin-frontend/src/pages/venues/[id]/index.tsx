import { UserFetcherServices, VenueFetcherServices } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import type { SuitabilityType } from "@admin-shared/types";
import type { VenueDto } from "@admin-shared/types";
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
  Center,
  Spinner,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function VenuePage() {
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [venue, setVenue] = useState<VenueDto | undefined>(undefined);
  // const [fullStars,setFullStars] = useState<number>(0);
  // const [hasHalfStart,setHasHalfStar] = useState<boolean>(false);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [nameError, setNameError] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [imagePathError, setImagePathError] = useState<string>("");
  const [priceError, setPriceError] = useState<string>("");
  const [capacityError, setCapacityError] = useState<string>("");
  const [descriptionError, setDescriptionError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  //const [currentVendor,setCurrentVendor] = useState<{id : Number,username : string} | "">("");
  const [vendors, setVendors] = useState<
    Array<{ id: number; username: string }>
  >([]);

  useEffect(() => {
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
  }, [user]);

  const fetchVendors = async () => {
    const vendors_ = await UserFetcherServices.getAllVendors();
    setVendors(vendors_);
    setIsLoading(false);
  };

  useEffect(() => {
    setNameError("");
  }, [venue?.name]);

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

    setVenue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        name: name,
      };
    });
  };

  useEffect(() => {
    setLocationError("");
  }, [venue?.location]);

  const handleVenueLocationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const location = e.target.value;
    if (location.length > 50) {
      setLocationError("The Location should not be greater than 50");
    }
    setVenue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        location: e.target.value,
      };
    });
  };

  useEffect(() => {
    setPriceError("");
  }, [venue?.price]);

  const handleVenuePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = Number(e.target.value);

    if (price < 0) {
      setPriceError("The Price is negative");
    }

    setVenue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        price: Number(e.target.value),
      };
    });
  };

  useEffect(() => {
    setCapacityError("");
  }, [venue?.capacity]);

  const handleVenueCapacityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const capacity = Number(e.target.value);
    if (capacity < 0) {
      setCapacityError("The Capacity entered in negative");
    }

    setVenue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        capacity: Number(e.target.value),
      };
    });
  };

  useEffect(() => {
    setDescriptionError("");
  }, [venue?.description]);

  const handleVenueDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const description = e.target.value;

    if (description.length > 100) {
      setDescriptionError(
        "The Length of the description cannot be greated than 100",
      );
    }

    setVenue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        description: e.target.value,
      };
    });
  };

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

  const handleIsFeaturedChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const checked = e.target.checked;

    setVenue((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        is_featured: checked,
      };
    });
  };

  useEffect(() => {
    if (venue && venue.image && !isValidImagePath(venue.image)) {
      setImagePathError("Invalid Image Path");
    } else {
      setImagePathError("");
    }
  }, [venue?.image]);

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

  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "") return;

    setVenue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        userId: Number(e.target.value),
      };
    });
  };

  const isValidVenueName = (name: string) => /^[a-zA-Z0-9 ]{3,50}$/.test(name);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!user) {
      setIsSubmitting(false);
      return;
    }

    if (user.role !== "admin") {
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
        description: "Fill the details carefully",
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
      venue.image.trim() === "" ||
      !venue.userId
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

    const requiredVenueStructure = {
      name: venue.name,
      location: venue.location,
      capacity: venue.capacity,
      ...(venue.discounted_percentage === 0 ? { price: venue.price } : {}),
      image: venue.image,
      description: venue.description,
      is_featured: venue.is_featured,
      suitabilities: venue.suitabilities,
      userId: venue.userId,
    };
    const result = await VenueFetcherServices.updateVenue(
      venue.id,
      requiredVenueStructure,
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

  useEffect(() => {
    if (!router.isReady) return;
    const id = Array.isArray(router.query.id)
      ? router.query.id[0]
      : router.query.id;
    const fetchVenue = async (id: number) => {
      const venue = await VenueFetcherServices.getOneVenue(id);
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
        // if(venue.rating)
        // {
        //     setHasHalfStar(venue.rating % 1 >= 0.5);
        //     setFullStars(Math.floor(venue.rating));
        // }
      }
      setIsLoading(false);
    };

    setIsLoading(true);
    fetchVenue(Number(id));
  }, [router.isReady]);

  if (isLoading || !router.isReady || !venue) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
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
            isDisabled={isDisabled || venue?.discounted_percentage !== 0}
            value={venue?.price}
            onChange={handleVenuePriceChange}
            type="number"
          />
          <FormErrorMessage>{priceError}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={locationError !== ""}>
          <FormLabel>Location</FormLabel>
          <Input
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
                isDisabled={isDisabled}
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
            isDisabled={isDisabled}
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
        <FormControl isInvalid={imagePathError !== ""}>
          <FormLabel>Image: </FormLabel>
          <Input
            isDisabled={isDisabled}
            type="text"
            value={venue?.image}
            onChange={handleImageChange}
          />
          <FormErrorMessage>{imagePathError}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel>isFeatured</FormLabel>
          <Checkbox
            isDisabled={isDisabled}
            checked={venue?.is_featured}
            onChange={handleIsFeaturedChange}
          />
        </FormControl>
        <FormControl isInvalid={descriptionError !== ""}>
          <FormLabel>Description: </FormLabel>
          <Textarea
            value={venue?.description}
            onChange={handleVenueDescriptionChange}
            isDisabled={isDisabled}
          />
          <FormErrorMessage>{descriptionError}</FormErrorMessage>
        </FormControl>
        <HStack mt={3} mb={4}>
          <Button
            isLoading={isSubmitting}
            isDisabled={isDisabled}
            type="submit"
          >
            Submit
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              setIsDisabled((prev) => !prev);
            }}
            type="button"
          >
            Edit Toggler
          </Button>
        </HStack>
      </form>
    </Box>
  );
}
