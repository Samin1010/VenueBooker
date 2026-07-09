import { useAuth } from "@/context/AuthContext";
import { Badge } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Tr,Td } from "@chakra-ui/react"
import Application from "@/types/ApplicationType";

export default function ApplicationListComponent({
    id,date,status,
    venueName,hirerName,hirerRating
} : Omit<Application,"venueId"> & {venueName : string , hirerName : string , hirerRating : number | null})
{
    const statusColor = {
        pending: "yellow",
        accepted: "green",
        approved: "green",
        rejected: "red",
    };

    const {user} = useAuth();
    const router = useRouter();
    // const [venue,setVenue] = useState<VenueType | null>(null);
    //const [isLoading,setIsLoading] = useState<boolean>(false);
    // const toast = useToast();

    useEffect(() => {
        if(!user)
        {
            router.replace("/auth/sign-in");
            return;
        }

        if(user.role !== "vendor")
        {
            router.replace("/404");
            return;
        }

        // setIsLoading(true);
        // // since the component is going to be rendered only if the preferences exists
        // // and in order for the preferences to exists the venues needs to exist
        // const venues_unparsed = localStorage.getItem('venues');
        // if(!venues_unparsed)
        // {
        //     toast({
        //       title: "Venues not initialized",
        //       description: `The Venues is not stored in the system`,
        //       duration : 3000,
        //       isClosable : true,
        //       status: "error"
        //     });
        //     return;
        // }

        // let venues_parsed = JSON.parse(venues_unparsed);

        // for(let i = 0;i < venues_parsed.length;i++)
        // {
        //     if(venues_parsed[i].id === venueId)
        //     {
        //         setVenue(venues_parsed[i]);
        //     }
        // }

        // setIsLoading(false);
    },[user, router]);
    // console.log("i am here");
    return (
        <>
            {(
                <Tr key={id} onClick={() => router.push(`/booking/applications/${id}`)}>
                    <Td>{venueName}</Td>
                    <Td>{new Date(date).toDateString()}</Td>
                    <Td>{hirerName}</Td>
                    <Td>{hirerRating === null ? "Not rated" : hirerRating.toFixed(1)}</Td>
                    <Td>
                        <Badge colorScheme={statusColor[status]}>
                            {status}
                        </Badge>
                    </Td>
                </Tr>
            )}
        </>
    )
}
