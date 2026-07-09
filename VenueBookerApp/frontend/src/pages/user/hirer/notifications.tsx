import { useAuth } from "@/context/AuthContext";
import { NotificationFetcherService } from "@/services/notification.api";
import { Notification } from "@/types/NotificationType";
import {
  Badge,
  Box,
  Button,
  Center,
  Circle,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Bell,
  BellRing,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Inbox,
  MapPin,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type CustomNotification = Notification & {
  venueName: string;
  eventName: string;
};

const notificationStyles = {
  APPLICATION_APPROVED: {
    accent: "green.500",
    background: "green.50",
    border: "green.100",
    icon: CheckCircle2,
    label: "Approved",
  },
  APPLICATION_REJECTED: {
    accent: "red.500",
    background: "red.50",
    border: "red.100",
    icon: XCircle,
    label: "Not approved",
  },
};

function formatCreatedAt(createdAt?: string) {
  if (!createdAt) return "Recently";

  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) return createdAt;

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function NotificationCard({
  notification,
  onRead,
}: {
  notification: CustomNotification;
  onRead: (id: number, read: boolean) => void;
}) {
  const style = notificationStyles[notification.type];

  return (
    <Box
      as="article"
      position="relative"
      w="full"
      overflow="hidden"
      borderWidth="1px"
      borderColor={notification.read ? "gray.200" : style.border}
      borderRadius="2xl"
      bg="white"
      boxShadow={notification.read ? "sm" : "0 12px 32px rgba(15, 23, 42, 0.08)"}
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
    >
      {!notification.read && (
        <Box position="absolute" top={0} bottom={0} left={0} w="4px" bg={style.accent} />
      )}

      <Flex gap={{ base: 3, md: 4 }} p={{ base: 4, md: 5 }} align="flex-start">
        <Circle
          flexShrink={0}
          size={{ base: "42px", md: "48px" }}
          bg={style.background}
          color={style.accent}
        >
          <Icon as={style.icon} boxSize={{ base: 5, md: 6 }} />
        </Circle>

        <VStack align="stretch" spacing={3} flex={1} minW={0}>
          <Flex gap={3} justify="space-between" align="flex-start">
            <Box minW={0}>
              <HStack mb={1} spacing={2} flexWrap="wrap">
                <Heading as="h2" size="sm" color="gray.800">
                  {notification.eventName}
                </Heading>
                {!notification.read && (
                  <Badge px={2} borderRadius="full" colorScheme="blue" textTransform="none">
                    New
                  </Badge>
                )}
              </HStack>
              <HStack spacing={1.5} color="gray.500">
                <MapPin size={14} />
                <Text fontSize="sm" noOfLines={1}>
                  {notification.venueName}
                </Text>
              </HStack>
            </Box>

            <Badge
              flexShrink={0}
              px={2.5}
              py={1}
              borderRadius="full"
              bg={style.background}
              color={style.accent}
              textTransform="none"
              fontSize="xs"
            >
              {style.label}
            </Badge>
          </Flex>

          <Text color="gray.600" fontSize="sm" lineHeight="tall">
            {notification.message}
          </Text>

          <Flex
            gap={3}
            pt={3}
            borderTopWidth="1px"
            borderColor="gray.100"
            align={{ base: "flex-start", sm: "center" }}
            justify="space-between"
            direction={{ base: "column", sm: "row" }}
          >
            <HStack spacing={{ base: 3, md: 4 }} color="gray.500" flexWrap="wrap">
              <HStack spacing={1.5}>
                <CalendarDays size={14} />
                <Text fontSize="xs">{notification.date || formatCreatedAt(notification.createdAt)}</Text>
              </HStack>
              {notification.time && (
                <HStack spacing={1.5}>
                  <Clock3 size={14} />
                  <Text fontSize="xs">{notification.time}</Text>
                </HStack>
              )}
            </HStack>

            {!notification.read && (
              <Button
                size="xs"
                variant="ghost"
                colorScheme="blue"
                leftIcon={<Check size={14} />}
                onClick={() => onRead(notification.id, notification.read)}
              >
                Mark as read
              </Button>
            )}
          </Flex>
        </VStack>
      </Flex>
    </Box>
  );
}

function NoNotificationsFound() {
  return (
    <Center
      minH="360px"
      px={6}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="3xl"
      bg="white"
      boxShadow="sm"
      textAlign="center"
    >
      <VStack spacing={4} maxW="420px">
        <Circle size="88px" bg="blue.50" color="blue.500">
          <Inbox size={40} strokeWidth={1.7} />
        </Circle>
        <Box>
          <Heading as="h2" size="md" color="gray.800" mb={2}>
            You&apos;re all caught up
          </Heading>
          <Text color="gray.500" lineHeight="tall">
            No notifications found. Updates about your venue applications will appear here.
          </Text>
        </Box>
      </VStack>
    </Center>
  );
}

export default function Notifications() {
  const { user } = useAuth();
  const router = useRouter();
  const notificationFetcherService = useMemo(() => new NotificationFetcherService(), []);
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }

    if (user.role !== "hirer") {
      router.replace("/404");
      return;
    }

    const loadNotifications = async () => {
      setIsLoading(true);
      const fetchedNotifications = await notificationFetcherService.getNotification(user.id);
      setNotifications(fetchedNotifications);
      setIsLoading(false);
    };

    loadNotifications();
  }, [notificationFetcherService, router, user]);

  const handleRead = async (id: number, read: boolean) => {
    if (!user || read) return;

    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );

    const success = await notificationFetcherService.updateReadStatus(user.id, id);
    if (!success) {
      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id ? { ...notification, read: false } : notification,
        ),
      );
    }
  };

  const unreadNotifications = notifications.filter((notification) => !notification.read);

  const handleMarkAllRead = async () => {
    if (!user || unreadNotifications.length === 0) return;

    const unreadIds = unreadNotifications.map((notification) => notification.id);
    setIsMarkingAllRead(true);
    setNotifications((previous) =>
      previous.map((notification) => ({ ...notification, read: true })),
    );

    const results = await Promise.all(
      unreadIds.map(async (id) => ({
        id,
        success: await notificationFetcherService.updateReadStatus(user.id, id),
      })),
    );
    const failedIds = new Set(results.filter((result) => !result.success).map((result) => result.id));

    if (failedIds.size > 0) {
      setNotifications((previous) =>
        previous.map((notification) =>
          failedIds.has(notification.id) ? { ...notification, read: false } : notification,
        ),
      );
    }
    setIsMarkingAllRead(false);
  };

  return (
    <Box minH="calc(100vh - 64px)" bg="gray.50" py={{ base: 5, md: 9 }}>
      <Container maxW="4xl" px={{ base: 4, md: 6 }}>
        <Button
          mb={5}
          size="sm"
          variant="ghost"
          color="gray.600"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => router.back()}
          _hover={{ bg: "white", color: "blue.600", boxShadow: "sm" }}
        >
          Back
        </Button>

        <Flex
          gap={5}
          mb={7}
          align={{ base: "flex-start", sm: "center" }}
          justify="space-between"
          direction={{ base: "column", sm: "row" }}
        >
          <HStack spacing={4}>
            <Circle size={{ base: "52px", md: "60px" }} bg="blue.500" color="white" boxShadow="lg">
              <BellRing size={27} />
            </Circle>
            <Box>
              <Heading as="h1" size={{ base: "lg", md: "xl" }} color="gray.800">
                Notifications
              </Heading>
              <Text mt={1} color="gray.500" fontSize="sm">
                {unreadNotifications.length === 0
                  ? "You have no unread notifications"
                  : `${unreadNotifications.length} unread notification${
                      unreadNotifications.length === 1 ? "" : "s"
                    }`}
              </Text>
            </Box>
          </HStack>

          {unreadNotifications.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              leftIcon={<Check size={16} />}
              isLoading={isMarkingAllRead}
              loadingText="Marking as read"
              onClick={handleMarkAllRead}
              bg="white"
            >
              Mark all as read
            </Button>
          )}
        </Flex>

        {isLoading || !router.isReady ? (
          <Center minH="360px">
            <VStack spacing={3}>
              <Spinner thickness="3px" speed="0.7s" color="blue.500" size="lg" />
              <Text color="gray.500" fontSize="sm">
                Loading notifications...
              </Text>
            </VStack>
          </Center>
        ) : notifications.length === 0 ? (
          <NoNotificationsFound />
        ) : (
          <VStack spacing={4} align="stretch">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={handleRead}
              />
            ))}
          </VStack>
        )}

        {!isLoading && notifications.length > 0 && (
          <HStack justify="center" mt={7} color="gray.400">
            <Bell size={14} />
            <Text fontSize="xs">That&apos;s everything for now</Text>
          </HStack>
        )}
      </Container>
    </Box>
  );
}
