
import AuthNavbar from "@/components/AuthNavbar";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { DocumentsProvider } from "@/context/DocumentContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthNavbar = router.pathname === "/auth/sign-in" || router.pathname === "/auth/sign-up";

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
          <DocumentsProvider>
            {isAuthNavbar ? <AuthNavbar/> :<Navbar/>}
            <Component {...pageProps} />
          </DocumentsProvider>
        </AuthProvider>
      </ChakraProvider>
  </ThemeProvider>
  );
}
