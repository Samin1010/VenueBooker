import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import { Notification } from "@/types/NotificationType";
import { CheckCircle, XCircle, Bell, Check } from "lucide-react";

export default function NotificationComponent({
  applicationId,
  createdAt,
  id,
  message,
  read,
  type,
  userId,
  venueName,
  eventName,
  onClick,
}: Notification & {
  eventName: string;
  venueName: string;
  onClick: () => void;
}) {
  const isApproved = type === "APPLICATION_APPROVED";
  const isRejected = type === "APPLICATION_REJECTED";

  const icon = isApproved
    ? CheckCircle
    : isRejected
    ? XCircle
    : Bell;

  const iconColor = isApproved
    ? "green.400"
    : isRejected
    ? "red.400"
    : "blue.400";

  return (
    <Box
      w="100%"
      p={4}
      borderWidth="1px"
      borderRadius="2xl"
      bg={read ? "gray.50" : "white"}
      borderColor={read ? "gray.200" : "blue.400"}
      _hover={{ shadow: "md" }}
      cursor="pointer"
      transition="all 0.2s"
    >
      <HStack align="start" spacing={3}>
        {/* Icon */}
        <Icon as={icon} boxSize={5} color={iconColor} mt={1} />

        {/* Content */}
        <VStack align="start" spacing={1} w="100%">
          {/* Header */}
          <HStack justify="space-between" w="100%">
            <Text fontWeight="semibold" fontSize="sm">
              {eventName} @ {venueName}
            </Text>

            <HStack>
              {!read && (
                <Badge colorScheme="blue" fontSize="0.6rem">
                  New
                </Badge>
              )}

              {/* ✅ Mark as Read Button */}
              {!read && (
                <IconButton
                  aria-label="Mark as read"
                  icon={<Check size={14} />}
                  size="xs"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    onClick();
                  }}
                />
              )}
            </HStack>
          </HStack>

          {/* Message */}
          <Text fontSize="sm" color="gray.600">
            {message}
          </Text>

          {/* Footer */}
          <HStack justify="space-between" w="100%" pt={1}>
            <Text fontSize="xs" color="gray.400">
              {createdAt}
            </Text>

            <Text
              fontSize="xs"
              fontWeight="medium"
              color={
                isApproved
                  ? "green.500"
                  : isRejected
                  ? "red.500"
                  : "blue.500"
              }
            >
              {type.replaceAll("_", " ")}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
}