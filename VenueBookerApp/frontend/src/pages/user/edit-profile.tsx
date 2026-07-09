import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  Stack,
  Box,
  Text,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  useToast,
  VStack,
  Heading,
  FormHelperText,
  CircularProgress,
  FormErrorMessage,
} from "@chakra-ui/react";
import { trimString } from "@/utils/trim";

import {
  FileExtensionType,
  FileType,
  UserDocument,
} from "@/types/UserDocument";
import { useDocuments } from "@/context/DocumentContext";
import CredibilityMeter from "@/components/CredibilityMeter";
import { UserFetcherService } from "@/services/users.api";
import type { UserDto } from "@shared/types";
function mimeTypeToExtension(type: string): FileExtensionType | null {
  switch (type) {
    case "application/pdf":
      return ".pdf";

    case "image/jpg":
      return ".jpg";

    case "image/jpeg":
      return ".jpeg";

    case "image/png":
      return ".png";

    default:
      return null;
  }
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const toast = useToast();
  // const [isLoading,setIsLoading] = useState<boolean>(false);
  const [isDisabled, setDisabled] = useState(true);

  const [firstNameError, setFirstNameError] = useState<string>("");
  const [lastNameError, setLastNameError] = useState<string>("");
  const [phoneNoError, setPhoneNoError] = useState<string>("");

  const userFetcherService = new UserFetcherService();

  const [user_, setUser_] = useState<
    Omit<UserDto, "role" | "id" | "updatedAt" | "password">
  >({
    first_name: "",
    last_name: "",
    phone: "",
    createdAt: "",
    email: "",
    username: "",
  });

  const {
    currentIdentityFile,
    currentInsuranceFile,
    currentRiskFile,
    currentAlcoholFile,
    setCurrentIdentityFile,
    setCurrentInsuranceFile,
    setCurrentRiskFile,
    setCurrentAlcoholFile,
    credibility,
  } = useDocuments();

  useEffect(() => {
    if (!user) {
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
    setUser_({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      createdAt: user.createdAt,
      email: user.email,
      username: user.username,
    });
  }, [user, router]);

  useEffect(() => {
    if (!isValidName(user_.first_name)) {
      setFirstNameError("The First Name is not Valid");
      return;
    }
    setFirstNameError("");
  }, [user_.first_name]);

  useEffect(() => {
    if (!isValidName(user_.last_name)) {
      setFirstNameError("The Last Name is not Valid");
      return;
    }
    setLastNameError("");
  }, [user_.last_name]);

  useEffect(() => {
    if (user_.phone && !isValidPhone(user_.phone)) {
      setPhoneNoError("Phone number is not valid");
      return;
    }
    setPhoneNoError("");
  }, [user_.phone]);

  if (!user) return null;

  const handleEditButton = () => {
    setDisabled(false);
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser_((prev) => ({
      ...prev,
      first_name: e.target.value,
    }));
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser_((prev) => ({
      ...prev,
      last_name: e.target.value,
    }));
  };

  // const handleEmailChange = (e : React.ChangeEvent<HTMLInputElement>) => {
  //     setUser_(prev => ({
  //         ...prev,
  //         email : e.target.value
  //     }))
  // }

  // const handleUserNameChange = (e : React.ChangeEvent<HTMLInputElement>) => {
  //     setUser_(prev => ({
  //         ...prev,
  //         username : e.target.value
  //     }))
  // }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser_((prev) => ({
      ...prev,
      phone: e.target.value,
    }));
  };

  const isValidName = (name: string) => {
    return /^[A-Za-z]{1,40}$/.test(name);
  };

  const isValidPhone = (phone: string) => {
    return /^\d{9}$/.test(phone);
  };

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
      return toast({
        title: "Failed",
        description: "Invalid Name",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else if (user_.phone && !isValidPhone(user_.phone)) {
      return toast({
        title: "Failed",
        description: "Invalid Phone Number",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      const updatedUser = {
        ...user,
        username: trimString(user_.username),
        first_name: trimString(user_.first_name),
        last_name: trimString(user_.last_name),
        phone: user_.phone ? trimString(user_.phone) : user_.phone,
        email: trimString(user_.email),
      };
      await userFetcherService.updateUser(
        updatedUser.id,
        updatedUser.first_name,
        updatedUser.last_name,
        updatedUser.email,
        updatedUser.username,
        updatedUser.phone ?? "",
      );
      setDisabled(true);
      setUser(updatedUser);
    }
  };
  //docs

  const handleID = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Failed",
        description: "Max file size 2MB",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const extension = mimeTypeToExtension(file.type);

    if (!extension) {
      toast({
        title: "Invalid file type",
        description: "Only PDF, JPG, JPEG, and PNG are allowed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const asBase64String = reader.result as string;

      const newFile: Omit<UserDocument, "id" | "createdAt" | "updatedAt"> = {
        userId: user.id,
        data: asBase64String,
        file_type: "identity",
        file_extension_type: extension,
        file_name: file.name,
      };

      const savedFile: UserDocument | null = currentIdentityFile
        ? await userFetcherService.updateUserDocumentFile(
            user.id,
            currentIdentityFile.id,
            newFile,
          )
        : await userFetcherService.uploadUserDocumentFile(user.id, newFile);

      //const newFileUploaded : UserDocument | null = await userFetcherService.uploadUserDocumentFile(user.id,newFile)

      if (!savedFile) {
        toast({
          title: "Failure to Uploaded Identity File",
          description: "Failed to upload file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      toast({
        title: "Success",
        description: "File uploaded",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setCurrentIdentityFile(savedFile);
    };
    reader.readAsDataURL(file);
  };

  const handleInsurance = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Failed",
        description: "Max file size 2MB",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const extension = mimeTypeToExtension(file.type);

    if (!extension) {
      toast({
        title: "Invalid file type",
        description: "Only PDF, JPG, JPEG, and PNG are allowed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const asBase64String = reader.result as string;
      const newFile: Omit<UserDocument, "id" | "createdAt" | "updatedAt"> = {
        userId: user.id,
        data: asBase64String,
        file_type: "insurance",
        file_extension_type: extension,
        file_name: file.name,
      };

      const savedFile: UserDocument | null = currentInsuranceFile
        ? await userFetcherService.updateUserDocumentFile(
            user.id,
            currentInsuranceFile.id,
            newFile,
          )
        : await userFetcherService.uploadUserDocumentFile(user.id, newFile);

      //const newFileUploaded : UserDocument | null = await userFetcherService.uploadUserDocumentFile(user.id,newFile)

      if (!savedFile) {
        toast({
          title: "Failure to Uploaded Identity File",
          description: "Failed to upload file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      toast({
        title: "Success",
        description: "File uploaded",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setCurrentInsuranceFile(savedFile);
    };
    reader.readAsDataURL(file);
  };

  const handleRisk = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      toast({
        title: "Failed",
        description: "Max file size 2MB",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const extension = mimeTypeToExtension(file.type);

    if (!extension) {
      toast({
        title: "Invalid file type",
        description: "Only PDF, JPG, JPEG, and PNG are allowed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const asBase64String = reader.result as string;

      const newFile: Omit<UserDocument, "id" | "createdAt" | "updatedAt"> = {
        userId: user.id,
        data: asBase64String,
        file_type: "risk",
        file_extension_type: extension,
        file_name: file.name,
      };

      const savedFile: UserDocument | null = currentRiskFile
        ? await userFetcherService.updateUserDocumentFile(
            user.id,
            currentRiskFile.id,
            newFile,
          )
        : await userFetcherService.uploadUserDocumentFile(user.id, newFile);

      if (!savedFile) {
        toast({
          title: "Failure to Upload Risk File",
          description: "Failed to upload file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      toast({
        title: "Success",
        description: "File uploaded",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setCurrentRiskFile(savedFile);
    };

    reader.readAsDataURL(file);
  };

  const handleAlcohol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      toast({
        title: "Failed",
        description: "Max file size 2MB",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const extension = mimeTypeToExtension(file.type);

    if (!extension) {
      toast({
        title: "Invalid file type",
        description: "Only PDF, JPG, JPEG, and PNG are allowed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const asBase64String = reader.result as string;

      const newFile: Omit<UserDocument, "id" | "createdAt" | "updatedAt"> = {
        userId: user.id,
        data: asBase64String,
        file_type: "alcohol",
        file_extension_type: extension,
        file_name: file.name,
      };

      const savedFile: UserDocument | null = currentAlcoholFile
        ? await userFetcherService.updateUserDocumentFile(
            user.id,
            currentAlcoholFile.id,
            newFile,
          )
        : await userFetcherService.uploadUserDocumentFile(user.id, newFile);

      //const newFileUploaded: UserDocument | null =
      //await userFetcherService.uploadUserDocumentFile(user.id, newFile);

      if (!savedFile) {
        toast({
          title: "Failure to Upload Alcohol File",
          description: "Failed to upload file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      toast({
        title: "Success",
        description: "File uploaded",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setCurrentAlcoholFile(savedFile);
    };

    reader.readAsDataURL(file);
  };

  return (
    <>
      <Stack direction={{ base: "column", md: "row" }} spacing={4}>
        <Box paddingTop={"5vh"} paddingLeft={"6vw"}>
          <VStack spacing={2} align={"start"}>
            <Box bg="white" p={4} borderRadius="12px" boxShadow="md">
              <Heading>Profile Details</Heading>
            </Box>
            <Box paddingTop={4} paddingLeft={1}>
              <VStack spacing={3} align={"start"}>
                <form onSubmit={handleSubmit}>
                  <HStack spacing={5}>
                    <FormControl isInvalid={firstNameError !== ""}>
                      <FormLabel>First Name</FormLabel>
                      <Input
                        maxLength={40}
                        onChange={handleFirstNameChange}
                        isDisabled={isDisabled}
                        value={user_.first_name || ""}
                        _disabled={{ color: "black" }}
                      ></Input>
                      <FormErrorMessage>{firstNameError}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={lastNameError !== ""}>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        maxLength={40}
                        onChange={handleLastNameChange}
                        isDisabled={isDisabled}
                        value={user_.last_name || ""}
                        _disabled={{ color: "black" }}
                      ></Input>
                      <FormErrorMessage>{lastNameError}</FormErrorMessage>
                    </FormControl>
                  </HStack>
                  <FormControl>
                    <FormLabel>User Name</FormLabel>
                    <Input
                      isDisabled={true}
                      value={user_.username || ""}
                      _disabled={{ color: "black" }}
                    ></Input>
                  </FormControl>
                  <FormControl isInvalid={phoneNoError !== ""}>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      maxLength={9}
                      _disabled={{ color: "black" }}
                      onChange={handlePhoneChange}
                      isDisabled={isDisabled}
                      value={user_.phone || ""}
                    ></Input>
                    <FormErrorMessage>{phoneNoError}</FormErrorMessage>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Date of Joining</FormLabel>
                    <Input
                      _disabled={{ color: "black" }}
                      isDisabled={true}
                      value={user_.createdAt}
                    ></Input>
                  </FormControl>
                  {!isDisabled && (
                    <Box paddingTop={3}>
                      <HStack>
                        <Button
                          type="submit"
                          bg="#6666FF"
                          color={"white"}
                          _hover={{ bg: "#3F4FE0" }}
                          fontWeight={"normal"}
                          size={"sm"}
                        >
                          Submit
                        </Button>
                        <Button
                          type="button"
                          fontWeight={"normal"}
                          size={"sm"}
                          _hover={{ color: "red" }}
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      </HStack>
                    </Box>
                  )}
                </form>
                {isDisabled && (
                  <Button
                    type="button"
                    bg="#6666FF"
                    color={"white"}
                    _hover={{ bg: "#3F4FE0" }}
                    fontWeight={"normal"}
                    size={"sm"}
                    onClick={handleEditButton}
                  >
                    Edit
                  </Button>
                )}
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    isDisabled={true}
                    value={user.email}
                    _disabled={{ color: "black" }}
                    bg={"gray.50"}
                  ></Input>
                </FormControl>
                {/* <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input isDisabled={true} value={user.password} _disabled={{color:"black"}} bg={"gray.50"}></Input>
                    </FormControl> */}
              </VStack>
            </Box>
          </VStack>
        </Box>
        {user.role === "hirer" ? (
          <Box paddingTop={"5vh"} paddingLeft={"6vw"}>
            <VStack spacing={2} align={"start"}>
              <HStack>
                <Box bg="white" p={4} borderRadius="12px" boxShadow="md">
                  <Heading>Documents</Heading>
                </Box>
                <CredibilityMeter value={credibility}></CredibilityMeter>
              </HStack>
              <Box paddingTop={4} paddingLeft={1}>
                <form>
                  <VStack spacing={4} align={"start"}>
                    <FormControl>
                      <FormLabel>Proof of Identity</FormLabel>
                      <Input
                        onChange={handleID}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                      ></Input>
                      <FormHelperText>
                        Current file: {currentIdentityFile?.file_name || "none"}
                      </FormHelperText>
                      {currentIdentityFile && (
                        <Text color="green.500" fontWeight="semibold">
                          Uploaded
                        </Text>
                      )}
                    </FormControl>
                    <FormControl>
                      <FormLabel>Public Liability Insurance</FormLabel>
                      <Input
                        onChange={handleInsurance}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                      ></Input>
                      <FormHelperText>
                        Current file:{" "}
                        {currentInsuranceFile?.file_name || "none"}
                      </FormHelperText>
                      {currentInsuranceFile && (
                        <Text color="green.500" fontWeight="semibold">
                          Uploaded
                        </Text>
                      )}
                    </FormControl>
                    <FormControl>
                      <FormLabel>Risk Acknowledgement Form</FormLabel>
                      <Input
                        onChange={handleRisk}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                      ></Input>
                      <FormHelperText>
                        Current file: {currentRiskFile?.file_name || "none"}
                      </FormHelperText>
                      {currentRiskFile && (
                        <Text color="green.500" fontWeight="semibold">
                          Uploaded
                        </Text>
                      )}
                    </FormControl>
                    <FormControl>
                      <FormLabel>Alcohol Serving Permit</FormLabel>
                      <Input
                        onChange={handleAlcohol}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                      ></Input>
                      <FormHelperText>
                        Current file: {currentAlcoholFile?.file_name || "none"}
                      </FormHelperText>
                      {currentAlcoholFile && (
                        <Text color="green.500" fontWeight="semibold">
                          Uploaded
                        </Text>
                      )}
                    </FormControl>
                  </VStack>
                </form>
              </Box>
            </VStack>
          </Box>
        ) : null}
      </Stack>
    </>
  );
}
