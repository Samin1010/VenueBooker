"use client"
import { AuthFetcherServices } from "@/services/api";
import type { UserDto } from "@admin-shared/types";
import { Center, Spinner, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
// import { DEFAULT_USERS } from "@/sample_data/sample_users";
import React, { createContext, useContext, useEffect, useState } from "react"
// import { DEFAULT_HISTORY } from "@/sample_data/sample_history";
// import { AuthFetcherController } from "@/api/auth";

interface AuthContextType {
    user : UserDto | null,
    login : (username : string,password : string) => Promise<boolean>,
    logout : () => void,
    setUser : React.Dispatch<React.SetStateAction<UserDto | null>>,
}


export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children} : {children : React.ReactNode}){
    const [user,setUser] = useState<UserDto | null>(null);
    const toast = useToast();
    const router = useRouter();
    const [isAuthLoading,setIsAuthLoading] = useState<boolean>(true);

    // const authFetcherController = new AuthFetcherController();

    const STORAGE_KEY = "admin-user";

    useEffect(() => {
        const savedUser = localStorage.getItem(STORAGE_KEY);

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        setIsAuthLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        const user = await AuthFetcherServices.login(username, password);

        if (user) {
            setUser(user);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        toast({
            title: "Logged out",
            description: "You have been signed out successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top"
        });
    }

    if(isAuthLoading || !router.isReady)
    {
        return <Center><Spinner /></Center>
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
            {children}
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
