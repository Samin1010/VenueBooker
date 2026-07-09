import VenueHistoryCard from "@/components/VenueHistoryCard";
import { useAuth } from "@/context/AuthContext";
import { HirerHistoryType } from "@/types/HirerHistoryType";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import AcceptanceRate from "@/components/HirerAcceptanceRate";
import { trimString } from "@/utils/trim";
import { UserFetcherService } from "@/services/users.api";
import {
  Box, Heading, HStack, SimpleGrid, Center, Spinner, Text, VStack,
  Button, FormControl, FormLabel, Input, useToast,
  FormHelperText, Divider, FormErrorMessage, Badge, Flex,
} from "@chakra-ui/react";
import { FileExtensionType, UserDocument } from "@/types/UserDocument";
import { useDocuments } from "@/context/DocumentContext";
import CredibilityMeter from "@/components/CredibilityMeter";
import type { UserDto } from "@shared/types";

type ProfileUser = Omit<UserDto, "role" | "id" | "updatedAt" | "password">;

function mimeTypeToExtension(type: string): FileExtensionType | null {
  switch (type) {
    case "application/pdf": return ".pdf";
    case "image/jpg": return ".jpg";
    case "image/jpeg": return ".jpeg";
    case "image/png": return ".png";
    default: return null;
  }
}

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const userFetcherService = useMemo(() => new UserFetcherService(), []);

  // --- Profile state ---
  const [isDisabled, setDisabled] = useState(true);
  const [user_, setUser_] = useState<ProfileUser>({
    first_name: "",
    last_name: "",
    phone: "",
    createdAt: "",
    email: "",
    username: "",
  });

  const {
    currentIdentityFile, currentInsuranceFile, currentRiskFile, currentAlcoholFile,
    setCurrentIdentityFile, setCurrentInsuranceFile, setCurrentRiskFile, setCurrentAlcoholFile,
    credibility,
  } = useDocuments();

  // --- Dashboard state ---
  const [history, setHistory] = useState<HirerHistoryType[]>([]);
  const [rate, setRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }
    if (user.role !== "hirer") {
      router.replace("/404");
      return;
    }

    setUser_({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      createdAt: user.createdAt,
      email: user.email,
      username: user.username,
    });

    const loadHirerHistory = async () => {
      setIsLoading(true);
      const userHistory = await userFetcherService.getHirerHistory(user.id);
      const accepted = userHistory.filter((elem) => elem.status === "accepted").length;
      setRate(userHistory.length === 0 ? 0 : accepted / userHistory.length);
      setHistory(userHistory);
      setIsLoading(false);
    };
    loadHirerHistory();
  }, [user, router, userFetcherService]);

  const isValidName = (name: string) => /^[A-Za-z]{1,40}$/.test(name);
  const isValidPhone = (phone: string) => /^\d{10}$/.test(phone);

  const firstNameError = !isDisabled && !isValidName(user_.first_name)
    ? "The First Name is not Valid"
    : "";
  const lastNameError = !isDisabled && !isValidName(user_.last_name)
    ? "The Last Name is not Valid"
    : "";
  const phoneNoError = !isDisabled && user_.phone && !isValidPhone(user_.phone)
    ? "Phone number is not valid"
    : "";

  if (!user) return null;
  if (isLoading || !router.isReady) return <Center><Spinner /></Center>;

  // --- Profile handlers ---
  const handleEditButton = () => setDisabled(false);

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUser_((prev) => ({ ...prev, first_name: e.target.value }));
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUser_((prev) => ({ ...prev, last_name: e.target.value }));
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUser_((prev) => ({ ...prev, phone: e.target.value }));

  const handleCancel = () => {
    setUser_({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      createdAt: user.createdAt,
      email: user.email,
      username: user.username,
    });
    setDisabled(true);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!isValidName(user_.first_name) || !isValidName(user_.last_name)) {
      return toast({ title: "Failed", description: "Invalid Name", status: "error", duration: 3000, isClosable: true });
    } else if (user_.phone && !isValidPhone(user_.phone)) {
      return toast({ title: "Failed", description: "Invalid Phone Number", status: "error", duration: 3000, isClosable: true });
    } else {
      const updatedUser = {
        ...user,
        username: trimString(user_.username),
        first_name: trimString(user_.first_name),
        last_name: trimString(user_.last_name),
        phone: user_.phone ? trimString(user_.phone) : user_.phone,
        email: trimString(user_.email),
      };
      const success = await userFetcherService.updateUser(
        updatedUser.id,
        updatedUser.first_name,
        updatedUser.last_name,
        updatedUser.email,
        updatedUser.username,
        updatedUser.phone ?? "",
      );
      if (!success) {
        return toast({ title: "Failed", description: "Could not update profile", status: "error", duration: 3000, isClosable: true });
      }
      setDisabled(true);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast({ title: "Success", description: "Profile updated", status: "success", duration: 3000, isClosable: true });
    }
  };

  // --- Document handlers ---
  const handleID = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Failed", description: "Max file size 2MB", status: "error", duration: 3000, isClosable: true });
      return;
    }
    const extension = mimeTypeToExtension(file.type);
    if (!extension) {
      toast({ title: "Invalid file type", description: "Only PDF, JPG, JPEG, and PNG are allowed", status: "error", duration: 3000, isClosable: true });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const newFile: Omit<UserDocument, "id" | "createdAt" | "updatedAt"> = {
        userId: user.id, data: reader.result as string,
        file_type: "identity", file_extension_type: extension, file_name: file.name,
      };
      const savedFile = currentIdentityFile
        ? await userFetcherService.updateUserDocumentFile(user.id, currentIdentityFile.id, newFile)
        : await userFetcherService.uploadUserDocumentFile(user.id, newFile);
      if (!savedFile) {
        toast({ title: "Failure to Upload Identity File", status: "error", duration: 3000, isClosable: true });
        return;
      }
      toast({ title: "Success", description: "File uploaded", status: "success", duration: 3000, isClosable: true });
      setCurrentIdentityFile(savedFile);
    };
    reader.readAsDataURL(file);
  };

  const handleInsurance = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Failed", description: "Max file size 2MB", status: "error", duration: 3000, isClosable: true });
      return;
    }
    const extension = mimeTypeToExtension(file.type);
    if (!extension) {
      toast({ title: "Invalid file type", description: "Only PDF, JPG, JPEG, and PNG are allowed", status: "error", duration: 3000, isClosable: true });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const newFile: Omit<UserDocument, "id" | "createdAt" | "updatedAt"> = {
        userId: user.id, data: reader.result as string,
        file_type: "insurance", file_extension_type: extension, file_name: file.name,
      };
      const savedFile = currentInsuranceFile
        ? await userFetcherService.updateUserDocumentFile(user.id, currentInsuranceFile.id, newFile)
        : await userFetcherService.uploadUserDocumentFile(user.id, newFile);
      if (!savedFile) {
        toast({ title: "Failure to Upload Insurance File", status: "error", duration: 3000, isClosable: true });
        return;
      }
      toast({ title: "Success", description: "File uploaded", status: "success", duration: 3000, isClosable: true });
      setCurrentInsuranceFile(savedFile);
    };
    reader.readAsDataURL(file);
  };

  const handleRisk = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Failed", description: "Max file size 2MB", status: "error", duration: 3000, isClosable: true });
      return;
    }
    const extension = mimeTypeToExtension(file.type);
    if (!extension) {
      toast({ title: "Invalid file type", description: "Only PDF, JPG, JPEG, and PNG are allowed", status: "error", duration: 3000, isClosable: true });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const newFile: Omit<UserDocument, "id" | "createdAt" | "updatedAt"> = {
        userId: user.id, data: reader.result as string,
        file_type: "risk", file_extension_type: extension, file_name: file.name,
      };
      const savedFile = currentRiskFile
        ? await userFetcherService.updateUserDocumentFile(user.id, currentRiskFile.id, newFile)
        : await userFetcherService.uploadUserDocumentFile(user.id, newFile);
      if (!savedFile) {
        toast({ title: "Failure to Upload Risk File", status: "error", duration: 3000, isClosable: true });
        return;
      }
      toast({ title: "Success", description: "File uploaded", status: "success", duration: 3000, isClosable: true });
      setCurrentRiskFile(savedFile);
    };
    reader.readAsDataURL(file);
  };

  const handleAlcohol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Failed", description: "Max file size 2MB", status: "error", duration: 3000, isClosable: true });
      return;
    }
    const extension = mimeTypeToExtension(file.type);
    if (!extension) {
      toast({ title: "Invalid file type", description: "Only PDF, JPG, JPEG, and PNG are allowed", status: "error", duration: 3000, isClosable: true });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const newFile: Omit<UserDocument, "id" | "createdAt" | "updatedAt"> = {
        userId: user.id, data: reader.result as string,
        file_type: "alcohol", file_extension_type: extension, file_name: file.name,
      };
      const savedFile = currentAlcoholFile
        ? await userFetcherService.updateUserDocumentFile(user.id, currentAlcoholFile.id, newFile)
        : await userFetcherService.uploadUserDocumentFile(user.id, newFile);
      if (!savedFile) {
        toast({ title: "Failure to Upload Alcohol File", status: "error", duration: 3000, isClosable: true });
        return;
      }
      toast({ title: "Success", description: "File uploaded", status: "success", duration: 3000, isClosable: true });
      setCurrentAlcoholFile(savedFile);
    };
    reader.readAsDataURL(file);
  };

  // --- Dashboard stats ---
  const totalEvents = history.length;
  const differentVenues = new Set(history.map((item) => item.venueName)).size;
  const ratedEvents = history.filter((item) => item.rating !== null);
  const averageStarRating = ratedEvents.length === 0
    ? "n/a"
    : (ratedEvents.reduce((sum, item) => sum + (item.rating ?? 0), 0) / ratedEvents.length).toFixed(1);

  return (
    <Box w="100%" maxW="1280px" mx="auto" p={{ base: 4, md: 6 }}>
      <Box mb={6}>
        <Heading size="lg">Profile dashboard</Heading>
        <Text color="gray.600" mt={1}>
          Manage your details, documents, and booking history.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} alignItems="start">
        <Box bg="white" borderRadius="12px" boxShadow="sm" borderWidth="1px" p={{ base: 4, md: 6 }}>
          <Flex align="center" justify="space-between" mb={5}>
            <Box>
              <Heading size="md">Profile details</Heading>
              <Text color="gray.500" fontSize="sm" mt={1}>Your personal and account information.</Text>
            </Box>
            {isDisabled && (
              <Button colorScheme="purple" size="sm" onClick={handleEditButton}>Edit profile</Button>
            )}
          </Flex>

          <form onSubmit={handleSubmit}>
            <VStack align="stretch" spacing={4}>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <FormControl isInvalid={firstNameError !== ""}>
                  <FormLabel>First name</FormLabel>
                  <Input maxLength={40} onChange={handleFirstNameChange} isDisabled={isDisabled} value={user_.first_name || ""} _disabled={{ color: "gray.700", opacity: 1 }} />
                  <FormErrorMessage>{firstNameError}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={lastNameError !== ""}>
                  <FormLabel>Last name</FormLabel>
                  <Input maxLength={40} onChange={handleLastNameChange} isDisabled={isDisabled} value={user_.last_name || ""} _disabled={{ color: "gray.700", opacity: 1 }} />
                  <FormErrorMessage>{lastNameError}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input isDisabled value={user_.username || ""} _disabled={{ color: "gray.700", opacity: 1 }} />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input isDisabled value={user.email} _disabled={{ color: "gray.700", opacity: 1 }} />
              </FormControl>
              <FormControl isInvalid={phoneNoError !== ""}>
                <FormLabel>Phone number</FormLabel>
                <Input maxLength={10} onChange={handlePhoneChange} isDisabled={isDisabled} value={user_.phone || ""} _disabled={{ color: "gray.700", opacity: 1 }} />
                <FormErrorMessage>{phoneNoError}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>Date joined</FormLabel>
                <Input isDisabled value={user_.createdAt.slice(0, 10)} _disabled={{ color: "gray.700", opacity: 1 }} />
              </FormControl>
              {!isDisabled && (
                <HStack pt={1}>
                  <Button type="submit" colorScheme="purple" size="sm">Save changes</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
                </HStack>
              )}
            </VStack>
          </form>
        </Box>

        <Box bg="white" borderRadius="12px" boxShadow="sm" borderWidth="1px" p={{ base: 4, md: 6 }}>
          <Flex align="center" justify="space-between" mb={5}>
            <Box>
              <Heading size="md">Documents</Heading>
              <Text color="gray.500" fontSize="sm" mt={1}>Upload documents used to verify your profile.</Text>
            </Box>
            <CredibilityMeter value={credibility} />
          </Flex>

          <VStack align="stretch" spacing={4}>
            <DocumentUpload label="Proof of identity" fileName={currentIdentityFile?.file_name} onChange={handleID} />
            <DocumentUpload label="Public liability insurance" fileName={currentInsuranceFile?.file_name} onChange={handleInsurance} />
            <DocumentUpload label="Risk acknowledgement form" fileName={currentRiskFile?.file_name} onChange={handleRisk} />
            <DocumentUpload label="Alcohol serving permit" fileName={currentAlcoholFile?.file_name} onChange={handleAlcohol} />
          </VStack>
        </Box>
      </SimpleGrid>

      <Divider my={8} />

      <Box>
        <Flex align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} justify="space-between" gap={4} mb={5}>
          <Box>
            <Heading size="lg">Previously hired venues</Heading>
            <Text color="gray.600" mt={1}>A summary of your past bookings.</Text>
          </Box>
          <HStack>
            <Text color="gray.600" fontSize="sm">Acceptance rate</Text>
            <AcceptanceRate percentage={rate} />
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={6}>
          <StatCard label="Total events" value={totalEvents} />
          <StatCard label="Different venues" value={differentVenues} />
          <StatCard label="Average rating" value={averageStarRating} />
        </SimpleGrid>

        {history.length === 0 ? (
          <Box bg="white" borderRadius="12px" borderWidth="1px" p={6}>
            <Text color="gray.600">No past hiring history available.</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {history.map((item) => (
              <VenueHistoryCard
                key={item.id}
                id={item.id}
                hirerId={item.hirerId}
                venueName={item.venueName}
                location={item.location}
                eventName={item.eventName}
                dateOfHire={item.dateOfHire}
                rating={item.rating}
                status={item.status}
                vendorId={item.vendorId}
                venueId={item.venueId}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}

function DocumentUpload({
  fileName,
  label,
  onChange,
}: {
  fileName: string | null | undefined;
  label: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <FormControl borderWidth="1px" borderRadius="10px" p={4}>
      <Flex align="center" justify="space-between" gap={3} mb={2}>
        <FormLabel mb={0}>{label}</FormLabel>
        <Badge colorScheme={fileName ? "green" : "gray"}>
          {fileName ? "Uploaded" : "Not uploaded"}
        </Badge>
      </Flex>
      <Input onChange={onChange} type="file" accept=".pdf,.jpg,.jpeg,.png" p={1} />
      <FormHelperText>Current file: {fileName || "none"}</FormHelperText>
    </FormControl>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Box bg="white" borderRadius="12px" borderWidth="1px" p={4}>
      <Text color="gray.500" fontSize="sm">{label}</Text>
      <Text fontSize="2xl" fontWeight="bold" mt={1}>{value}</Text>
    </Box>
  );
}
