import { createContext, Dispatch, type ReactNode, SetStateAction, useContext, useState } from "react";

interface NookContextType {
    selectedNook: string | null;
    setSelectedNook: Dispatch<SetStateAction<string | null>>;
}

export const NookContext = createContext<NookContextType | undefined>(undefined);

export const NookProvider = ({ children }: { children?: ReactNode }) => {
    const [selectedNook, setSelectedNook] = useState<string | null>(null);

    return (
      <NookContext.Provider value={{ selectedNook, setSelectedNook }}>
        {children}
      </NookContext.Provider>
    );
};

export const useNookContext = () => {
    const context = useContext(NookContext);
    if (!context) {
      throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};