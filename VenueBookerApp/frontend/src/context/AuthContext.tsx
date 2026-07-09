
import { Center, Spinner, useToast } from "@chakra-ui/react";
// import { DEFAULT_USERS } from "@/sample_data/sample_users";
import React, { createContext, useContext, useEffect, useState } from "react"
// import { DEFAULT_HISTORY } from "@/sample_data/sample_history";
import { AuthFetcherService } from "@/services/auth.api";
import type { UserDto } from "@shared/types";
import { useRouter } from "next/router";

type SafeUser = Omit<UserDto, "password">;

interface AuthContextType {
    user : SafeUser | null,
    login : (username : string,password : string) => Promise<boolean>,
    logout : () => void,
    setUser : React.Dispatch<React.SetStateAction<SafeUser | null>>,
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const sanitizeUser = (user: SafeUser | UserDto): SafeUser => {
    const safeUser = { ...user } as Partial<UserDto>;
    delete safeUser.password;
    return safeUser as SafeUser;
};

export function AuthProvider({children} : {children : React.ReactNode}){
    const [user,setUser] = useState<SafeUser | null>(null);
    const toast = useToast();
    const router = useRouter();
    const [isAuthLoading,setIsAuthLoading] = useState<boolean>(true);

    const authFetcherService = new AuthFetcherService();

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        let restoredUser: SafeUser | null = null;

        if (savedUser) {
            try {
                const safeUser = sanitizeUser(JSON.parse(savedUser) as UserDto);
                restoredUser = safeUser;
                localStorage.setItem("user", JSON.stringify(safeUser));
            } catch {
                localStorage.removeItem("user");
            }
        }

        queueMicrotask(() => {
            setUser(restoredUser);
            setIsAuthLoading(false);
        });
    }, []);

    const login = async (username: string, password: string) => {
        const user = await authFetcherService.signIn(username, password);

        if (user) {
            const safeUser = sanitizeUser(user);
            setUser(safeUser);
            localStorage.setItem("user", JSON.stringify(safeUser));
            return true;
        }

        return false;
    };


    const logout = () => {
        setUser(null);
        toast({
            title: "Logged out",
            description: "You have been signed out successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top"
        });
        localStorage.removeItem("user");
    }

    return (
        <AuthContext.Provider value={
            {
                user,
                login,
                logout,
                setUser,
            }
        }>
            {isAuthLoading || !router.isReady ? (
                <Center minH="100vh" bg="gray.50">
                    <Spinner color="blue.500" thickness="4px" />
                </Center>
            ) : children}
        </AuthContext.Provider>
    )

}

export function useAuth(){
    const context = useContext(AuthContext);
    if(context === undefined)
    {
        throw new Error("userAuth mustbe provided inside the Auth Provider");
    }

    return context;
}
