import AuthNavbar from "@/component/AuthNavbar";
import Navbar from "@/component/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useEffect } from "react";
import { VenueOperationContextProvider } from "@/context/VenueOperationContext";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPublicRoute = router.pathname.startsWith("/auth/");
  useEffect(() => {
    localStorage.setItem("chakra-ui-color-mode", "light");
  }, []);

  const muiTheme = createTheme({
    palette: {
      mode: "light",
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <ChakraProvider>
        <AuthProvider>
          <VenueOperationContextProvider>
            {router.pathname !== "/" &&
              (isPublicRoute ? <AuthNavbar /> : <Navbar />)}
            <Component {...pageProps} />
          </VenueOperationContextProvider>
        </AuthProvider>
      </ChakraProvider>
    </ThemeProvider>
  );
}
