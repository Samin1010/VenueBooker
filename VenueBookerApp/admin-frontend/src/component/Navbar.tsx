import {
  Heading,
  Avatar,
  Box,
  Button,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="px-4 bg-gray-200 pb-1 border-b-2 border-blue-500">
      <div className="flex flex-col items-stretch gap-2">
        <div className="w-full items-center justify-between flex flex-col sm:flex-row">
          <div className="flex flex-row">
            <div className="p-2">
              <Image
                src={`/siteLogo.jpg`}
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
                  <Link href="/">VenueBooker</Link>
                </Heading>
              </Box>
            </Box>
          </div>
          <HStack spacing={6}>
            <Box
              borderBottom="2px solid"
              borderColor={router.pathname === "/user/admin/dashboard" ? "#6666FF" : "transparent"}
              pb="2px"
              _hover={{ borderColor: "#6666FF" }}
              transition="border-color 0.2s ease"
              fontWeight={router.pathname === "/user/admin/dashboard" ? "semibold" : "normal"}
            >
              <Link href="/user/admin/dashboard">Dashboard</Link>
            </Box>
            <Box
              borderBottom="2px solid"
              borderColor={router.pathname === "/venues/addVenue" ? "#6666FF" : "transparent"}
              pb="2px"
              _hover={{ borderColor: "#6666FF" }}
              transition="border-color 0.2s ease"
              fontWeight={router.pathname === "/venues/addVenue" ? "semibold" : "normal"}
            >
              <Link href="/venues/addVenue">Add Venue</Link>
            </Box>
            <Box
              borderBottom="2px solid"
              borderColor={router.pathname === "/user/admin/report" ? "#6666FF" : "transparent"}
              pb="2px"
              _hover={{ borderColor: "#6666FF" }}
              transition="border-color 0.2s ease"
              fontWeight={router.pathname === "/user/admin/report" ? "semibold" : "normal"}
            >
              <Link href="/user/admin/report">Report</Link>
            </Box>
            <Popover placement="bottom" trigger="hover">
              <PopoverTrigger>
                <Box as="button">
                  <Avatar bg="#6666FF" size="sm" cursor="pointer" />
                </Box>
              </PopoverTrigger>
              <PopoverContent bg="#6666FF" color="white">
                <PopoverHeader bg="white" textColor="black" fontWeight="semibold">
                  {user.username}
                </PopoverHeader>
                <PopoverArrow bg="#6666FF" />
                <PopoverBody display="flex" flexDir="column">
                  <Button
                    bg="white"
                    textColor="black"
                    borderRadius="6px"
                    _hover={{ bgColor: "gray.200" }}
                    fontWeight="normal"
                    onClick={logout}
                  >
                    Sign out
                  </Button>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </HStack>
        </div>
      </div>
    </div>
  );
}
