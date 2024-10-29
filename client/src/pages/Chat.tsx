import { useState, useEffect, FormEvent } from "react";
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

  const nookPic = selectedNook;
  const userId = getUserIdFromToken();
  console.log("User ID:", userId);

  useEffect(() => {
    if (!userId || !selectedCat) return;

    const fetchData = async () => {
      try {
        const fetchedUser = await retrieveUser(userId);
        const fetchedCat = await retrieveCat(selectedCat.id);
        const fetchedInteractions = await retrieveLast5Interactions(
          selectedCat.id!,
          userId
        );
        setUserData(fetchedUser);
        setCatData(fetchedCat);
        if (fetchedInteractions.length > 0) {
          setInteractions(fetchedInteractions);
          console.log("Interactions:", fetchedInteractions);
        }
      } catch (error) {
        console.error("Error retrieving user or cat data:", error);
      }
    };

    fetchData();
  }, [userId, selectedCat]);

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
    } catch (error) {
      console.error("Error during chat interaction:", error);
    }

    setInput("");
  };

  // Function to handle interactions with the cat and sent them to the API
  const handleInteraction = async (interactionType: string) => {
    if (!catData || !userData) return;
    const createdAt = userData.createdAt;

    try {
      const data = await createInteraction(interactionType, catData.id!);
      setInteraction(data);
      console.log("Interaction:", interaction);
      const autoMessage = `You just ${interactionType} with ${catData.name}.`;
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
            userData,
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
      } catch (error) {
        console.error("Error during chat interaction:", error);
      }
    } catch (error) {
      console.error("Error handling interaction:", error);
    }
  };

  if (!catData) return <p>Loading...</p>;

  if (!userData) return <p>Fetching user data...</p>;
  // const { yarn } = userData;

  if (!interactions) return <p>Fetching interactions...</p>;
  // Will use yarn next update to interact with the cat
  // console.log("Yarn:", yarn);
  console.log("Interactions:", interactions);

  return (
    <div className="flex h-full w-full">
      <div
        className="flex flex-col w-2/3 p-4 border-r border-r-color_1 relative"
        style={{
          backgroundImage: `url(${nookPic})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-3xl font-bold text-color_2 underline underline-offset-4 bg-color_1 text-center rounded-md p-2 shadow-2xl shadow-color_4 mb-4">
          Chat with {catData.name}
        </h1>

        {/* Chat Messages */}
        <div>
          <strong>Yarn available:</strong> {userData?.yarn}
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
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
          className="absolute bottom-24 left-48 max-w-24"
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

      <div className="w-1/3 p-4 bg-color_1 flex flex-col items-center justify-center gap-10">
        <h2 className="text-xl font-bold text-color_2">Actions</h2>
        {["Play", "Feed", "Gift"].map((action) => (
          <button
            key={action}
            className="w-3/4 px-4 py-2 border-2 rounded-3xl border-color_3 text-2xl text-color_b font-serif font-extrabold bg-color_2 hover:bg-color_4 transition-colors duration-200"
            onClick={() => handleInteraction(action.toLowerCase())}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
