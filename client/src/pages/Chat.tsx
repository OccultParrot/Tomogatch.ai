import { useState, useEffect, FormEvent } from "react";

// The message interface will be replaced with the actual message schema once its working in base form

interface Message {
  sender: string;
  content: string;
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  // Nook Pictures
  const nookPic = "./assets/nooks/nook1.png";

  // User and Cat Data - Populated through user routing and SQL queries
  const tempCatName = "Whisky";

  const handleSend = async (event: FormEvent) => {
    event.preventDefault(); // Prevent form from refreshing the page
    const userMessage: Message = { sender: "You", content: input };

    // Add user message to the chat
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Use the jwt to get the user id and params to get the cat id
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user123", // Replace with real user ID
          catId: "cat456", // Replace with real cat ID
          input,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      // Will be replaced with actual cat name in real schema
      const catMessage: Message = { sender: "Whiskers", content: data.content };

      // Add cat's response to the chat
      setMessages((prev) => [...prev, catMessage]);
    } catch (error) {
      console.error("Error during chat interaction:", error);
    }

    // Clear input field
    setInput("");
  };

  // Function for the play, feed, and gift buttons
  async function handleInteraction(interactionType: string) {
    console.log(`Interaction: ${interactionType}`); // Debugging

    // Need the logic for handling each interaction
    // Example: Call API to log the interaction endpoint
    try {
      const response = await fetch("/api/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user123", // Replace with actual user ID
          catId: "cat456", // Replace with actual cat ID
          interactionType, // Play, Feed, or Gift
          interactionDescription: "User /played/ with the cat",
          // date and id would be auto-generated by the server
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Interaction response:", data);
    } catch (error) {
      console.error("Error handling interaction:", error);
    }
  }

  useEffect(() => {
    //  Query the SQL for user and cat data - dependency might be interaction history
  }, []);

  return (
    <div className="flex max-h-full">
      {/* Chat Messages Section */}
      <div
        className="w-2/3 p-4 border-r border-r-color_1 relative"
        style={{
          backgroundImage: `url(${nookPic})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
        }}
      >
        <div className="mb-4 max-h-[70%] p-4 space-y-4">
          <h1 className="text-3xl font-bold text-color_2 underline underline-offset-4 bg-color_1 text-center rounded-md p-2 shadow-2xl shadow-color_4">
            Chat with {tempCatName}
          </h1>

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg shadow-md max-w-xs ${
                msg.sender === "You"
                  ? "ml-auto bg-color_4 text-color_b"
                  : "mr-auto bg-color_2 text-color_1"
              }`}
            >
              <strong>{msg.sender}:</strong> {msg.content}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSend}
          className="absolute bottom-0 left-0 w-full p-4 flex bg-color_1 border-t border-color_1"
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
      <div className="w-1/3 p-4 bg-color_1 flex flex-col gap-10 justify-start">
        <h2 className="text-xl font-bold text-color_2 text-center mt-12">
          Actions
        </h2>

        {["Play", "Feed", "Gift"].map((action) => (
          <button
            key={action}
            className="w-full px-4 py-2 border-2 rounded-3xl border-color_3 text-2xl text-color_b font-serif font-extrabold bg-color_2 
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
