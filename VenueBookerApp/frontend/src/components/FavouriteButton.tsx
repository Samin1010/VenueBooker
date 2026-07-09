// import { useAuth } from "@/context/AuthContext";
// import { VenueType } from "@/types/VenueType";
// import { IconButton, useTab, useToast } from "@chakra-ui/react";
// import { Heart } from "lucide-react";
// import { useState } from "react";

// const FavoriteButton = ({venueId} : {venueId : string}) => {
//   const {user} = useAuth();
//   const toast = useToast();
//   let isFavourite_ : boolean | undefined = undefined;
//   if(user && user.role === "hirer")
//   {
//     isFavourite_ = user?.preferences.includes(venueId);
//   }
//   const [isFavorite, setIsFavorite] = useState<boolean | undefined>(isFavourite_ || false);
//   const {handleAddToPreferenceList,handleRemoveFromPreferenceList} = useAuth();

//   const handleOnClick = () => {
//     if(!user) {
//       toast({
//           title : "Failure",
//           description : "User Not Logged In",
//           status :"error",
//           duration : 5000,
//           isClosable : true
//       });
//       return;
//     }

//     if(user.role !== "hirer")
//     {
//       toast({
//         title : "Failure",
//         description : "Hirers can only give preference",
//         status : "error",
//         duration : 5000,
//         isClosable : true
//       })
//       return;
//     }
//     setIsFavorite(!isFavorite);
//     if(isFavorite)
//     {
//         handleAddToPreferenceList(venueId);
//     }
//     else
//     {
//         handleRemoveFromPreferenceList(venueId);
//     }
//   }

//   return (
//     <IconButton
//       aria-label="Add to favorites"
//       icon={
//         <Heart
//           fill={isFavorite ? "currentColor" : "none"}
//         />
//       }
//       onClick={handleOnClick}
//       color={isFavorite ? "red.500" : "gray.400"}
//       variant="ghost"
//     />
//   );
// };

// export default FavoriteButton;