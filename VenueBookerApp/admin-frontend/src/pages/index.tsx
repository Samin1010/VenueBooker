import Link from "next/link";
import { Button } from "@chakra-ui/react";

export default function HomePage() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-center gap-6 bg-gradient-to-br from-[#1f35ff] via-[#5ba8ff] to-[#dfe7f2]">
      <span className="text-xs uppercase tracking-[0.3em] text-white/70 font-medium">
        Admin Portal
      </span>

      <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight drop-shadow">
        VenueBooker<br />
        <span className="text-white/80 font-normal text-4xl md:text-5xl">Admin Dashboard</span>
      </h1>

      <p className="text-white/75 text-lg max-w-md leading-relaxed">
        Manage venues, assign vendors, feature listings, and view platform reports.
      </p>

      <Link href="/auth/sign-in">
        <Button
          bg="white"
          color="#6666FF"
          _hover={{ bg: "gray.100", transform: "translateY(-2px)", shadow: "xl" }}
          size="lg"
          px={10}
          fontWeight="semibold"
          transition="all 0.2s"
        >
          Sign In
        </Button>
      </Link>
    </div>
  );
}