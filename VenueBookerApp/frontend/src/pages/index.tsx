import Link from "next/link";
import { Button } from "@chakra-ui/react";

export default function HomePage() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-center gap-6 bg-gradient-to-br from-[#1f35ff] via-[#5ba8ff] to-[#dfe7f2]">
      <span className="text-xs uppercase tracking-[0.3em] text-white/70 font-medium">
        Venue Management System
      </span>

      <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight drop-shadow">
        Find the Perfect Venue<br />
        <span className="text-white/80 font-normal text-4xl md:text-5xl">For Your Next Event</span>
      </h1>

      <p className="text-white/75 text-lg max-w-md leading-relaxed">
        Discover and book exceptional venues tailored to every occasion.
      </p>

      <Link href="/venues/venue-listing">
        <Button bg="white" color="#6666FF" _hover={{ bg: "gray.100", transform: "translateY(-2px)", shadow: "xl" }} size="lg" px={10} fontWeight="semibold" transition="all 0.2s">
          Browse Venues
        </Button>
      </Link>
    </div>
  );
}
