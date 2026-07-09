import { useAuth } from "@/context/AuthContext";
import { Button } from "@chakra-ui/react";
import Link from "next/link";

export default function Custom404() {
    const {user} = useAuth();
  return (
    <div className="text-center mt-12.5">
      <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
      <p className="font-bold pb-20">The page you are looking for does not exist.</p>
        {user ? (
            <Button bg={"blue.500"}>
                <Link href="/">Home Page</Link>
            </Button>
        ) : (
        <></>
        )}
    </div>
  );
}