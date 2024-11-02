import { createContext, Dispatch, type ReactNode, SetStateAction, useContext, useState } from "react";

interface LoggedInContextType {
    loggedIn: boolean | null;
    setLoggedIn: Dispatch<SetStateAction<boolean | null>>;
}

export const LoggedInContext = createContext<LoggedInContextType | undefined>(undefined);

export const LoggedInProvider = ({ children }: { children?: ReactNode }) => {
    const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

    return (
        <LoggedInContext.Provider value={{ loggedIn, setLoggedIn }}>
            {children}
        </LoggedInContext.Provider>
    );
};

export const useLoggedIn = () => {
    const context = useContext(LoggedInContext)
    if (!context) {
        throw new Error(`useLoggedIn must be used within a LoggedInProvider`);
    }
    return context;
};