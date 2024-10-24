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
    <div className="flex h-screen">
      {/* Chat Messages on the Left Side? */}
      <div
        className="w-2/3 p-4 border-r border-r-color_1 relative"
        style={{
          backgroundImage: `url(${nookPic})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh", // Full height to cover the chat area
        }}
      >
        <div className="mb-4 h-[80%] overflow-y-auto p-4 space-y-4">
          <h2 className="text-lg font-bold text-white">Chat with CatName</h2>
          <p className="text-white">
            We will have an image wrap this whole thing and make it the
            catChatBackground set on top of the image that is sitting below
            right now. Make each message a bubble, rounded border radius, with a
            white background and a shadow around it.
          </p>

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg shadow-md max-w-xs ${
                msg.sender === "You"
                  ? "bg-blue-100 ml-auto"
                  : "bg-white mr-auto"
              }`}
            >
              <strong>{msg.sender}:</strong> {msg.content}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSend}
          className="absolute bottom-0 left-0 w-full p-4 flex bg-white border-t"
        >
          <input
            type="text"
            className="border p-2 flex-grow rounded-lg"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Send
          </button>
        </form>
      </div>

      {/* Action Buttons on the Right Side */}
      <div className="w-1/3 p-4">
        <h2 className="text-xl font-bold mb-4">Actions</h2>

        {["Play", "Feed", "Gift"].map((action) => (
          <button
            key={action}
            className="w-full mb-2 px-4 py-2 border-2 border-orange-500 text-orange-500 font-bold bg-white 
                 hover:bg-orange-500 hover:text-white transition-colors duration-200"
            onClick={() => handleInteraction(action.toLowerCase())}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
