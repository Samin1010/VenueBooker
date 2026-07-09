import NoVenuesFound from "@/component/NoVenuesFound";
import Venue from "@/component/Venue";
import {
  useVenueOperationContext,
} from "@/context/VenueOperationContext";
import {
  Container,
  SimpleGrid
} from "@chakra-ui/react";

// Shows the admin dashboard for viewing and managing venues.
export default function Dashboard() {
  const { venues } = useVenueOperationContext();

  return (
    <Container maxW="container.xl">
      <SimpleGrid
        justifyItems={{ base: "center", md: "stretch" }}
        alignItems={{ base: "stretch", md: "stretch" }}
        columns={{ base: 1, sm: 1, md: 2, lg: 3 }}
        spacing={4}
      >
        {/**Show all the venues which are available */}
        {venues.map((elem) => (
          <Venue
            userId={elem.userId}
            key={elem.id}
            id={elem.id}
            name={elem.name}
            location={elem.location}
            capacity={elem.capacity}
            price={elem.price}
            image={elem.image}
            description={elem.description}
            rating={elem.rating}
            suitabilities={elem.suitabilities}
            is_featured={elem.is_featured}
            discounted_percentage={elem.discounted_percentage}
            num_ratings={elem.num_ratings}
          />
        ))}
      </SimpleGrid>
      {venues.length === 0 && <NoVenuesFound message="No Venues found" />}
    </Container>
  );
}
