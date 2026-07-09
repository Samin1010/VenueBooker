import { Box, CircularProgress, CircularProgressLabel, Text, VStack } from "@chakra-ui/react";

type Props = {
  value: number;
};

function getColor(value: number) {
  if (value < 30) return "red.400";
  if (value < 60) return "yellow.400";
  return "green.400";
}

export default function CredibilityMeter({ value }: Props) {
  return (
    <Box>
        <CircularProgress
          value={value}
          thickness="10px"
          color={getColor(value)}
          trackColor="gray.200"
          capIsRound
        >
          <CircularProgressLabel>{value<30 && "Low" || value<60 && "Poor" || "High"}</CircularProgressLabel>
        </CircularProgress>
    </Box>
  );
}