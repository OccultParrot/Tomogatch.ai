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

  const [lastLogin, setLastLogin] = useState<string | null>(null);

  // Calculate the days since the last login
  const timeSinceLastLogin = (lastLoginDate: Date) => {
    const currentDate = new Date();
    const lastLogin = new Date(lastLoginDate);
    const differenceInTime = currentDate.getTime() - lastLogin.getTime();
    return differenceInTime; // in milliseconds
  };
  // Helper to format the time difference
  const formatTimeDifference = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  // Fetch last login and set the new login time in the database
  const handleLastLogin = async () => {
    const token = Auth.getToken();
    const userId = getUserIdFromToken();

    if (!token || !userId) {
      console.log("Token or user ID not found. Skipping fetch.");
      return;
    }

    try {
      // Fetch last login date
      const response = await fetch(`/api/users/${userId}/lastLogin`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch last login");
      }

      const data = await response.json();
      console.log("Last login fetched:", data);

      if (data.lastLoginDate) {
        // Get the days since the last login
        const timeSinceLogin = timeSinceLastLogin(data.lastLoginDate);
        console.log("Time since last login:", timeSinceLogin);
        const formattedTime = formatTimeDifference(timeSinceLogin);

        console.log(
          `Last login was ${formattedTime.days} days, ${formattedTime.hours} hours, ${formattedTime.minutes} minutes, and ${formattedTime.seconds} ago.`
        );

        setLastLogin(data.lastLoginDate);
      } else {
        console.log("No previous login date found.");
      }

      // Update the last login date to the current time
      await fetch(`/api/users/${userId}/lastLogin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Last login updated successfully");
    } catch (error) {
      console.error("Error handling last login:", error);
    }
  };

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

      // Handle last login logic
      await handleLastLogin();
    } catch (error) {
      console.error("Error fetching cats:", error);
    }
  }, [user]);

  // Ensure fetching happens whenever the user state updates
  useEffect(() => {
    console.log("Home mounted or user state changed.");
    fetchCatsForUser(); // Trigger fetch and update lastLogin
    console.log("User last logged in: ", lastLogin);
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
