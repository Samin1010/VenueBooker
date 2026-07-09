import { HirerHistoryType } from '@/types/HirerHistoryType'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import React from 'react'

export default function HirerHistoryComponent({
  dateOfHire,
  eventName,
  hirerId,
  id,
  location,
  rating,
  venueName,
  status
}: HirerHistoryType) {
  return (
    <HStack
      w="100%"
      px={4}
      py={3}
      borderBottom={{ base: "none", md: "1px solid" }}
      borderColor="gray.200"
      _hover={{ bg: { md: "gray.50" } }}
      align="start"
      spacing={4}
      flexDir={{ base: "column", md: "row" }}
      bg="white"
      borderRadius={{ base: "lg", md: "none" }}
      boxShadow={{ base: "sm", md: "none" }}   
    >
      <VStack
        display={{ base: "flex", md: "none" }}
        align="start"
        spacing={2}
        w="100%"
      >
        <Text fontWeight="bold">{eventName}</Text>

        <Text fontSize="sm" color="gray.500">
          {new Date(dateOfHire).toDateString()}
        </Text>

        <Text>
          <strong>Venue:</strong> {venueName}
        </Text>

        <Text>
          <strong>Location:</strong> {location}
        </Text>

        {rating ?
          <Text color="yellow.500" fontWeight="medium">
            {"⭐".repeat(rating)} ({rating}/5)
          </Text> : (
            <HStack>
              <Text fontWeight={"semibold"}>Status: </Text>
              <Text>{status}</Text>
            </HStack>
            )
        }
      </VStack>

      {/* DESKTOP ROW LAYOUT */}
      <>
        {/* Date */}
        <Text
          display={{ base: "none", md: "block" }}
          w="20%"
          fontSize="sm"
          color="gray.600"
        >
          {new Date(dateOfHire).toDateString()}
        </Text>

        {/* Event */}
        <Text
          display={{ base: "none", md: "block" }}
          w="20%"
          fontWeight="medium"
        >
          {eventName}
        </Text>

        {/* Venue */}
        <Text display={{ base: "none", md: "block" }} w="20%">
          {venueName}
        </Text>

        {/* Location */}
        <Text
          display={{ base: "none", md: "block" }}
          w="20%"
          color="gray.600"
        >
          {location}
        </Text>

        {/* Rating */}
        {rating ?
          <Text
            display={{ base: "none", md: "block" }}
            w="20%"
            color="yellow.500"
            fontWeight="medium"
          >
            {"⭐".repeat(rating)} ({rating})
          </Text> : (
            <HStack>
              <Text fontWeight={"semibold"}>Status: </Text>
              <Text>{status}</Text>
            </HStack>
          )
        }
      </>
    </HStack>
  );
}