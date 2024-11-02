import {createContext,
    useState, useContext,
    type ReactNode,
    Dispatch,
    SetStateAction
} from "react";

import {CatData} from "../interfaces/CatData";

interface CatContextType {
  selectedCat: CatData | null;
  setSelectedCat: Dispatch<SetStateAction<CatData | null>>;
}

export const CatContext = createContext<CatContextType | undefined>(undefined);

export const CatProvider = ({children}: { children?: ReactNode }) => {
  const [selectedCat, setSelectedCat] = useState<CatData | null>(null);

  return (
    <CatContext.Provider value={{selectedCat, setSelectedCat}}>
      {children}
    </CatContext.Provider>
  );
};

export const useCatContext = () => {
  const context = useContext(CatContext);
  if (!context) {
    throw new Error('useCat must be used within a CatProvider');
  }
  return context;
};