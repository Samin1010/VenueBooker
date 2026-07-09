"use client";
// import Image from "next/image";
// import { Geist, Geist_Mono } from "next/font/google";
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import { VenueType } from "@/types/VenueType";
import Venue from "@/components/Venue";
import NoVenuesFound from "@/components/NoVenuesFound";
import { Search2Icon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { PreferenceType } from "@/types/PreferenceType";
import Link from "next/link";
// import {VENUES} from "@/sample_data/sample_venues";
import { Suitability } from "@/types/SuitabilityType";
import { VenueFetcherService } from "@/services/venues.api";
import { UserFetcherService } from "@/services/users.api";
import { SUBCRIPTION_DISCOUNTED_VENUE, SUBSCRIPTION_REMOVED_DISCOUNTED_VENUE, wsClient } from "@/services/graphql";
import type { VenueDto } from "@shared/types";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// const StringValues = ['name','location','no_filter'];
// const NumberValues = ['capacity','price'];
// const radioOption = ['rating'];

interface Discounted_Venue {
  discountedVenue : Omit<VenueDto,"bookedTimes" | "userId">
}

interface RemovedDiscounted_Venue {
  removedDiscountedVenue : Omit<VenueDto,"bookedTimes" | "userId">
}

type Filter = {
  name: string;
  location: string;
  capacity: number | undefined;
  price: number | undefined;
  suitability: Suitability | "";
};

export default function VenueListing() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const buttonColor = useColorModeValue("gray.800", "white");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<Filter>({
    name: "",
    location: "",
    capacity: undefined,
    price: undefined,
    suitability: "",
  });
  const [featuredVenues, setFeaturedVenues] = useState<VenueType[]>([]);
  const [nonFeaturedVenues,setNonFeaturedVenues] = useState<VenueType[]>([]);

  const venueFetcher = new VenueFetcherService();
  const userFetcher = new UserFetcherService();

  const [preferences, setPreferences] = useState<PreferenceType[]>([]);

  const handleChangePreferences = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    venueId: number,
  ) => {
    if (!user) return;
    if (user.role === "vendor") {
      toast({
        title: "Vendor not allowed",
        description: "Please log in using a customer account",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setIsLoading(true);
    const value = e.target.value;

    //console.log(value)

    let updatePref;

    if (value === "none") {
      const pref = preferences.filter((p) => p.venueId === venueId);
      if (pref.length === 0) {
        setIsLoading(false);
        return;
      }
      //updatedPreferences = preferences.filter(p => p.venueId !== venueId);

      updatePref = async () => {
        const results = await userFetcher.deleteOnePreference(
          pref[0].id,
          user.id,
        );
        if (!results.success) {
          setIsLoading(false);
          return;
        }
        const preferences_ = results.preferences!;
        setPreferences(preferences_);
        setIsLoading(false);
      };
    } else {
      let isUpdating = true;
      const newRank: number = Number(value);
      const allowed: boolean = await userFetcher.canAssignNewRank(
        venueId,
        user.id,
        newRank,
      );
      // VALIDATION: must be continuous
      if (!allowed) {
        toast({
          title: "Invalid Rank",
          description: `You must select one more than current max rank before choosing ${newRank}.`,
          duration: 3000,
          isClosable: true,
          status: "error",
        });

        isUpdating = false;
      }

      if (isUpdating) {
        updatePref = async () => {
          let preferences_ = [];
          const preference = await userFetcher.getPreferenceByVenue(
            user.id,
            venueId,
          );
          if (preference) {
            preferences_ = await userFetcher.updatePreference(
              preference.id,
              newRank,
              user.id,
            );
          } else {
            preferences_ = await userFetcher.addOnePreference(
              venueId,
              user.id,
              newRank,
            );
          }
          if (preferences_.length === 0) {
            toast({
              title: "Overlapping Rank",
              description: `You cannot have the same preference for multiple venues`,
              duration: 3000,
              isClosable: true,
              status: "error",
            });
          } else {
            setPreferences(preferences_);
          }

          setIsLoading(false);
        };
      } else {
        updatePref = async () => {
          setIsLoading(false);
        };
      }
    }

    await updatePref();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter((prev) => ({
      ...prev,
      location: e.target.value,
    }));
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter((prev) => ({
      ...prev,
      capacity: Number(e.target.value),
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter((prev) => ({
      ...prev,
      price: Number(e.target.value),
    }));
  };

  const handleSuitabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSuitability = e.target.value === "" ? "" : (e.target.value as Suitability);

    setFilter((prev) => ({
      ...prev,
      suitability: nextSuitability,
    }));
  };

  const handleSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // setAppliedFilter(filter);
    router.push({
      pathname: "/venues/venue-listing",
      query: {
        ...(filter.name && { name: filter.name }),
        ...(filter.location && { location: filter.location }),
        ...(filter.capacity && { capacity: filter.capacity }),
        ...(filter.price && { price: filter.price }),
        ...(filter.suitability && { suitability: filter.suitability }),
      },
    });
  };

  const handleResetFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setFilter({
      name: "",
      location: "",
      capacity: undefined,
      price: undefined,
      suitability: "",
    });

    router.push({
      pathname: "/venues/venue-listing",
      query: {},
    });
  };

  
  useEffect(() => {
    // console.log("User: ",user);
    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }

    if (user.role !== "hirer") {
      router.replace("/404");
      return;
    }
    setIsLoading(true);

    const loadPreference = async () => {
      const preferences = await userFetcher.getAllPreference(user.id);
      setPreferences(preferences);
    };

    loadPreference();

    const fetchVenue = async () => {
      const {featured_venues,non_featured_venues} = await venueFetcher.getAllVenues(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      setFeaturedVenues(featured_venues);
      setNonFeaturedVenues(non_featured_venues);
      setIsLoading(false);
    };

    fetchVenue();
  }, [user]);

  

  useEffect(() => {
    const fetchVenues = async () => {
      const name =
        typeof router.query.name === "string" ? router.query.name : undefined;
      const location =
        typeof router.query.location === "string"
          ? router.query.location
          : undefined;
      const suitability =
        typeof router.query.suitability === "string"
          ? (router.query.suitability as Suitability)
          : undefined;
      const capacity =
        typeof router.query.capacity === "string"
          ? Number(router.query.capacity)
          : undefined;
      const price =
        typeof router.query.price === "string"
          ? Number(router.query.price)
          : undefined;
      const {featured_venues : fv,non_featured_venues : nfv} = await venueFetcher.getAllVenues(
        name,
        location,
        price,
        capacity,
        suitability,
      );
      setFeaturedVenues(fv);
      setNonFeaturedVenues(nfv);
    };

    fetchVenues();
  }, [router.query]);

  useEffect(() => {
    let isSubscribed = true;

    // Subscribe to userCreated events
    const unsubscribe = wsClient.subscribe<Discounted_Venue>(
      {
        query: SUBCRIPTION_DISCOUNTED_VENUE
      },
      {
        next: (data) => {
          if (!isSubscribed) return;
          const venue = data?.data?.discountedVenue;
          if (venue) {
            if(venue.is_featured)
            {
              setFeaturedVenues(prev => (prev.map((elem) =>{
                if(elem.id !== Number(venue.id)) return elem;
                return {
                  ...elem,
                  price: venue.price,
                  discounted_percentage: venue.discounted_percentage,
                };
              })));
            }
            else
            {
              setNonFeaturedVenues(prev => (prev.map((elem) =>{
                if(elem.id !== Number(venue.id)) return elem;
                return {
                  ...elem,
                  price: venue.price,
                  discounted_percentage: venue.discounted_percentage,
                };
              })));
            }
          }
        },
        error: (error: Error) => console.error("Subscription error:", error),
        complete: () => console.log("Subscription completed"),
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    // Subscribe to userCreated events
    const unsubscribe = wsClient.subscribe<RemovedDiscounted_Venue>(
      {
        query: SUBSCRIPTION_REMOVED_DISCOUNTED_VENUE
      },
      {
        next: (data) => {
          if (!isSubscribed) return;
          const venue = data?.data?.removedDiscountedVenue;
          if (venue) {
            if(venue.is_featured)
            {
              setFeaturedVenues(prev => (prev.map((elem) =>{
                if(elem.id !== Number(venue.id)) return elem;
                return {
                  ...elem,
                  price: venue.price,
                  discounted_percentage: venue.discounted_percentage,
                };
              })));
            }
            else
            {
              setNonFeaturedVenues(prev => (prev.map((elem) =>{
                if(elem.id !== Number(venue.id)) return elem;
                return {
                  ...elem,
                  price: venue.price,
                  discounted_percentage: venue.discounted_percentage,
                };
              })));
            }
          }
        },
        error: (error: Error) => console.error("Subscription error:", error),
        complete: () => console.log("Subscription completed"),
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);


  return (
    <Container maxW="container.xl">
      <div className="p-4 grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-2 lg:grid-cols-4">
        <Input
          maxLength={40}
          type="text"
          placeholder="Filter by Venue Name"
          value={filter.name}
          onChange={handleNameChange}
        />
        <Input
          maxLength={40}
          type="text"
          placeholder="Filter by Venue Location"
          value={filter.location}
          onChange={handleLocationChange}
        />
        <Input
          type="number"
          min={0}
          placeholder="Filter by Minimum Venue Capacity"
          value={filter.capacity || ""}
          onChange={handleCapacityChange}
        />
        <Input
          type="number"
          min={0}
          placeholder="Filter by Maximum Venue Price"
          value={filter.price || ""}
          onChange={handlePriceChange}
        />
        <Select value={filter.suitability ?? ""} onChange={handleSuitabilityChange}>
          <option value={""}>None</option>
          <option value="tennis">Tennis</option>
          <option value="dinner">Dinner</option>
          <option value="classical music">Classical Music</option>
          <option value="rock concert">Rock Concert</option>
          <option value="birthday">Birthday</option>
          <option value="wedding">Wedding</option>
        </Select>
        <Button color={buttonColor} className="w-20" onClick={handleSearch}>
          <Search2Icon />
        </Button>

        <Button
          color={buttonColor}
          className="w-30"
          onClick={handleResetFilter}
        >
          Reset Filter
        </Button>
      </div>
      {isLoading || !router.isReady ? (
        <Center>
          <Center><Spinner /></Center>
        </Center>
      ) : (
        <VStack align="stretch" spacing={10}>
          {featuredVenues.length > 0 && (
            <Box>
              <Heading size="md" mb={4}>
                Featured Venues
              </Heading>

              <SimpleGrid
                justifyItems={{ base: "center", md: "stretch" }}
                alignItems={{ base: "stretch", md: "stretch" }}
                columns={{ base: 1, sm: 1, md: 2, lg: 3 }}
                spacing={4}
              >
                {featuredVenues.map((elem) => (
                  <Venue
                    key={elem.id}
                    id={elem.id}
                    name={elem.name}
                    location={elem.location}
                    capacity={elem.capacity}
                    price={elem.price}
                    image={elem.image}
                    description={elem.description}
                    rating={elem.rating}
                    suitabilities={elem.suitabilities}
                    is_featured={elem.is_featured}
                    discounted_percentage={elem.discounted_percentage}
                    num_ratings={elem.num_ratings}
                    userId={elem.userId}
                    preferences={preferences}
                    onTogglePreferences={handleChangePreferences}
                    bookedTimes={elem.bookedTimes}
                    createdAt={elem.createdAt}
                    total={featuredVenues.length + nonFeaturedVenues.length}
                    updatedAt={elem.updatedAt}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}

          {nonFeaturedVenues.length > 0 && (
            <Box>
              <Heading size="md" mb={4}>
                Other Venues
              </Heading>

              <SimpleGrid
                justifyItems={{ base: "center", md: "stretch" }}
                alignItems={{ base: "stretch", md: "stretch" }}
                columns={{ base: 1, sm: 1, md: 2, lg: 3 }}
                spacing={4}
              >
                {nonFeaturedVenues.map((elem) => (
                  <Venue
                    key={elem.id}
                    id={elem.id}
                    name={elem.name}
                    location={elem.location}
                    capacity={elem.capacity}
                    price={elem.price}
                    image={elem.image}
                    description={elem.description}
                    rating={elem.rating}
                    suitabilities={elem.suitabilities}
                    is_featured={elem.is_featured}
                    discounted_percentage={elem.discounted_percentage}
                    num_ratings={elem.num_ratings}
                    userId={elem.userId}
                    preferences={preferences}
                    onTogglePreferences={handleChangePreferences}
                    bookedTimes={elem.bookedTimes}
                    createdAt={elem.createdAt}
                    total={featuredVenues.length + nonFeaturedVenues.length}
                    updatedAt={elem.updatedAt}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}
        </VStack>
      )}
      {!isLoading && (featuredVenues.length + nonFeaturedVenues.length) === 0 ? (
        <NoVenuesFound message="No Venues found" />
      ) : (
        !isLoading &&
        ((featuredVenues.length + nonFeaturedVenues.length) === 0) && (
          <NoVenuesFound message="No matching venues found" />
        )
      )}
    </Container>
  );
}
