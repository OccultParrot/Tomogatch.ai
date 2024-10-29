import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CatData } from "../interfaces/CatData";
import { retrieveUserCats } from "../api/userAPI";
import Auth from "../utils/auth";
import { useCatContext } from "../context/CatContext";
import CatCard from "../components/catCard";
import { getUserIdFromToken } from "../utils/userToken";
import { useUser } from "../context/UserContext";

const Home: React.FC = () => {
  const [adoptableCats, setAdoptableCats] = useState<CatData[]>([]);
  const [userCats, setUserCats] = useState<CatData[]>([]);
  const { setSelectedCat } = useCatContext();
  const { user } = useUser();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch data for the user with updated logging and token handling
  const fetchCatsForUser = useCallback(async () => {
    const token = Auth.getToken();
    console.log("Auth token:", token);

    if (!user || !token) {
      console.log("User or token not found. Skipping fetch.");
      return; // Early return if user or token is not available
    }

    try {
      console.log("Fetching cats for user ID:", user.id);

      const adoptableResponse = await fetch(
        `/api/users/adoptablecats?userId=${user.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!adoptableResponse.ok) {
        throw new Error("Failed to fetch adoptable cats");
      }
 
      const adoptable = await adoptableResponse.json();
      setAdoptableCats(adoptable);
      console.log("Fetched adoptable cats:", adoptable);

      const ownedCats = await retrieveUserCats();
      setUserCats(ownedCats);
      console.log("Fetched owned cats:", ownedCats);
    } catch (error) {
      console.error("Error fetching cats:", error);
    }
  }, [user]);

  // Ensure fetching happens whenever the user state updates
  useEffect(() => {
    console.log("Home mounted or user state changed.");
    fetchCatsForUser(); // Trigger fetch
  }, [user, fetchCatsForUser]);

  const handleAdopt = async (cat: CatData) => {
    setIsLoading(true);
    try {
      const token = Auth.getToken();
      const userId = getUserIdFromToken();

      console.log("Attempting to adopt cat:", cat);

      const response = await fetch("/api/cats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...cat, userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to adopt cat");
      }

      const updatedUserCats = await response.json();
      console.log("Updated user cats after adoption:", updatedUserCats);

      setUserCats(updatedUserCats);
      setAdoptableCats((prev) => prev.filter((c) => c.id !== cat.id));

      console.log("Cat adopted successfully.");
    } catch (error) {
      console.error("Error adopting cat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnedCat = (cat: CatData) => {
    setSelectedCat(cat);
    console.log("Navigating to cat page for:", cat.name);
    navigate(`/${cat.name.toLowerCase()}`, { state: { cat } });
  };

  return (
    <div className="container mx-auto p-6 bg-color_1 rounded-b-2xl">
      <h1 className="text-2xl font-bold mb-6">Your Adopted Cats</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {userCats.map((cat) => (
            <CatCard
              key={cat.id}
              cat={cat}
              isAvailable={false}
              onClick={() => handleOwnedCat(cat)}
            />
          ))}
          {adoptableCats.map((cat) => (
            <CatCard
              key={cat.id}
              cat={cat}
              isAvailable={true}
              onClick={() => handleAdopt(cat)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
