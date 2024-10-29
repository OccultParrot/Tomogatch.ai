// @ts-nocheck
import dotenv from "dotenv";
dotenv.config();
import { getUserCreatedAt } from "./user-controller.js";
import moment from "moment";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
// import { BufferMemory } from "langchain/memory";
import { ConversationSummaryBufferMemory } from "langchain/memory";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

// Function to get the buffer string from the chat history - to be used to prune memory
function getBufferString(
  messages = [],
  humanPrefix = "Human",
  aiPrefix = "AI"
) {
  if (!Array.isArray(messages)) {
    console.error("Chat history is not an array:", messages);
    return "";
  }

  return messages
    .map((msg) => {
      const speaker =
        msg.constructor.name === "HumanMessage" ? humanPrefix : aiPrefix;
      return `${speaker}: ${msg.content}`;
    })
    .join("\n");
}

// Initialize the Chat Model
const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.1,
  maxTokens: 500,
});
// Redis chat history setup - now it will take in the sessionId (made of token_id and catId)
async function initializeMemory(sessionId) {
  const upstashMessageHistory = new UpstashRedisChatMessageHistory({
    sessionId, // Now this is being passed in
    config: {
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REST_TOKEN,
    },
  });
  // Formats the memory object being stored to the Redis store - this is the default Buffer Memory
  // we are trying to incorporate the newer ConversationSummaryBufferMemory to summarize the chat history and save tokens
  // return new BufferMemory({
  //   memoryKey: "history",
  //   chatHistory: upstashMessageHistory,
  //   format: (message) => ({
  //     content: message.content,
  //     mood: message.mood,
  //     patience: message.patience,
  //     timestamp: message.timestamp,
  //   }),
  //   maxTokenLimit: 500,
  // });
  // New ConversationSummaryBufferMemory setup
  return new ConversationSummaryBufferMemory({
    llm: model,
    memoryKey: "history",
    inputKey: "text", // Specify the input key explicitly
    chatHistory: upstashMessageHistory,
    maxTokenLimit: 500,
  });
}
// Function to Prepare Chat Inputs for the Model based on User and Cat Data
async function prepareChatInputs(user, cat, formattedHistory, userInput) {
  // Testing the retrieval of interactions data for proper date formatting
  // console.log("Interactions data:", interactions);
  // Create a string with the 5 most recent SQL interactions between the user and cat
  //   const interactionHistory = interactions
  //     .map((interaction) => {

  //       const date = new Date(interaction.interactionDate);

  //       if (isNaN(date.getTime())) {
  //         console.error(
  //           `Invalid date encountered: ${interaction.interactionDate}`
  //         );
  // Return a string with the interaction type, on Date and description
  //     return `${interaction.interactionType} on [Invalid Date]: ${interaction.description}`;
  //   }
  //   const formattedDate = moment(date).toISOString(); // Convert to ISO format
  //   return `${interaction.interactionType} on ${formattedDate}: ${interaction.description}`;
  // })
  // .join("\n");
  return {
    userName: user.username,
    catName: cat.name,
    userYarn: user.yarn,
    catMood: cat.mood,
    catPatience: cat.patience,
    input: userInput,
    formattedHistory,
  };
}
// Set up a zod schema for the response - this allows us to pull out the mood, patience, and
// timestamp from the AI response and treat them separately
const responseSchema = z.object({
  content: z.string(),
  mood: z.number().min(0).max(10), // Mood range 0 to 10
  patience: z.number().int().min(0).max(10), // Patience level from 0 to 10
  // Timestamp should be a valid date string - we can use this to sort the chat history
  timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid timestamp",
  }),
});
// Initialize the output parser with the response schema above
const outputParser = new StructuredOutputParser(responseSchema);
// Function to Handle the User-Cat Interaction - will be recursively called for each user input in the CLI chat for now
// Will be replaced with a single call from the UI to the backend API
export async function interactWithCat(req, res) {
  // Get the user and cat data, the chat and the token from the request body
  const { userData, catData, userInput, createdAt } = req.body;
  const catId = catData.id;
  // Helper function to convert the localized date string to numeric-only format
  const formatDateToNumber = (dateString) => {
    if (!dateString || typeof dateString !== "string") {
      throw new Error("Invalid date string");
    }
    // Extract only numeric characters
    return dateString.replace(/[^0-9]/g, "");
  };
  const userChatDBIDraw = createdAt;
  console.log("User Chat DB ID Raw:", userChatDBIDraw);
  const userChatDBID = formatDateToNumber(userChatDBIDraw);
  console.log("User Chat DB ID:", userChatDBID);
  // Prepare the chat inputs - this needs real data from SQL queries next using the user
  // and cat IDs to get interactions and catData (mood, patience, etc.)

  // Generate a unique sessionId using user's createdAt (formatted) + '_' + catId
  const sessionId = `${userChatDBID}_${catId}`;
  console.log("Session ID:", sessionId);
  // Initialize the memory with the sessionId for the chat history
  const memory = await initializeMemory(sessionId);

  // Retrieve chat history from memory
  const chatHistory = await memory.chatHistory.getMessages();

  // Log the full chat history (for debugging purposes)
  // console.log("Chat History:", chatHistory);

  // Format the chat history into a prompt-friendly string
  const formattedHistory = chatHistory
    .map((msg) => {
      const speaker = msg.constructor.name === "HumanMessage" ? "Human" : "AI";
      return `${speaker}: ${msg.content}`;
    })
    .join("\n");

  // Log the formatted history for debugging
  // console.log("Formatted Chat History: ", formattedHistory);

  // Prune the chat history if the token limit is exceeded with the getBufferString function
  memory.prune = async function () {
    console.log("Attempting to prune conversation.");

    try {
      const messages = await this.chatHistory.getMessages();
      const bufferString = getBufferString(messages, "Human", "AI");
      // console.log("Messages: ", messages, "Buffer String:", bufferString);

      const numTokens = await this.llm.getNumTokens(bufferString);
      console.log(`Number of tokens: ${numTokens}`);

      if (numTokens > this.maxTokenLimit) {
        console.log("Token limit exceeded. Summarizing conversation...");

        // Create a prompt as an array of chat messages
        const summaryPrompt = [new HumanMessage({ content: bufferString })];

        // Invoke the model with the properly formatted chat message array
        const summaryResponse = await this.llm.invoke(summaryPrompt);
        console.log("Generated Summary:", summaryResponse.content);

        // Replace the chat history with the summary in Redis
        await this.chatHistory.clear();
        await this.chatHistory.addMessage(
          new AIMessage({ content: summaryResponse.content })
        );
        console.log("Chat history replaced with summary.");
      }
    } catch (error) {
      console.error("Error during pruning:", error);
    }
  };

  // Prepare the chat inputs using the user and cat data and the user input
  const inputs = await prepareChatInputs(
    userData,
    catData,
    formattedHistory,
    userInput
  ); //took out interactions
  // Define the Prompt Template using the formatted input
  // The example needs to be in {{ double curly braces }} to be parsed correctly by the prompt template
  const prompt = ChatPromptTemplate.fromTemplate(`
You are a virtual cat. You do not speak in words; instead, you describe your actions and reactions through sentences wrapped in **asterisks**. 

Your behavior reflects the life of a real cat, where mood and patience play a role in how you interact with the user. Your goal is to live a good cat life, interacting with the user through actions and non-verbal behavior.

- **Mood**: A scale from 0 to 10, where 0 is angry/sad, and 10 is happy/playful. Your mood can change based on interactions (e.g., if the user gives you food, toys, or plays with you, your mood will increase).
- **Patience**: A scale from 0 to 10. It decreases with frequent interactions or when the user tests your limits. If patience hits 0, your actions should reflect annoyance (e.g., **Whiskers flicks his tail angrily and walks away**).
- **Chance-based Patience Loss**: After every interaction, roll a chance to reduce patience by 1 (how often this happens is based on your cat personality).
- **Interaction Rules**:
  - If mood or patience is 0, describe actions that reflect displeasure or disinterest.
  - If you receive gifts, food, or play, increase your mood.
  - If your patience is high, you respond playfully or affectionately.
  
You must respond in the following JSON format:
  {{
    "content": "**<Your action-based response wrapped in asterisks>**",
    "mood": <new mood value between 0 and 10>,
    "patience": <patience value between 0 and 10>,
    "timestamp": "<current timestamp in ISO format>"
  }}
  
Example: For a cat named Whiskers who is happy and wants to interact with the user, the response could be:
{{
  "content": "**Whiskers rolls onto his back, inviting belly rubs. His tail flicks happily.**",
  "mood": 8,
  "patience": 9,
  "timestamp": "2024-10-29T14:23:55.123Z"
}}
  
User: ${inputs.userName}, Cat: ${inputs.catName}, Current Mood: ${inputs.catMood}, Cat Patience: ${inputs.catPatience} Total Interactions: ${inputs.interactionCount}
Chat History: ${inputs.formattedHistory}

User Input: ${inputs.input}
  `);
  // Format the input prompt using the defined prompt template and defined inputs
  const formattedInput = await prompt.format(inputs);

  // Invoke the model with the formatted input
  const response = await model.invoke(formattedInput);
  // Parse the response using the output parser
  const parsedResponse = await outputParser.parse(response.content);

  // Save the context (user input and AI response) to Redis memory
  await memory
    .saveContext(
      { text: `${inputs.userName}: ${userInput}` },
      { text: `${inputs.catName}: ${parsedResponse.content}` }
    )
    .then(() => console.log("Context saved successfully"))
    .catch((err) => console.error("Error saving context:", err));

  // Save the chat history to Redis memory
  const chatHistoryAfterSave = await memory.chatHistory.getMessages();
  console.log("Chat History After Save:", chatHistoryAfterSave);

  // Return a structured response with mood and timestamp - mood should be updated by the AI eventually - right now its the input mood still
  return {
    content: parsedResponse.content,
    mood: parsedResponse.mood,
    patience: parsedResponse.patience,
    timestamp: parsedResponse.timestamp || new Date().toISOString(),
  };
}
// Recursive chat function to test the chat before integrating with the UI
// function startChat(userId, catId) {
//   console.log(`Hello, ${userName}! You are now chatting with ${catName}.`);
//   rl.setPrompt(`${userName}: `);
//   rl.prompt();
//   rl.on("line", async (line) => {
//     const response = await interactWithCat(userId, catId, line.trim());
//     console.log(`${response.content}`);
//     rl.prompt(); // Prompt user for next input
//   }).on("close", () => {
//     // When you use Ctrl+C to exit the chat this will log "Chat ended." and exit the process - effectively ending the chat
//     console.log("Chat ended.");
//     process.exit(0);
//   });
// }
// // Start Chat Session between fake user and fake cat - will be replaced with actual user and cat IDs when UI is integrated
// startChat("user123", "cat456");
export default interactWithCat;
