import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CatData } from "../interfaces/CatData";
import { retrieveUserCats } from "../api/userAPI";
import Auth from "../utils/auth";
import { useCatContext } from "../context/CatContext";
import CatCard from "../components/catCard";
import { getUserIdFromToken } from "../utils/userToken";
import { useUser } from "../context/UserContext";
import { retrieveUser } from "../api/userAPI";
// import { UserData } from "../interfaces/userData";

const Home: React.FC = () => {
  const [adoptableCats, setAdoptableCats] = useState<CatData[]>([]);
  const [userCats, setUserCats] = useState<CatData[]>([]);
  // const [userData, setUserData] = useState<UserData | null>(null);
  const { setSelectedCat } = useCatContext();
  const { user } = useUser();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [timeSinceLogin, setTimeSinceLogin] = useState<string | null>(null);
  const [bonusYarn, setBonusYarn] = useState<boolean>(false);
  const [bonusYarnValue, setBonusYarnValue] = useState<number>(0);
  const [currentUserYarnValue, setCurrentUserYarnValue] = useState<number>(0);

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
    setTimeSinceLogin(
      `The last time you saw your cats was ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds ago.`
    );
    // 150 yarn per day per user max - 10 yarn per hour away
    if (hours * 10 < 150) {
      setBonusYarnValue(hours * 10);
    } else {
      setBonusYarnValue(150);
    } // 200 max bonus yarn per day
    return { days, hours, minutes, seconds };
  };

  // get user's current yarn value
  const getYarn = async () => {
    const token = Auth.getToken();
    const userId = getUserIdFromToken();

    if (!token || !userId) {
      console.log("Token or user ID not found. Skipping fetch.");
      return;
    }

    try {
      const user = await retrieveUser(userId);
      console.log("User fetched, setting current yarn to :", user.yarn);
      setCurrentUserYarnValue(user.yarn);
    } catch (error) {
      console.error("Error fetching yarn:", error);
    }
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
          `Last login was ${formattedTime.days} days, ${formattedTime.hours} hours, ${formattedTime.minutes} minutes, and ${formattedTime.seconds} seconds ago.`
        );
        // setLastLogin locally with a string (not a Date like the db)
        setLastLogin(
          data.lastLoginDate.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
        );

        if (formattedTime.hours > 12) {
          console.log(
            "You've been away for more than 12 hours. Awarding bonus yarn!"
          );
          setBonusYarn(true);
        }
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
    getYarn(); // Fetch the current yarn value
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

  const updateYarn = async () => {
    const token = Auth.getToken();
    const userId = getUserIdFromToken();

    if (!token || !userId) {
      console.log("Token or user ID not found. Skipping fetch.");
      return;
    }
    try {
      const fetchedUser = await retrieveUser(userId);
      if (!fetchedUser) {
        console.error("User not found. Skipping bonus yarn award.");
        return;
      }
      console.log("User fetched for bonus yarn:", fetchedUser);
      const newYarn = fetchedUser.yarn + bonusYarnValue;
      setCurrentUserYarnValue(newYarn);
      console.log("New yarn value after bonus:", newYarn);

      // update the user's yarn value in DB with BONUS YARN!
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...fetchedUser,
            yarn: newYarn,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error("Error updating user yarn");
        }

        console.log("User yarn updated:", data);
        console.log("User yarn updated successfully");
      } catch (error) {
        console.error("Error updating user yarn:", error);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    updateYarn();
  }, [bonusYarn, bonusYarnValue, lastLogin]);

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
      <div className="flex flex-col font-bold gap-6 p-6 mt-6 border-2 border-color_7 rounded-xl bg-color_2">
        <div className="text-color_7">
          Last login:{" "}
          {lastLogin
            ? new Date(lastLogin).toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })
            : "Not available"}
        </div>
        {timeSinceLogin && <div className="text-color_7">{timeSinceLogin}</div>}
        {bonusYarn && (
          <div className="text-color_7">
            You have been awarded {bonusYarnValue} Bonus Yarn!
          </div>
        )}
        {(currentUserYarnValue !== null || undefined) && (
          <div className="text-color_7">
            You currently have{" "}
            <span className="font-bold text-xl underline">
              {" "}
              {currentUserYarnValue} Yarn
            </span>
            ! Log in daily to earn more!
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
