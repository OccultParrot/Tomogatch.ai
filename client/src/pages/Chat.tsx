import { useState, useEffect, FormEvent, useRef } from "react";
import Auth from "../utils/auth";
import { useCatContext } from "../context/CatContext";
import { UserData } from "../interfaces/userData";
import { getUserIdFromToken } from "../utils/userToken";
import { retrieveUser } from "../api/userAPI";
import { retrieveCat } from "../api/catAPI";
import { retrieveLast5Interactions } from "../api/interactionAPI";
// import { useUser } from "../context/UserContext";
import { createInteraction } from "../api/interactionAPI";
import { InteractionData } from "../interfaces/InteractionData";
import { useNookContext } from "../context/NookContext";
import { CatData } from "../interfaces/CatData";
import { updateCatData } from "../api/catAPI";
import { updateUser } from "../api/userAPI";

interface Message {
  sender: string;
  content: string;
}

export default function Chat() {
  const { selectedCat } = useCatContext();
  const { selectedNook } = useNookContext();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [catData, setCatData] = useState(selectedCat || null);
  const [interaction, setInteraction] = useState<InteractionData | null>(null);
  const [interactions, setInteractions] = useState<InteractionData[]>([]);
  const [interactionImage, setInteractionImage] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null); // Create a ref for the chat container
  const [interactionImages] = useState(() => {
    const interactionImages = {
      play: "./assets/other/toy-01.png",
      feed: "./assets/other/food-01.png",
      gift: "./assets/other/gift-01.png",
      null: null,
    };
    return interactionImages;
  });
  const [catMoodPics] = useState(() => {
    const catNames = {
      Whiskers: 1,
      Bubbles: 2,
      Shadow: 3,
      Mittens: 4,
    };
    const name = selectedCat?.name as keyof typeof catNames | undefined;
    const number = name ? catNames[name] : undefined;

    const moodPicArr = [
      `/assets/cats/cat-0${number}/mood-12.png`,
      `/assets/cats/cat-0${number}/mood-34.png`,
      `/assets/cats/cat-0${number}/mood-56.png`,
      `/assets/cats/cat-0${number}/mood-78.png`,
      `/assets/cats/cat-0${number}/mood-910.png`,
    ];

    return moodPicArr;
  });

  useEffect(() => {
    // Scroll to the bottom of the chat container when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // Updates when messages come in

  const getMoodImage = (mood: number) => {
    if (mood === 1 || mood === 2) {
      return catMoodPics[0];
    } else if (mood === 3 || mood === 4) {
      return catMoodPics[1];
    } else if (mood === 5 || mood === 6) {
      return catMoodPics[2];
    } else if (mood === 7 || mood === 8) {
      return catMoodPics[3];
    } else if (mood === 9 || mood === 10) {
      return catMoodPics[4];
    } else {
      return undefined;
    }
  };

  const nookPic = selectedNook;
  const userId = getUserIdFromToken();
  console.log("User ID:", userId);

  useEffect(() => {
    if (!userId || !selectedCat) return;

    const fetchData = async () => {
      try {
        const fetchedUser = await retrieveUser(userId);
        setUserData(fetchedUser);
        console.log("User has", userData?.yarn, "yarn"); // bebugging

        const fetchedCat = await retrieveCat(selectedCat.id);
        setCatData(fetchedCat);

        const fetchedInteractions = await retrieveLast5Interactions(
          selectedCat.id!,
          userId
        );

        if (fetchedInteractions.length > 0) {
          setInteractions(fetchedInteractions);
          console.log("Interactions:", fetchedInteractions);
        }
      } catch (error) {
        console.error("Error retrieving user or cat data:", error);
      }
    };

    fetchData();
  }, [userId, selectedCat, interaction]);

  // Function to handle sending a message to the OPENAI API - when a user sends a message
  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!catData || !userData) return;

    const createdAt = userData.createdAt;
    console.log("User created at:", createdAt);

    const userMessage: Message = { sender: "You", content: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Auth.getToken()}`,
        },
        body: JSON.stringify({
          userData,
          catData,
          // interactions,
          userInput: input,
          createdAt,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      const catMessage: Message = {
        sender: catData.name,
        content: data.content,
      };
      setMessages((prev) => [...prev, catMessage]);
      // Temp logging
      // console.log("Chat response:", data);
      const {
        content: catResponse,
        mood: newMood,
        patience: newPatience,
        timestamp,
      } = data;
      console.log(
        "Cat Response:",
        catResponse,
        "New Mood:",
        newMood,
        "New Patience:",
        newPatience,
        "Timestamp:",
        timestamp
      );
      const newCatData = { ...catData, mood: newMood, patience: newPatience };
      console.log("new catData", newCatData);
      setCatData(newCatData);
      try {
        const updatedCatToDB = await updateCatData(catData.id, newCatData);
        console.log("Updated Cat Data from DB:", updatedCatToDB);
      } catch (error) {
        console.error("Failed to update cat mood on the database:", error);
      }
    } catch (error) {
      console.error("Error during chat interaction:", error);
    }

    setInteractionImage(null);
    setInput("");
  };

  useEffect(() => {
    setInteractions((interactions) => [...interactions, interaction!]);
  }, [interaction]);

  // Function to handle interactions with the cat and sent them to the API
  const handleInteraction = async (interactionType: string) => {
    if (!catData || !userData) return;
    const createdAt = userData.createdAt;

    try {
      const data = await createInteraction(interactionType, catData.id!);

      setInteraction(data);
      console.log(
        "Setting interaction image:",
        interactionImages[interactionType]
      );
      setInteractionImage(interactionImages[interactionType]);

      console.log("Interaction:", interaction);

      const updatedUserData = await retrieveUser(userId);
      setUserData(updatedUserData);

      console.log("updated user yarn:", updatedUserData.yarn);

      const generateAutoMessage = (
        interactionType: string,
        catData: CatData
      ) => {
        switch (interactionType) {
          case "play":
            return `You just played with ${catData.name}.`;
          case "gift":
            return `You just gave a gift to ${catData.name}.`;
          case "feed":
            return `You just fed ${catData.name}.`;
          default:
            return `You just interacted with ${catData.name}.`;
        }
      };

      // Use the auto message generation function to create a message based on type of interaction
      const autoMessage = generateAutoMessage(interactionType, catData);
      console.log(autoMessage);

      setMessages((prev) => [
        ...prev,
        { sender: "INFO", content: autoMessage },
      ]);

      // Optional: Trigger a chat response after interaction
      try {
        const res = await fetch("/api/chat/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Auth.getToken()}`,
          },
          body: JSON.stringify({
            userData: updatedUserData,
            catData,
            // interactions,
            userInput: autoMessage,
            createdAt,
          }),
        });

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        const catMessage: Message = {
          sender: catData.name,
          content: data.content,
        };
        setMessages((prev) => [...prev, catMessage]);
        // Temp logging
        // console.log("Chat response:", data);
        const {
          content: catResponse,
          mood: newMood,
          patience: newPatience,
          timestamp,
        } = data;
        console.log(
          "Cat Response:",
          catResponse,
          "New Mood:",
          newMood,
          "New Patience:",
          newPatience,
          "Timestamp:",
          timestamp
        );

        let newCatData: CatData;
        // Depending on if interaction was feed, set different catData
        if (interactionType === "feed") {
          setCatData(
            (prev) =>
              ({
                ...prev,
                mood: newMood,
                patience: newPatience,
                lastFeedDate: new Date(),
                avatar: getMoodImage(newMood),
              } as CatData)
          );
          // Update the cat data in DB with the new mood and patience AND lastFeedDate
          newCatData = {
            ...catData,
            mood: newMood,
            patience: newPatience,
            lastFeedDate: new Date(),
          };
        } else {
          setCatData(
            (prev) =>
              ({
                ...prev,
                mood: newMood,
                patience: newPatience,
                avatar: getMoodImage(newMood),
              } as CatData)
          );
          // Update the cat data with the new mood and patience (this will update the default avatar in the db this way)
          newCatData = { ...catData, mood: newMood, patience: newPatience };
        }
        // Update the cat data with the new mood and patience and lastFeedDate if feed

        try {
          const updatedCatToDB = await updateCatData(catData.id, newCatData);
          console.log("Updated Cat Data in DB:", updatedCatToDB);
        } catch (error) {
          console.error("Failed to update cat in the database:", error);
        }
        // Update the user data with the new yarn
        console.log("updated user yarn:", updatedUserData.yarn);
        setUserData(updatedUserData);
        try {
          const updatedUserToDB = await updateUser(userId, updatedUserData);
          console.log("Updated User Data in DB:", updatedUserToDB);
        } catch (error) {
          console.error("Failed to update user in the database:", error);
        }
      } catch (error) {
        console.error("Error during chat interaction:", error);
      }
    } catch (error) {
      console.error("Error handling interaction:", error);
    }
  };

  const actions = [
    {action: "Play", cost: "10"},
    {action: "Feed", cost: "20"},
    {action: "Gift", cost: "30"}
  ]

  if (!catData) return <p>Loading...</p>;

  if (!userData) return <p>Fetching user data...</p>;
  // const { yarn } = userData;

  if (!interactions) return <p>Fetching interactions...</p>;
  // Will use yarn next update to interact with the cat
  // console.log("Yarn:", yarn);
  console.log("Interactions:", interactions);

  return (
    <div className="flex h-full w-full flex-col lg:flex-row">
      <div
        className="flex flex-col w-full h-full p-4 border-r border-r-color_1 relative lg:w-2/3"
        style={{
          backgroundImage: `url(${nookPic})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="floating-image-container">
          {/* interaction image overlay */}
          {interactionImage && (
            <img
              src={interactionImage}
              alt="Interaction"
              className="floating-image absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-36"
            />
          )}
        </div>

        <h1 className="text-3xl font-bold text-color_2 underline underline-offset-4 bg-color_1 text-center rounded-md p-2 shadow-2xl shadow-color_4 mb-4">
          Chat with {catData.name}
        </h1>

        {/* Chat Messages */}

        <div
          className="flex-grow overflow-y-auto p-4 space-y-4"
          ref={chatContainerRef}
        >
          {" "}
          {/* Attach the ref to the chat container to update the window when new
          messages come in */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg shadow-md max-w-xs ${
                msg.sender === "You"
                  ? "ml-auto bg-color_4 text-color_0"
                  : "mr-auto bg-color_2 text-color_1"
              }`}
            >
              <strong>{msg.sender}:</strong> {msg.content}
            </div>
          ))}
        </div>

        <img
          src={catData.avatar}
          alt="Cat Avatar"
          className="absolute bottom-24 left-1/2 max-w-24"
        />

        <form
          onSubmit={handleSend}
          className="p-4 flex bg-color_1 border-t border-color_1"
        >
          <input
            type="text"
            className="border border-color_1 p-2 flex-grow rounded-lg bg-white text-color_1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to your cat..."
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-color_3 text-white rounded-lg hover:bg-color_5 transition-colors"
          >
            Send
          </button>
        </form>
      </div>

      <div className="w-full p-4 bg-color_1 flex flex-col items-center justify-center gap-4 lg:w-1/3">
        <h2 className="text-xl font-bold text-color_2">
          Use Yarn to cheer your cat up!
        </h2>
        <div className="text-color_2 text-xl font-bold flex items-center gap-1">
          <strong>Yarn available: {userData?.yarn} </strong>
          <img src="assets/other/yarn-02-icon.png" alt="yarn icon" className="w-7 mt-[3px]"/>
        </div>
        <div className="flex flex-col gap-2 sm:gap-10 justify-center items-center lg:flex-col">
          {/* {interactions.length > 0 && (
            <div>
              {interactions.map((interaction) => {
                return <p>{interaction.description}</p>;
              })}
            </div>
          )} */}
          {actions.map((e) => (
            <button
              key={e.action}
              className="flex items-center gap-1 px-4 py-2 border-2 rounded-3xl border-color_3 text-2xl text-color_b font-serif font-extrabold bg-color_2 hover:bg-color_4 transition-colors duration-200"
              onClick={() => handleInteraction(e.action.toLowerCase())}
            >
              {e.action}:
              <span className="text-color_3 text-3xl"> {e.cost} </span>
              <img src="assets/other/yarn-02-icon.png" alt="yarn icon" className="w-7 mt-[1px]"/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
