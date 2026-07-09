import { VenueFetcherService } from "@/services/venues.api";
import NoVenuesFound from "@/components/NoVenuesFound";
import Venue from "@/components/Venue";
import { useAuth } from "@/context/AuthContext";
import { VenueType } from "@/types/VenueType";
import { SimpleGrid, Center, Spinner, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import type { VenueDto } from "@shared/types";
import { SUBCRIPTION_DISCOUNTED_VENUE, wsClient } from "@/services/graphql";

interface Discounted_Venue {
  discountedVenue: Omit<VenueDto, "bookedTimes" | "userId">;
}

export default function PersonalVenues() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [venues, setVenues] = useState<VenueType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const venueFetcherService = new VenueFetcherService();

  useEffect(() => {
    if (!router.isReady) return;

    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }

    console.log(user);
    if (user.role !== "vendor") {
      router.replace("/404");
      return;
    }

    setIsLoading(true);

    const loadVenues = async (vendorId: number) => {
      const venues_: VenueType[] =
        await venueFetcherService.getAllVenuesForVendor(vendorId);
      setVenues(venues_);
      setIsLoading(false);
    };

    loadVenues(user.id);
  }, [user, router.isReady]);

  useEffect(() => {
    let isSubscribed = true;

    // Subscribe to userCreated events
    const unsubscribe = wsClient.subscribe<Discounted_Venue>(
      {
        query: SUBCRIPTION_DISCOUNTED_VENUE,
      },
      {
        next: (data) => {
          if (!isSubscribed) return;
          const venue = data?.data?.discountedVenue;
          if (venue) {
            setVenues(prev => (prev.map((elem) => {
                if(elem.id !== Number(venue.id)) return elem;
                return {
                  ...elem,
                  price: venue.price,
                  discounted_percentage: venue.discounted_percentage,
                };
            })))
          }
        },
        error: (error: Error) => console.error("Subscription error:", error),
        complete: () => console.log("Subscription completed"),
      },
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  if (isLoading || !router.isReady) {
    return (
      <div>
        <Center>
          <Spinner />
        </Center>
      </div>
    );
  }

  const onDelete = async (id: number) => {
    const results = await venueFetcherService.deleteOneVenue(id);

    if (!results.success) {
      toast({
        title: "Failed to Delete",
        description: "Failed to delete the venue",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setVenues(results.venues!);
  };

  return (
    <div className="p-4">
      <SimpleGrid
        justifyItems={{ base: "center", md: "stretch" }}
        alignItems={{ base: "stretch", md: "stretch" }}
        columns={{ base: 1, sm: 1, md: 2, lg: 3 }}
        spacing={4}
      >
        {venues.map((elem: VenueType) => (
          // <Link key={elem.id} href={`/venues/${elem.id}`}>
          <Venue
            userId={elem.userId}
            key={elem.id}
            total={venues.length}
            preferences={null}
            onTogglePreferences={null}
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
            bookedTimes={elem.bookedTimes}
            createdAt={elem.createdAt}
            updatedAt={elem.updatedAt}
            num_ratings={elem.num_ratings}
            onDelete={async (e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              await onDelete(elem.id);
            }}
          />
          // </Link>
        ))}
        {venues.length === 0 && <NoVenuesFound message={"No Venues Found"} />}
      </SimpleGrid>
    </div>
  );
}
