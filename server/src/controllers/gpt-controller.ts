// import { type Request, type Response } from "express";
// import { ChatOpenAI } from "@langchain/openai";
// import { createPromptTemplate } from "../templates/customPromptTemplate.js";
// import dotenv from "dotenv";
// import {
//   GPTStructuredResponse,
//   UserChatRequest,
//   CatProfile,
// } from "../interfaces/gpt-interfaces";

// // import models for database operations so we can test the chat interactions - prolly change this to use sequelize endpoints
// // import { User } from "../models/user.js";
// import { Cat } from "../models/cat.js";
// import { Interaction } from "../models/interaction.js";

// dotenv.config();

// // Initialize the OpenAI model
// const apiKey = process.env.OPENAI_API_KEY;
// let model: ChatOpenAI;

// if (apiKey) {
//   model = new ChatOpenAI({
//     temperature: 0,
//     openAIApiKey: apiKey,
//     modelName: "gpt-3.5-turbo",
//   });
// } else {
//   console.error("OPENAI_API_KEY is not configured.");
// }

// // Function to fetch relevant data from the database - disabled until DB is seeded
// // async function fetchDataForPrompt(userId: number, catId: string) {
// //   try {
// //     const user = await User.findByPk(userId);
// //     const cat = await Cat.findByPk(catId);
// //     const recentInteractions = await Interaction.findAll({
// //       where: { catId },
// //       order: [["interactionDate", "DESC"]],
// //       limit: 5,
// //     });

// //     if (!user || !cat) throw new Error("User or Cat not found.");
// //     return { user, cat, recentInteractions };
// //   } catch (error) {
// //     console.error("Error fetching data for prompt:", error);
// //     throw error;
// //   }
// // }

// // Chat Template - Format the chat prompt with the user's input and cat's data
// // Create the prompt using the custom template
// async function formatChatPrompt(
//   userChat: string,
//   cat: CatProfile,
//   interactions: Interaction[]
// ): Promise<string> {
//   const interactionHistory = interactions
//     .map(
//       (interaction) =>
//         `${interaction.interactionType} on ${new Date(
//           interaction.interactionDate
//         ).toISOString()}`
//     )
//     .join(", ");

//   return createPromptTemplate({
//     catName: cat.name,
//     personality: cat.personality,
//     mood: cat.mood.toString(),
//     interactionHistory,
//     userChat,
//   });
// }

// // Call GPT and safely handle the response - cannot be a string, as it is a
// // structured AIMessage object, so we need to parse its content
// async function callGPT(prompt: string): Promise<GPTStructuredResponse> {
//   try {
//     const response = await model.invoke(prompt);

//     // Safely extract the content if it exists
//     if (response && typeof response.content === "string") {
//       // Clean up the response content
//       // Remove code block markers & Markdown code block markers
//       const cleanedContent = response.content
//         .replace(/```json|```/g, "")
//         .trim(); // Trim any extra spaces

//       return JSON.parse(cleanedContent); // Parse the string content into JSON
//     } else {
//       console.warn("Invalid response format from OpenAI:", response);
//       throw new Error("Unexpected response format.");
//     }
//   } catch (error) {
//     console.error("Error invoking the OpenAI API:", error);
//     throw new Error("Failed to get a valid response from the OpenAI API.");
//   }
// }

// // Function to save the interaction to the database
// // Creates a new Interaction record and updates the cat's mood if needed
// const MOCK_DATA = true; // For testing only - once db is seeded, set to false / remove

// async function saveInteraction(
//   userId: number,
//   catId: number,
//   summary: string,
//   interactionType: "play" | "gift" | "feed",
//   newMood?: number
// ) {
//   try {
//     if (MOCK_DATA) {
//       console.log("Mock Mode: Skipping interaction saving.");
//       console.log({
//         userId,
//         catId,
//         summary,
//         interactionType,
//         newMood,
//       });
//       return; // Exit early in mock mode
//     }

//     // Create a new Interaction record in the database when MOCK_DATA is false
//     await Interaction.create({
//       userId,
//       catId,
//       interactionType,
//       description: summary,
//       interactionDate: new Date().toISOString(),
//     });

//     // If new mood is included, update the cat's mood - not implemented yet
//     if (newMood !== undefined) {
//       await Cat.update({ mood: newMood }, { where: { id: catId } });
//     }
//   } catch (error) {
//     console.error("Error saving interaction:", error);
//     throw error;
//   }
// }

// // Main route handler to manage chat interactions
// export const chatWithCat = async (
//   // No Url Params, No Query Params, Request Body is a UserChatRequest
//   req: Request<{}, {}, UserChatRequest>,
//   res: Response
// ) => {
//   // Extract the userChat, userId, and catId from the request body
//   const { userChat, userId, catId } = req.body;

//   try {
//     // Fetch the user, cat, and recent interactions from the database
//     // const { user, cat, recentInteractions } = await fetchDataForPrompt(
//     //   userId,
//     //   catId
//     // );

//     // TEMPOARY MOCK DATA - THE ABOVE FUNCTION WILL BE USED OR ADJUSTED TO USE SEQUELIZE ENDPOINTS INSTEAD
//     const { user, cat, recentInteractions } = {
//       user: {
//         id: 1,
//         username: "testuser",
//         password: "password123",
//         email: "testuser@example.com",
//         userRole: "standard",
//         bio: "This is a test user.",
//         yarn: 100,
//       },
//       cat: {
//         id: 1,
//         name: "Whiskers",
//         skin: "Tabby",
//         personality: "Playful",
//         mood: 5,
//         deathFlag: 0,
//         isAlive: true,
//         userId: 1,
//       },
//       recentInteractions: <Interaction[]>(<unknown>[
//         {
//           interactionType: "play",
//           interactionDate: new Date(),
//           description: "Test Description",
//           userId: 1,
//           catId: 1,
//         },
//         {
//           interactionType: "feed",
//           interactionDate: new Date(),
//           description: "Fed the cat some tuna",
//           userId: 1,
//           catId: 1,
//         },
//         {
//           interactionType: "gift",
//           interactionDate: new Date(),
//           description: "Gave the cat a new toy mouse",
//           userId: 1,
//           catId: 1,
//         },
//         {
//           interactionType: "play",
//           interactionDate: new Date(),
//           description: "Played with a laser pointer",
//           userId: 1,
//           catId: 1,
//         },
//         {
//           interactionType: "feed",
//           interactionDate: new Date(),
//           description: "Gave the cat some milk",
//           userId: 1,
//           catId: 1,
//         },
//       ]),
//     };
//     console.log("user", user);
//     // console.log("cat", cat);
//     // console.log("recentInteractions", recentInteractions);

//     // Format the chat prompt with the user's input and cat's data
//     const formattedPrompt = await formatChatPrompt(
//       userChat,
//       cat,
//       recentInteractions
//     );
//     const gptResponse = await callGPT(formattedPrompt);

//     // Function to save the interaction to the database
//     await saveInteraction(
//       userId,
//       catId,
//       gptResponse.summary,
//       "play",
//       gptResponse.newMood
//     );

//     res.json({
//       userChat,
//       conversation: gptResponse.conversation,
//     });
//   } catch (error) {
//     console.error("Error in chatWithCat handler:", error);
//     res
//       .status(500)
//       .json({ error: "Internal Server Error. Please try again later." });
//   }
// };

// export default chatWithCat;
