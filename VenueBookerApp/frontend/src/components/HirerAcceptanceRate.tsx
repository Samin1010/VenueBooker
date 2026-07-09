import React from "react";
import { Box, CircularProgress, CircularProgressLabel } from "@chakra-ui/react";

type AcceptanceRateProps = {
  userId?: number;
  percentage : number;
};

const getAcceptanceColor = (value: number) => {
  if (value < 25) return "red.400";
  if (value < 50) return "orange.400";
  if (value < 75) return "yellow.400";
  return "green.400";
};

export default function AcceptanceRate({ percentage }: AcceptanceRateProps) {
  const percentage_ = Number(Math.round(percentage * 100).toFixed(2));
  return (
    <Box>
        <CircularProgress value={percentage_} thickness="10px" color={getAcceptanceColor(percentage_)} trackColor="gray.200" capIsRound>
        <CircularProgressLabel>{percentage_}%</CircularProgressLabel>
        </CircularProgress>
    </Box>
  );
}
