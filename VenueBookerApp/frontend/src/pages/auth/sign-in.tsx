import { useAuth } from "@/context/AuthContext";
import { trimString } from "@/utils/trim";
import { Box, Button, Divider, FormControl, FormLabel, HStack, Input, useToast, VStack, Heading, Center, Spinner } from "@chakra-ui/react"
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react"
import Link from "next/link";

type AuthUser = {
  username: string,
  password : string
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
      if(user.role === "hirer"){
        router.push("/user/hirer/profile-dashboard");
      }
      else{
        router.push("/user/vendor/dashboard");
      }
    }
  },[router, user]);

  const handlePasswordChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user_,
      password : e.target.value
    });
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await login(trimString(user_.username), user_.password);
      if(!success)
      {
        toast({
            title : "Failed",
            description : "Invalid Username or Password",
            status :"error",
            duration : 3000,
            isClosable : true
        });
        setIsSubmitting(false);
        return;
      }
      toast({
            title : "Welcome User",
            description : "Welcome User",
            status :"success",
            duration : 3000,
            isClosable : true
        });
    } 
    catch(error)
    {
       toast({
            title : "Failed",
            description : "Failed to login",
            status :"error",
            duration : 3000,
            isClosable : true,
            position : "top"
        });
    }
    finally {
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
          bgClip="text" fontSize="5xl">Log In or Sign Up for a new Account.</Heading></Box>
          <Box width="350px" paddingLeft="20px" >
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>UserName</FormLabel>
                <Input maxLength={40} type="text" value={user_.username} onChange={handleUserNameChange} placeholder="Enter username" />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input maxLength={40} type="password" value={user_.password} onChange={handlePasswordChange} placeholder="Enter password" />
              </FormControl>
              <HStack width="100%" spacing={4}>
                <Button type="submit" bg="#6666FF" color="white" _hover={{ bg: "#3F4FE0" }} width="100%" isLoading={isSubmitting}>Login</Button>
                <Divider orientation="vertical" height="40px" />
                <Button variant="outline" width="100%"><Link href="/auth/sign-up">Sign Up</Link></Button>
              </HStack>
            </VStack>
          </form>
          </Box>
      </HStack>
      </Box> 
    </>
  )
}
