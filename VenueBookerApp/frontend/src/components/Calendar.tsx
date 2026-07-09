import {
  Box,
  Button,
  GridItem,
  HStack,
  VStack,
  Text,
  Grid,
} from "@chakra-ui/react";
import React, { useState } from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export default function CalendarComponent({
  currentDate,
  setCurrentDate,
}: {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // first day
  const firstDay = new Date(year, month, 1).getDay(); // gets the first date of the months
  // and what day that date is called like the number used to leave how many slot on that
  // month
  // if it 0 in the next month then go one day back from the start of the next month
  // which is the end of the current
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderDays = () => {
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<GridItem key={`empty-${i}`} />);
    }

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const currentCellDate = new Date(year, month, day);
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      const isPast: boolean = currentCellDate < today;
      const isSelected =
        currentCellDate.getFullYear() === currentDate.getFullYear() &&
        currentCellDate.getMonth() === currentDate.getMonth() &&
        currentCellDate.getDate() === currentDate.getDate();
      days.push(
        <GridItem key={day}>
          <Box
            p={3}
            textAlign={"center"}
            borderRadius={"md"}
            cursor={"pointer"}
            bg={
              isToday && isSelected
                ? "blue.500"
                : isSelected
                  ? "blue.500"
                  : "gray.100"
            }
            color={"black"}
            _hover={{ bg: "blue.200" }}
            pointerEvents={isPast ? "none" : "auto"}
            onClick={() => {
              if (!isPast) {
                setCurrentDate(currentCellDate);
              }
            }}
          >
            {day}
          </Box>
        </GridItem>,
      );
    }

    return days;
  };
  return (
    <VStack
      bgColor={"white"}
      spacing={4}
      p={4}
      borderWidth={"1px"}
      borderRadius={"lg"}
    >
      <HStack justify={"space-between"} w="100%">
        <Button size="sm" onClick={prevMonth}>
          ←
        </Button>
        <Text fontWeight="bold">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </Text>
        <Button size="sm" onClick={nextMonth}>
          →
        </Button>
      </HStack>

      <Grid templateColumns={"repeat(7,1fr)"} w="100%" textAlign={"center"}>
        {daysOfWeek.map((day) => (
          <GridItem key={day}>
            <Text fontWeight="bold">{day}</Text>
          </GridItem>
        ))}
      </Grid>
      <Grid templateColumns={"repeat(7,1fr)"} gap={2} w="100%">
        {renderDays()}
      </Grid>
    </VStack>
  );
}
