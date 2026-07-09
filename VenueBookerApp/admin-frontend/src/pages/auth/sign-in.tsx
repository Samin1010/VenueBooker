import { useAuth } from "@/context/AuthContext";
import { Box, Button, FormControl, FormLabel, HStack, Input, useToast, VStack, Heading, Center, Spinner } from "@chakra-ui/react"
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react"

type AuthUser = {
  username: string,
  password : string
};

const LOGIN_ERROR_MESSAGES = [
  "Invalid Username Or password",
  "Only admins allowed",
];

const getLoginErrorMessage = (error: unknown) => {
  if (
    error instanceof Error &&
    LOGIN_ERROR_MESSAGES.includes(error.message)
  ) {
    return error.message;
  }

  return "Unable to log in. Please try again.";
};

export default function SignIn() {
  const {user,login} = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [user_,setUser] = useState<AuthUser>({
    username : "",
    password : ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserNameChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user_,
      username : e.target.value
    });
  }
  useEffect(() => {
    if(user){
      router.push("/user/admin/dashboard");
    }
  },[router, user]);

  const handlePasswordChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user_,
      password : e.target.value
    });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const success = await login(user_.username, user_.password);
      if (!success) {
        toast({
          title: "Failed",
          description: "Invalid credentials.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      toast({
          title: "Successfully Logged in",
          description: "Welcome Admin",
          status: "success",
          duration: 3000,
          isClosable: true,
          position : "top"
        });
    } catch (error: unknown) {
      toast({
        title: "Access Denied",
        description: getLoginErrorMessage(error),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if(isSubmitting || !router.isReady)
  {
    return <Center><Spinner /></Center>;
  }


  return (
    <>
      <Box display="flex" justifyContent="center" mt="0" paddingTop="50px" height="100vh" width="100vw">
      <HStack spacing={0} align="stretch">
          <Box display={{ base: "none", md: "block" }} bgImage="/whiteBlueGradient.jpg" width="40vw" height="60vh" backgroundSize="cover" p= "6" color="black" backgroundRepeat="no-repeat" borderRadius="14px" border="1px solid rgba(255,255,255,0.25)"boxShadow="lg"><Heading bgGradient="linear(to-r, blue.500, white, blue.500)"
          bgClip="text" fontSize="5xl">Log In with admin account</Heading></Box>
          <Box width="350px" paddingLeft="20px" >
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input type="text" value={user_.username} onChange={handleUserNameChange} placeholder="Enter username" />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input type="password" value={user_.password} onChange={handlePasswordChange} placeholder="Enter password" />
              </FormControl>
              <HStack width="100%" spacing={4}>
                <Button type="submit" bg="#6666FF" color="white" _hover={{ bg: "#3F4FE0" }} width="100%" isLoading={isSubmitting}>Login</Button>
              </HStack>
            </VStack>
          </form>
          </Box>
      </HStack>
      </Box> 
    </>
  )
}
