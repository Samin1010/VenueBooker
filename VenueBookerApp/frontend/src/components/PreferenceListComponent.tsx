import { useAuth } from "@/context/AuthContext";
import { PreferenceType } from "@/types/PreferenceType";
import { VenueType } from "@/types/VenueType";
import { Center, Spinner, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Tr,Td } from "@chakra-ui/react"
import { VenueFetcherService } from "@/services/venues.api";

export default function PreferenceListComponent({
    pref_no , venueId
} : Omit<PreferenceType,"userId">)
{

    const {user} = useAuth();
    const router = useRouter();
    const [venue,setVenue] = useState<VenueType | null>(null);
    const [isLoading,setIsLoading] = useState<boolean>(false);
    const toast = useToast();
    const venueFetcherService = new VenueFetcherService();

    useEffect(() => {

        if(!user)
        {
            router.replace("/auth/sign-in");
            return;
        }

        if(user.role !== "hirer")
        {
            router.replace("/404");
            return;
        }

        setIsLoading(true);
        // since the component is going to be rendered only if the preferences exists
        // and in order for the preferences to exists the venues needs to exist
        const fetchVenue = async (venueId : number) => {
            const venue_ = await venueFetcherService.getOneVenue(venueId);
            setVenue(venue_);
            setIsLoading(false);
        }

        fetchVenue(venueId);
    },[user]);

    return (
        <>
            {isLoading || !router.isReady || !venue ? (
                <Tr>
                    <Td colSpan={4}>
                        <Center><Spinner /></Center>
                    </Td>
                </Tr> 
                ) : (
                <Tr key={venue.id} onClick={() => router.push(`/venues/${venue.id}`)}>
                    <Td>{pref_no}</Td>
                    <Td>{venue.name}</Td>
                    <Td>{venue.location}</Td>
                    <Td>${venue.price}</Td>
                </Tr>
            )}
        </>
    )
}
