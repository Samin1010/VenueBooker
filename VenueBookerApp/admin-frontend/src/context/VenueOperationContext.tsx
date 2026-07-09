import { VenueFetcherServices } from "@/services/api";
import type { VenueDto } from "@admin-shared/types";
import { Center, Spinner, useToast } from "@chakra-ui/react";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/router";

type VenueTypeForContext = Omit<
  VenueDto,
  "vendor_id" | "applications" | "bookedTimes" | "createdAt" | "updatedAt"
>;

interface VenueOperationContextType {
  venues: VenueTypeForContext[];
  onDelete: (id: number) => Promise<void>;
  onDiscount: (id: number) => Promise<void>;
  onRemoveDiscount: (id: number) => Promise<void>;
  isLoading : boolean;
}

const VenueOperationContext = createContext<VenueOperationContextType | null>(
  null,
);

export function VenueOperationContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [venues, setVenues] = useState<VenueTypeForContext[]>([]);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { user } = useAuth();
  const router = useRouter();

  const fetchVenues = async () => {
    try {
      const venues_: Array<VenueTypeForContext> =
        await VenueFetcherServices.getAllVenues();
      setVenues(venues_);
    } catch (error) {
      setError("Error while loading all the venues");
    } finally {
      setIsLoading(false);
    }
  };

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

    fetchVenues();
  }, [router]);

  const onDelete = async (id: number) => {
    setIsLoading(true);
    try {
      await VenueFetcherServices.deleteVenue(id);
      setVenues((previousVenues) =>
        previousVenues.filter((venue) => venue.id !== id),
      );
    } catch (error) {
      toast({
        title: "Failed to Delete",
        description: "Failed to delete the venue",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDiscount = async (id: number) => {
    setIsLoading(true);
    try {
      const discountedVenue = await VenueFetcherServices.discountVenue(id);
      setVenues((prev) =>
        prev.map((elem) => {
          if (elem.id !== discountedVenue.id) return elem;
          //elem.discounted_percentage = discountedVenue.discounted_percentage;
          return {
            ...elem,
            price: discountedVenue.price,
            discounted_percentage: discountedVenue.discounted_percentage,
          };
        }),
      );
    } catch (error) {
      toast({
        title: "Failed to Discount 45%",
        description: "Failed to Discount 45%",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRemoveDiscount = async (id: number) => {
    setIsLoading(true);
    try {
      const venue = await VenueFetcherServices.removedDiscountFromVenue(id);
      setVenues((prev) =>
        prev.map((elem) => {
          if (elem.id !== venue.id) return elem;
          //elem.discounted_percentage = discountedVenue.discounted_percentage;
          return {
            ...elem,
            price: venue.price,
            discounted_percentage: venue.discounted_percentage,
          };
        }),
      );
    } catch (error) {
      toast({
        title: "Failed to Remove Discount",
        description: "Failed to remove the 45% discount",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !router.isReady) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <VenueOperationContext.Provider
      value={{ venues, onDelete, onDiscount, onRemoveDiscount , isLoading }}
    >
      {children}
    </VenueOperationContext.Provider>
  );
}

export function useVenueOperationContext() {
  const value = useContext(VenueOperationContext);

  if (!value) {
    throw new Error("Venue Operation Context does not exist");
  }

  return value;
}
