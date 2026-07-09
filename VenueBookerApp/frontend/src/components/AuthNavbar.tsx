import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Input,
  Text,
} from "@chakra-ui/react";
import { MoonIcon, Search2Icon, SunIcon, Heading } from "@chakra-ui/icons";
import Image from "next/image";

import Link from "next/link";

export default function AuthNavbar() {
  // const {colorMode,toggleColorMode} = useColorMode();
  return (
    <div className="px-4 bg-gray-200 pb-1">
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
                  <Link href="/">VenueBooker</Link>
                </Heading>
              </Box>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}
