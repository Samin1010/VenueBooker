import {Text} from "@chakra-ui/react";

export default function NoVenuesFound({
    message
} : {
    message : string
})
{
    return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 max-w-md mx-auto text-center">
        <Text
            fontSize={"30"}
            fontWeight={"bold"}
            bgGradient={"linear(to-r,cyan.400,blue.500)"}
            bgClip={"text"}
            textAlign={"center"}
        >
            {message}
        </Text>
    </div>
    )
}