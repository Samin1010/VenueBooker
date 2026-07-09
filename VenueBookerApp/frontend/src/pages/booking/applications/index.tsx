import { ApplicationFetcherService } from '@/services/application.api';
import ApplicationCard from '@/components/ApplicationCard';
import ApplicationListComponent from '@/components/ApplicationListComponent';
import NoApplicationsFound from '@/components/NoApplicationsFound';
import { useAuth } from '@/context/AuthContext'
import Application from '@/types/ApplicationType';
import { Button, HStack, Center, Spinner, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useBreakpointValue } from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';

type CustomApplicationType = Application & {
  venue_name : string
  hirer_name : string
  hirer_rating : number | null
}

export default function ApplicationsPage() {

  const {user} = useAuth();
  const router = useRouter();
  const [isLoading,setIsLoading] = useState<boolean>(true);
  const [applications,setApplications] = useState<CustomApplicationType[]>([]);
  const applicationFetcherService = useMemo(() => new ApplicationFetcherService(), []);
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if(!user) {
      router.replace("/auth/sign-in");
      return;
    }
    // console.log(user.role)
    if(user.role !== "vendor")
    {
      console.log("I am here");
      router.replace("/404");
      return;
    }

    const loadApplications = async () => {
      const loadedApplications = await applicationFetcherService.getAllApplications(user.id);
      setApplications(loadedApplications);
      setIsLoading(false);
    };

    void loadApplications();
  },[applicationFetcherService, user, router]);

  return (
    <div className="min-h-screen">
      <div className=" text-3xl sm:text-5xl font-bold tracking-widest flex items-center justify-center h-25 bg-blue-500 text-amber-50">
        Applications Received
      </div>
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
      {isLoading || !router.isReady ? <Center><Spinner /></Center> :
      isMobile ? (
        <div className="grid grid-cols-1 mx-auto p-4">
          {applications.length === 0 && <NoApplicationsFound/>}
          {applications.map((elem) => (
            <ApplicationCard
              key={elem.id}
              expectedGuests={elem.expectedGuests}
              date={elem.date}
              eventName={elem.eventName}
              hirerName={elem.hirer_name}
              hirerRating={elem.hirer_rating}
              status={elem.status}
              venueName={elem.venue_name}
              duration={elem.duration}
              userId={elem.userId}
              id={elem.id}
              time={elem.time}
              vendorReason={elem.vendorReason}
              createdAt={elem.createdAt}
              updatedAt={elem.updatedAt}
            />
          ))}
        </div>
        ) :
        (
        <TableContainer>
          <Table variant='simple'>
            {/* <TableCaption>Preference List of Venues</TableCaption> */}
            <Thead>
              <Tr>
                <Th>Venue Name</Th>
                <Th>Date</Th>
                <Th>Hirer Name</Th>
                <Th>Hirer Rating</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
                {applications.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      <NoApplicationsFound/>
                    </Td>
                  </Tr>
                ) : (
                  applications.map((elem) => (
                    <ApplicationListComponent
                      key={elem.id}
                      date={elem.date}
                      duration={elem.duration}
                      eventName={elem.eventName}
                      expectedGuests={elem.expectedGuests}
                      userId={elem.userId}
                      id={elem.id}
                      status={elem.status}
                      time={elem.time}
                      vendorReason={elem.vendorReason}
                      venueName={elem.venue_name}
                      hirerName={elem.hirer_name}
                      hirerRating={elem.hirer_rating}
                      createdAt={elem.createdAt}
                      updatedAt={elem.updatedAt}
                    />
                  ))
                )}
            </Tbody>
          </Table>
        </TableContainer>
        )}
          {/* {
            preferences.length === 0 && <NoPreferenceItemFound/>
          } */}
    </div>
  )
}
