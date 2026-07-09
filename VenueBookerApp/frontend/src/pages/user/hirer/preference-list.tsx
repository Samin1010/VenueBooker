import NoPreferenceItemFound from '@/components/NoPreferenceItemFound';
import PreferenceListComponent from '@/components/PreferenceListComponent';
import { useAuth } from '@/context/AuthContext';
import { PreferenceType } from '@/types/PreferenceType';
import { Button, HStack, Center, Spinner, Td, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
} from '@chakra-ui/react'
import { ArrowLeft } from 'lucide-react';
import { UserFetcherService } from '@/services/users.api';

export default function PreferenceList() {
      const {user} = useAuth();
      const router = useRouter();
      const [isLoading,setIsLoading] = useState<boolean>(false);
      const [preferences,setPreferences] = useState<PreferenceType[]>([]);
      const userFetcherService = new UserFetcherService();
      const toast = useToast();
  
      useEffect(() => {
          if(!user)
          {
            // toast({
            //   title : "User not signed in",
            //   description : "User needs to sign in first",
            //   status : "warning",
            //   duration : 3000,
            //   isClosable : true,
            //   position : "top"
            // });
            router.replace("/auth/sign-in");
            return;
          }
        
          if(user && user.role !== "hirer")
          {
            router.replace("/404");
            return;
          }
          setIsLoading(true);

          const loadPreference = async (userId : number) => {
            const preferences_ : PreferenceType[] = await userFetcherService.getAllPreference(userId);
            setPreferences(preferences_);
            setIsLoading(false);
          }

          loadPreference(user.id);
      },[user]);
      
      return (
          <div>
            <div className=" text-3xl sm:text-5xl font-bold tracking-widest flex items-center justify-center h-25 bg-blue-500 text-amber-50">
              Preference List
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
            {isLoading || !router.isReady ? <Center><Spinner /></Center> : (
              <TableContainer>
                <Table variant='simple'>
                  {/* <TableCaption>Preference List of Venues</TableCaption> */}
                  <Thead>
                    <Tr>
                      <Th>Rank</Th>
                      <Th>Venue Name</Th>
                      <Th>Location</Th>
                      <Th>Price</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                      {preferences.length === 0 ? (
                        <Tr>
                          <Td colSpan={4} textAlign="center">
                            <NoPreferenceItemFound/>
                          </Td>
                        </Tr>
                      ) : (
                        preferences.map((elem) => (
                          <PreferenceListComponent
                            id={elem.id}
                            key={elem.id}
                            venueId={elem.venueId}
                            pref_no={elem.pref_no}
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
