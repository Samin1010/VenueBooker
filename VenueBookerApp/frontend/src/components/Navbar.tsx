import {
  Heading,
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import { MoonIcon, Search2Icon, SunIcon } from "@chakra-ui/icons";
import Image from "next/image";
import { useRouter } from "next/router";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function Navbar() {
  // const {colorMode,toggleColorMode} = useColorMode();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="px-4 bg-gray-200 pb-1 border-b-2 border-blue-500">
      <div className="flex flex-col items-stretch gap-2">
        {/** Fix height might cause overllaping of containers */}
        <div className="w-full items-center justify-between flex flex-col sm:flex-row">
          <div className="flex flex-row">
            <div className="p-2">
              {/**https://www.vondy.com/venue-logo-ideas--FHOOuguX*/}
              <Image
                src={`/siteLogo.jpg`} //https://www.vectorstock.com/royalty-free-vector/minimalist-house-modern-icon-logo-design-vector-49820438
                alt="Venue Logo"
                width={40}
                height={60}
                className="rounded-full"
              />
            </div>
            <Box
              p="2px"
              borderRadius="12px"
              bg={`
                            radial-gradient(circle at 20% 85%, rgba(210,245,245,0.9), transparent 35%),
                            radial-gradient(circle at 75% 70%, rgba(245,215,245,0.65), transparent 30%),
                            linear-gradient(180deg, #1f35ff 0%, #5ba8ff 45%, #dfe7f2 100%)
                        `}
            >
              <Box bg="white" borderRadius="10px" px={3} py={1}>
                <Heading
                  fontSize={{ base: "22", sm: "30" }}
                  fontWeight="bold"
                  textAlign="center"
                  bg={`
                                    radial-gradient(circle at 20% 85%, rgba(210,245,245,0.9), transparent 35%),
                                    radial-gradient(circle at 75% 70%, rgba(245,215,245,0.65), transparent 30%),
                                    linear-gradient(180deg, #1f35ff 0%, #5ba8ff 45%, #dfe7f2 100%)
                                `}
                  bgClip="text"
                >
                  {user?.role === "hirer" ? <Link href="/">VenueBooker</Link> : <Text>VenueBooker</Text>}
                </Heading>
              </Box>
            </Box>
          </div>
          <HStack spacing={6}>
            {user?.role === "hirer" ? (
              <>
                <Box
                  borderBottom="2px solid"
                  borderColor={
                    router.pathname === "/user/hirer/profile-dashboard"
                      ? "#6666FF"
                      : "transparent"
                  }
                  pb="2px"
                  _hover={{ borderColor: "#6666FF" }}
                  transition="border-color 0.2s ease"
                  fontWeight={
                    router.pathname === "/user/hirer/profile-dashboard"
                      ? "semibold"
                      : "normal"
                  }
                >
                  <Link href="/user/hirer/profile-dashboard">Dashboard</Link>
                </Box>
                <Box
                  borderBottom={"2px solid"}
                  borderColor={
                    router.pathname === "/venues/venue-listing"
                      ? "#6666FF"
                      : "transparent"
                  }
                  pb="2px"
                  _hover={{ borderColor: "#6666FF" }}
                  transition="border-color 0.2s ease"
                  fontWeight={
                    router.pathname === "/venues/venue-listing"
                      ? "semibold"
                      : "normal"
                  }
                >
                  <Link href="/venues/venue-listing">Venue Listing</Link>
                </Box>
                <Box
                  borderBottom={"2px solid"}
                  borderColor={
                    router.pathname === "/user/hirer/notifications"
                      ? "#6666FF"
                      : "transparent"
                  }
                  pb="2px"
                  _hover={{ borderColor: "#6666FF" }}
                  transition="border-color 0.2s ease"
                  fontWeight={
                    router.pathname === "/user/hirer/notifications"
                      ? "semibold"
                      : "normal"
                  }
                >
                  <Link href="/user/hirer/notifications">Notifications</Link>
                </Box>
              </>
            ) : user ? (
              <>
                <Box
                  borderBottom="2px solid"
                  borderColor={
                    router.pathname === "/user/vendor/dashboard"
                      ? "#6666FF"
                      : "transparent"
                  }
                  pb="2px"
                  _hover={{ borderColor: "#6666FF" }}
                  transition="border-color 0.2s ease"
                  fontWeight={
                    router.pathname === "/user/vendor/dashboard"
                      ? "semibold"
                      : "normal"
                  }
                >
                  <Link href="/user/vendor/dashboard">Dashboard</Link>
                </Box>

                <Box
                  borderBottom="2px solid"
                  borderColor={
                    router.pathname === "/user/vendor/venues"
                      ? "#6666FF"
                      : "transparent"
                  }
                  pb="2px"
                  _hover={{ borderColor: "#6666FF" }}
                  transition="border-color 0.2s ease"
                  fontWeight={
                    router.pathname === "/user/vendor/venues"
                      ? "semibold"
                      : "normal"
                  }
                >
                  <Link href="/user/vendor/venues">Venues</Link>
                </Box>

                <Box
                  borderBottom="2px solid"
                  borderColor={
                    router.pathname.startsWith("/booking/applications")
                      ? "#6666FF"
                      : "transparent"
                  }
                  pb="2px"
                  _hover={{ borderColor: "#6666FF" }}
                  transition="border-color 0.2s ease"
                  fontWeight={
                    router.pathname.startsWith("/booking/applications")
                      ? "semibold"
                      : "normal"
                  }
                >
                  <Link href="/booking/applications">
                    Applications Received
                  </Link>
                </Box>
              </>
            ) : null}

            {/** There is going to be a profile icon */}
            {user ? (
              <Popover placement="bottom" trigger="hover">
                <PopoverTrigger>
                  <Box as="button">
                    <Avatar bg="#6666FF" size="sm" cursor="pointer" />
                  </Box>
                </PopoverTrigger>
                <PopoverContent bg="#6666FF" color="white">
                  <PopoverHeader
                    bg="white"
                    textColor="black"
                    fontWeight="semibold"
                  >
                    {user.username}
                  </PopoverHeader>
                  <PopoverArrow bg="#6666FF" />
                  <PopoverBody display="flex" flexDir={"column"}>
                    {user.role === "hirer" ? (
                      <Button
                        roundedTop={"6px"}
                        roundedBottom={"none"}
                        bg={"white"}
                        textColor={"black"}
                        _hover={{ bgColor: "gray.200" }}
                        fontWeight="normal"
                      >
                        <Link href="/user/hirer/preference-list">
                          Preference List
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        roundedTop={"6px"}
                        roundedBottom={"none"}
                        bg={"white"}
                        textColor={"black"}
                        _hover={{ bgColor: "gray.200" }}
                        fontWeight="normal"
                      >
                        <Link href="/booking/applications">
                          Applications Received
                        </Link>
                      </Button>
                    )}
                    {/* <Button
                      rounded="none"
                      bg={"white"}
                      textColor={"black"}
                      _hover={{ bgColor: "gray.200" }}
                      fontWeight="normal"
                    >
                      <Link href={"/user/edit-profile"}>View Profile</Link>
                    </Button> */}

                    <Button
                      bg="white"
                      textColor={"black"}
                      roundedTop="none"
                      roundedBottom={"6px"}
                      _hover={{ bgColor: "gray.200" }}
                      onClick={logout}
                      fontWeight="normal"
                    >
                      Sign out
                    </Button>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                bgColor={"#6666FF"}
                _hover={{ bgColor: "#3F4FE0" }}
                textColor={"white"}
              >
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
            )}
          </HStack>
        </div>
      </div>
    </div>
  );
}
