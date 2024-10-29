import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AuthService from "../utils/auth"; // Your existing auth service
import { getUserIdFromToken } from "../utils/userToken"; // Utility function

interface User {
  id: number;
  username: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from token on app mount
  useEffect(() => {
    const token = AuthService.getToken();
    if (token && !AuthService.isTokenExpired(token)) {
      const userId = getUserIdFromToken(); // Extract user ID from token
      if (userId) {
        setUser({ id: userId, username: AuthService.getProfile()?.username });
      }
    }
  }, []); // Run only on initial load

  const value = { user, setUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook for accessing user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
