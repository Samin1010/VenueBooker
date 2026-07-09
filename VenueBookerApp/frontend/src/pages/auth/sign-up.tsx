import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  VStack,
  Heading,
  useToast,
  FormHelperText,
  FormErrorMessage,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { AuthFetcherService } from "@/services/auth.api";

type AuthUser = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  username : string;
};

function isValidEmail(email: string) {
  const trimmedEmail = email.trim();
  if (!trimmedEmail || trimmedEmail.length > 40) {
    return false;
  }

  if (typeof document === "undefined") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  }

  const input = document.createElement("input");
  input.type = "email";
  input.value = trimmedEmail;
  return input.checkValidity();
}

function isValidName(name: string) {
  return /^[A-Za-z]{1,40}$/.test(name);
}

function isValidUsername(username: string) {
  return /^[A-Za-z0-9._-]{3,40}$/.test(username);
}

function isValidPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,40}$/.test(password);
}

export default function SignUp() {
  const [user_, setUser] = useState<AuthUser>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    username : ""
  });

  const router = useRouter();
  const toast = useToast();

  const authFetcherService = new AuthFetcherService();

  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [firstNameError, setFirstNameError] = useState<string>("");
  const [lastNameError, setLastNameError] = useState<string>("");
  const [userNameError, setUserNameError] = useState<string>("");
  const [isSubmitting,setIsSubmitting] = useState<boolean>(false);
  const matchPasswordError =
    confirmPassword && user_.password !== confirmPassword
      ? "The password is not matching"
      : "";

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFirstNameError(value && !isValidName(value) ? "First Name is not valid" : "");
    setUser((prev) => ({
      ...prev,
      firstname: value,
    }));
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLastNameError(value && !isValidName(value) ? "Last Name is not valid" : "");
    setUser((prev) => ({
      ...prev,
      lastname: value,
    }));
  };

  const handleUserNameChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserNameError(value && !isValidUsername(value) ? "The User Name is invalid" : "");
    setUser((prev) => ({
      ...prev,
      username : value
    }));
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailError(value && !isValidEmail(value) ? "The Email is not valid" : "");
    setUser((prev) => ({
      ...prev,
      email: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordError(value && !isValidPassword(value) ? "The Password is not valid" : "");
    setUser((prev) => ({
      ...prev,
      password: value,
    }));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check for empty fields
    if (!user_.firstname.trim()) {
      toast({
        title: "Failed",
        description: "First Name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    } else if (!user_.lastname.trim()) {
      toast({
        title: "Failed",
        description: "Last Name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    } else if (!user_.username.trim()) {
      toast({
        title: "Failed",
        description: "Username is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    } else if (!user_.email.trim()) {
      toast({
        title: "Failed",
        description: "Email is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    } else if (!isValidEmail(user_.email)) {
      setEmailError("The Email is not valid");
      toast({
        title: "Failed",
        description: "The Email is not valid",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    } else if (!user_.password.trim()) {
      toast({
        title: "Failed",
        description: "Password is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    } else if (!confirmPassword.trim()) {
      toast({
        title: "Failed",
        description: "Confirm Password is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

    if (firstNameError) {
      toast({
        title: "Failed",
        description: firstNameError,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    } else if (lastNameError) {
      toast({
        title: "Failed",
        description: lastNameError,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    } else if (emailError) {
      toast({
        title: "Failed",
        description: emailError,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }
    else if(userNameError) {
      toast({
        title: "Failed",
        description: userNameError,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

    //(anubhavking):A2-FSD-PRA01-03-Fri-1230pm-Veronika-Team-04$ node
    // Welcome to Node.js v22.13.0.
    // Type ".help" for more information.
    // > regex1 = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/
    // /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/
    // > regex1.test("Pass@123 ")
    // true
    // > regex1 = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]){6,}$/
    // /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]){6,}$/
    // > regex1.test("Pass@123 ")
    // false
    else if (passwordError) {
      toast({
        title: "Failed",
        description: passwordError,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    } else if (matchPasswordError) {
      toast({
        title: "Failed",
        description: matchPasswordError,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    } else {
      // Trim user inputs before sending to the API (do not alter password semantics)
      const trimmedEmail = user_.email.trim();
      const trimmedFirstName = user_.firstname.trim();
      const trimmedLastName = user_.lastname.trim();
      const trimmedUsername = user_.username.trim();

      const result = await authFetcherService.signUp(
        trimmedEmail,
        trimmedFirstName,
        trimmedLastName,
        trimmedUsername,
        user_.password,
      );

      if(!result.success)
      {
        toast({
          title: "Failed",
          description: result.message,
          status: "error",
          duration: 3000,
          isClosable: true
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Success",
        description: result.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      router.push("/auth/sign-in");
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        mt="0"
        paddingTop="50px"
        height="100vh"
        width="100vw"
      >
        <HStack spacing={0} align="stretch">
          <Box
            display={{ base: "none", md: "block" }}
            bgImage="/whiteBlueGradient.jpg"
            width="40vw"
            height="60vh"
            backgroundSize="cover"
            p="6"
            color="black"
            backgroundRepeat="no-repeat"
            borderRadius="14px"
            border="1px solid rgba(255,255,255,0.25)"
            boxShadow="lg"
          >
            <Heading
              bgGradient="linear(to-r, blue.500, white, blue.500)"
              bgClip="text"
              fontSize="5xl"
            >
              Register your new Account.
            </Heading>
          </Box>
          <Box width="350px" paddingLeft="20px">
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={firstNameError !== ""}>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    maxLength={40}
                    type="text"
                    value={user_.firstname}
                    onChange={handleFirstNameChange}
                    placeholder="Enter first name"
                  />
                  <FormErrorMessage>{firstNameError}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={lastNameError !== ""}>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    maxLength={40}
                    type="text"
                    value={user_.lastname}
                    onChange={handleLastNameChange}
                    placeholder="Enter last name"
                  />
                  <FormErrorMessage>{lastNameError}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={userNameError !== ""}>
                  <FormLabel>UserName</FormLabel>
                  <Input
                    maxLength={40}
                    type="text"
                    value={user_.username}
                    onChange={handleUserNameChange}
                    placeholder="Enter your username name"
                  />
                  <FormErrorMessage>{userNameError}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={emailError !== ""}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    maxLength={40}
                    type="email"
                    value={user_.email}
                    onChange={handleEmailChange}
                    placeholder="Enter email example@something.com"
                  />
                  <FormErrorMessage>{emailError}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={passwordError !== ""}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    maxLength={40}
                    type="password"
                    value={user_.password}
                    onChange={handlePasswordChange}
                    placeholder="Enter password"
                  />
                  <FormHelperText>
                    minimum 6 characters and contains at least one uppercase,
                    lowercase, number, and symbol
                  </FormHelperText>
                  <FormErrorMessage>{passwordError}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={matchPasswordError !== ""}>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    maxLength={40}
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Enter password"
                  />
                  <FormErrorMessage>{matchPasswordError}</FormErrorMessage>
                </FormControl>

                <HStack width="100%" spacing={4}>
                  <Button
                    type="submit"
                    bg="#6666FF"
                    color="white"
                    _hover={{ bg: "#3F4FE0" }}
                    width="100%"
                    isLoading={isSubmitting}
                  >
                    Sign Up
                  </Button>
                </HStack>
              </VStack>
            </form>
          </Box>
        </HStack>
      </Box>
    </>
  );
}
