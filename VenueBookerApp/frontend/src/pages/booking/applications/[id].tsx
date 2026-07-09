import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router';
import Application from '@/types/ApplicationType';
import React, { useEffect, useState } from 'react'
import { Box, Button, Divider, HStack, Center, Spinner , Text, VStack,Image, Textarea, useToast} from '@chakra-ui/react';
import { VenueType } from '@/types/VenueType';
import Link from 'next/link';
import { ArrowLeft, Check, X ,Calendar,Clock,Hourglass,Users} from 'lucide-react';
import { ApplicationFetcherService } from '@/services/application.api';

export default function ApplicationPage() {

  const {user,} = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [application,setApplication] = useState<Application | null>(null);
  const [hirerName,setHirerName] = useState<string>("");
  const [venue,setVenue] = useState<VenueType | null>(null);
  const applicationFetcherService = new ApplicationFetcherService();
  const [isUpdatingStatus,setIsUpdatingStatus] = useState<boolean>(false);
  const [isUpdatingComment,setIsUpdatingComment] = useState<boolean>(false);


  const [isLoading,setIsLoading] = useState<boolean>(true);
  const [comment, setComment] = useState(application?.vendorReason || "");

  useEffect(() => {
    if ( !router.isReady) return;
    if(!user)
    {
      router.replace('/auth/sign-in');
      return;
    }

    if(user.role !== "vendor")
    {
      router.replace('/404');
      return;
    }

    let id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
    if(isNaN(Number(id)))
    {
      id = "-1";
    }
    const fetchApplication = async (application_id : number) => {
      
      
      const application = await applicationFetcherService.getApplication(user.id,application_id);

      if(!application)
      {
        setIsLoading(false);
        router.replace("/404");
        return;
      }
      const {hirer_name,venue , ...applic} = application;
      setApplication(applic);
      setHirerName(hirer_name);
      setVenue(venue);
      setComment(application.vendorReason);
      setIsLoading(false);
    }

    fetchApplication(Number(id));
  },[user,router.isReady]);

  const handleAccept = async () => {
    if(!application || !venue || !user) return;
    setIsUpdatingStatus(true);

    const result = await applicationFetcherService.updateStatus(application.id,user.id,"accepted");
    
    if(!result.success)
    {
      toast({
        title : "Failed",
        description : result.reason,
        isClosable : true,
        duration : 3000,
        status : "error"
      })
      setIsUpdatingStatus(false);
      return;
    }

    toast({
      title : "Success",
      description : "Successfully accepted the application",
      status : "success",
      duration : 3000,
      isClosable : true
    });
    setApplication(prev => prev ? {...prev, status: "accepted"} : prev);
    setIsUpdatingStatus(false);
  }


  const handleReject = async ()  => {
    if(!application || !venue || !user) return;

    setIsUpdatingStatus(true);

    const result = await applicationFetcherService.updateStatus(application.id,user.id,"rejected");

    if(!result.success)
    {
      toast({
        title : "Failed",
        description : result.reason,
        isClosable : true,
        duration : 3000,
        status : "error"
      })
      setIsUpdatingStatus(false);
      return;
    }
    toast({
      title : "Success",
      description : "Successfully rejected the application",
      status : "success",
      duration : 3000,
      isClosable : true
    });
    setApplication(prev => prev ? {...prev, status: "rejected"} : prev);
    setIsUpdatingStatus(false);
  }

  const handleSaveComment = async () => {
    if(application === null) return;
    setIsUpdatingComment(true);

    if(!user) {
      setIsUpdatingComment(false);
      return;
    }

    const result = await applicationFetcherService.updateComment(application.id,user.id,comment);

    if(!result.success)
    {
      toast({
        title : "Failed",
        description : result.reason,
        isClosable : true,
        duration : 3000,
        status : "error"
      });
      setIsUpdatingComment(false);
      return;
    }
    toast({
      title : "Success",
      description : "Successfully added the comment",
      isClosable : true,
      duration : 3000,
      status : "success"
    });
    setApplication({...application,vendorReason : comment});
    setIsUpdatingComment(false);
  }


  return (
    <div className="bg-linear-to-r from-blue-500 via-blue-600 to-indigo-600 pt-10 pb-24">
      <div className="mx-auto max-w-200 bg-white">
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
        application && venue ? (
          <Box 
            p={5} 
            shadow="md" 
            borderWidth="1px" 
            borderRadius="lg" 
            w="100%" 
            display="flex"
            flexDir={"column"}
            rounded="none"
          >
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
            <VStack align="flex-start" spacing={3}>

              <Text fontSize="lg" fontWeight="bold">
                {application.eventName}
              </Text>

              <HStack>
                <Text fontWeight="semibold"><Calendar/> Date:</Text>
                <Text>{new Date(application.date).toDateString()}</Text>
              </HStack>

              <HStack>
                <Text fontWeight="semibold"><Clock/> Time:</Text>
                <Text>{application.time}</Text>
              </HStack>

              <HStack>
                <Text fontWeight="semibold"><Hourglass /> Duration:</Text>
                <Text>{application.duration} hrs</Text>
              </HStack>

              <HStack>
                <Text fontWeight="semibold"><Users/> Guests:</Text>
                <Text>{application.expectedGuests}</Text>
              </HStack>

              <Divider/>

              <Text fontWeight={"bold"}>Hirer</Text>
              <HStack>
                <Text fontWeight={"semibold"}>Hirer Name:</Text>
                <Text>{hirerName}</Text>
              </HStack>

              <Button _hover={{bg: "gray.400"}}>
                <Link href={`/user/vendor/hirers/${application.userId}`}>
                  View Profile
                </Link>
              </Button>

              <Divider/>

              <Text fontWeight={"bold"}>Venue: </Text>
              {venue.image.trim() ? (
                <Image src={venue.image} w={12} h={10} alt={venue.name}/>
              ) : (
                <Center w={12} h={10} bg="gray.100">
                  <Text color="gray.500" fontSize="xs">No image</Text>
                </Center>
              )}
              <HStack>
                <Text fontWeight={"semibold"}>Venue Name: </Text>
                <Text>{venue.name}</Text>
              </HStack>
        
              <HStack>
                <Text fontWeight={"semibold"}>Venue Location: </Text>
                <Text>{venue.location}</Text>
              </HStack>

              <HStack>
                <Text fontWeight={"semibold"}>Venue Price: </Text>
                <Text>{venue.price}</Text>
              </HStack>

              <Divider/>

              <HStack justify={"center"} w="100%">
                {application.status === "pending" ? (
                  <>
                    <Button isDisabled={isUpdatingStatus} onClick={handleAccept} bg={"green.500"} _hover={{bg : "green.700",color : "white"}} color={"white"}><Check/>Accept</Button>
                    <Button isDisabled={isUpdatingStatus} onClick={handleReject} bg={"red.500"} _hover={{bg : "red.700",color : "white"}} color={"white"}><X/>Reject</Button>
                  </>
                ) : (
                  <Text fontWeight={"semibold"}>You have already {application.status} the application</Text>
                )}
              </HStack>

              {application.status === "accepted" && (
              <>
                <Divider />

                <Text fontWeight="bold">Vendor Notes</Text>

                <Textarea
                  maxLength={40}
                  placeholder="Add notes about this booking..."
                  value={comment}
                  isDisabled={isUpdatingComment}
                  onChange={(e) => setComment(e.target.value)}
                  bg="gray.50"
                />

                <HStack w="100%" justify="flex-end">
                  <Button
                    isLoading={isUpdatingComment}
                    size="sm"
                    colorScheme="blue"
                    onClick={handleSaveComment}
                  >
                    Save Comment
                  </Button>
                </HStack>
              </>
            )}
            </VStack>
          </Box>
        ) : <p>Application does not exist</p>}
      </div>
    </div>
    
  )
}
