import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserDocument } from "@/types/UserDocument";
import { UserFetcherService } from "@/services/users.api";
import { Center, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";

type DocumentsContextType = {
  currentIdentityFile: UserDocument | null;
  currentInsuranceFile: UserDocument | null;
  currentRiskFile: UserDocument | null;
  currentAlcoholFile: UserDocument | null;
  credibility: number;
  setCurrentIdentityFile: React.Dispatch<React.SetStateAction<UserDocument | null>>;
  setCurrentInsuranceFile: React.Dispatch<React.SetStateAction<UserDocument | null>>;
  setCurrentRiskFile: React.Dispatch<React.SetStateAction<UserDocument | null>>;
  setCurrentAlcoholFile: React.Dispatch<React.SetStateAction<UserDocument | null>>;
};

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  const [currentIdentityFile, setCurrentIdentityFile] = useState<UserDocument | null>(null);
  const [currentInsuranceFile, setCurrentInsuranceFile] = useState<UserDocument | null>(null);
  const [currentRiskFile, setCurrentRiskFile] = useState<UserDocument | null>(null);
  const [currentAlcoholFile, setCurrentAlcoholFile] = useState<UserDocument | null>(null);
  const [credibility, setCredibility] = useState(0);
  const [isLoading,setIsLoading]= useState<boolean>(true);
  const userFetcherService = useMemo(() => new UserFetcherService(), []);

  useEffect(() => {
    if (!user) {
      setCurrentIdentityFile(null);
      setCurrentInsuranceFile(null);
      setCurrentRiskFile(null);
      setCurrentAlcoholFile(null);
      setCredibility(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const loadDocuments = async () => {
      try {
        setCurrentIdentityFile(null);
        setCurrentInsuranceFile(null);
        setCurrentRiskFile(null);
        setCurrentAlcoholFile(null);
        const userDocuments : UserDocument[] = await userFetcherService.getUserDocuments(user.id);
        
        for(let i = 0;i < userDocuments.length ; i++)
        {
          if(userDocuments[i].file_type === "identity")
          {
            setCurrentIdentityFile(userDocuments[i]);
          }
          else if(userDocuments[i].file_type === "insurance")
          {
            setCurrentInsuranceFile(userDocuments[i]);
          }
          else if(userDocuments[i].file_type === "risk")
          {
            setCurrentRiskFile(userDocuments[i]);
          }
          else if(userDocuments[i].file_type === "alcohol")
          {
            setCurrentAlcoholFile(userDocuments[i]);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadDocuments();
  }, [user, userFetcherService]);

  useEffect(() => {
    const score =
      [currentIdentityFile, currentInsuranceFile, currentRiskFile, currentAlcoholFile]
        .filter(Boolean).length * 25;

    setCredibility(score);
  }, [
    currentIdentityFile,
    currentInsuranceFile,
    currentRiskFile,
    currentAlcoholFile,
  ]);

  return (
    <DocumentsContext.Provider
      value={{
        currentIdentityFile,
        currentInsuranceFile,
        currentRiskFile,
        currentAlcoholFile,
        credibility,
        setCurrentIdentityFile,
        setCurrentInsuranceFile,
        setCurrentRiskFile,
        setCurrentAlcoholFile,
      }}
    >
      {children}
      {(isLoading || !router.isReady) && (
        <Center
          position="fixed"
          inset={0}
          bg="whiteAlpha.800"
          zIndex="overlay"
          pointerEvents="none"
        >
          <Spinner color="blue.500" thickness="4px" />
        </Center>
      )}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error("useDocuments must be used within DocumentsProvider");
  }
  return context;
}
