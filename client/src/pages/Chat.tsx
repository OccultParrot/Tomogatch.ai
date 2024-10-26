import { useState, useEffect, FormEvent } from "react";
import Auth from "../utils/auth";
import { useCatContext } from "../context/CatContext";
import { UserData } from "../interfaces/userData";
import { getUserIdFromToken } from "../utils/userToken";
import { retrieveUser } from "../api/userAPI";
import { retrieveCat } from "../api/catAPI";
import { useUser } from "../context/UsertContext";
import { createInteraction } from "../api/interactionAPI";

// The message interface will be replaced with the actual message schema once its working in base form

interface Message {
  sender: string;
  content: string;
}

export default function Chat() {
  const { selectedCat: cat } = useCatContext()
  if (!cat) {
    console.log(cat)
    return
  }

  const {user: user1 } = useUser()
  if(!user1) {
    console.log(`no user found`)
    return
  } else {
    console.log(user1)
  }

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [catData, setCatData] = useState(cat);

  // Nook Pictures
  const nookPic = "./assets/nooks/nook4.png";

  const handleSend = async (event: FormEvent) => {
    event.preventDefault(); // Prevent form from refreshing the page
    const userMessage: Message = { sender: "You", content: input };

    // Add user message to the chat
    setMessages((prev) => [...prev, userMessage]);

    // Debug log before fetch
    console.log("Sending request...");

    try {
      // Use the jwt to get the user id and params to get the cat id
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Auth.getToken()}`,
        },
        // Replace with actual user and cat IDs after tested
        body: JSON.stringify({
          userId: getUserIdFromToken,
          catId: cat.id,
          userInput: input,
        }),
      });
      // Log the response object for debugging
      console.log("Response received:", res);

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Chat response:", data);
      if (data && data.content) {
        const catMessage: Message = { sender: cat.name, content: data.content };
        // Add cat's response to the chat
        setMessages((prev) => [...prev, catMessage]);
      } else {
        console.error("No content in chat response");
      }
    } catch (error) {
      console.error("Error during chat interaction:", error);
    }
    // Clear input field
    setInput("");
  };

  // Function for the play, feed, and gift buttons
  async function handleInteraction(interactionType: string) {
    console.log(`Interaction: ${interactionType}`); // Debugging

    try {
      const catId = cat.id !== null ? cat.id : 0; // catId must be a number
      const data = await createInteraction(interactionType, catId);
      console.log({
        
        data})
    } catch (error) {
      console.error("Error handling interaction:", error);
    }
  }

  useEffect(() => {
    //  Query the SQL for user and cat data - dependency might be interaction history
    const fetchData = async () => {
      const userId = getUserIdFromToken();
      if (userId) {
        try {
          const user = await retrieveUser(userId);
          console.log("user data:", user);
          setUserData(user);

          const updatedCat = await retrieveCat(cat.id);
          console.log("cat data:", updatedCat);
          setCatData(updatedCat);
        } catch (error) {
          console.error("Error retrieving user and cat data:", error);
        }
      }
    };
    fetchData();
  }, [cat.id]);

  return (
    <div className="flex h-full w-full">
      {/* Chat Messages Section */}
      <div
        className="flex flex-col w-2/3 p-4 border-r border-r-color_1 relative"
        style={{
          backgroundImage: `url(${nookPic})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Chat Header */}
        <h1 className="text-3xl font-bold text-color_2 underline underline-offset-4 bg-color_1 text-center rounded-md p-2 shadow-2xl shadow-color_4 mb-4">
          Chat with {catData.name}
        </h1>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg shadow-md max-w-xs ${
                msg.sender === userData?.username
                  ? "ml-auto bg-color_5 text-color_0"
                  : "mr-auto bg-color_2 text-color_1"
              }`}
            >
              <strong>{msg.sender}:</strong> {msg.content}
            </div>
          ))}
        </div>
        {/* The bottom and left or right properties can be adjusted to make the images move a little maybe - post MVP */}
        <img
          src={catData.avatar}
          alt="Cat Avatar"
          className="absolute bottom-24 left-48 max-w-24"
        />
        {/* Message Input Form */}
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

      {/* Action Buttons Section */}
      <div className="w-1/3 p-4 bg-color_1 flex flex-col items-center justify-center gap-10">
        <h2 className="text-xl font-bold text-color_2">Actions</h2>

        {["Play", "Feed", "Gift"].map((action) => (
          <button
            key={action}
            className="w-3/4 px-4 py-2 border-2 rounded-3xl border-color_3 text-2xl text-color_b font-serif font-extrabold bg-color_2 
            hover:bg-color_4 transition-colors duration-200"
            onClick={() => handleInteraction(action.toLowerCase())}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
