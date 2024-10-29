import { createContext, ReactNode, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type HistoryContextTYpe = {};

const HistoryContext = createContext<HistoryContextTYpe | undefined>(undefined);

interface HistoryProviderProps {
    children: ReactNode;
}
export const HistoryProvider = ({ children }: HistoryProviderProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.setItem('lastPath', location.pathname);
    }, [location]);

    useEffect(() => {
        const lastPath = sessionStorage.getItem('lastPath');
        if (lastPath && lastPath !== location.pathname) {
            navigate(lastPath, { replace: true });
        }
    }, [navigate]);

    return (
        <HistoryContext.Provider value={{}}>
            {children}
        </HistoryContext.Provider>
    );
};

export const useHistoryContext = () => {
    const context = useContext(HistoryContext);
    if (context === undefined) {
        throw new Error("useHistoryContext must be used within a HistoryProvider");
    }
    return context;
};