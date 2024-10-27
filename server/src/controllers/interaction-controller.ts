import { Request, Response } from "express";
import { Interaction, Cat, User } from "../models/index.js";
import { format } from "date-fns";
import { getUser } from "./user-controller.js";

// GET /interactions - get all types of interactions, include the cat's name, and the user that made that interaction

const interactionCost = {
  play: 10,
  feed: 20,
  gift: 30,
};

export const getAllInteractions = async (_req: Request, res: Response) => {
  try {
    const interactions = await Interaction.findAll({
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["username"],
        },
        {
          model: Cat,
          as: "cat",
          attributes: ["name"],
        },
      ],
      order: ["interactionDate"],
    });
    res.status(200).json(interactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /interactions/:id - get a single interaction by id. not sure if we would use this at any point tbh
export const getInteractionById = async (req: Request, res: Response) => {
  try {
    const interaction = await Interaction.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["username"],
        },
        {
          model: Cat,
          as: "cat",
          attributes: ["name"],
        },
      ],
    });
    if (!interaction) {
      res.status(404).json("Interaction not found");
    } else {
      res.status(200).json(interaction);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST- /:catId/ - commit an interaction on a certain cat
export const createInteraction = async (req: Request, res: Response) => {
  // interactionType should only be in one of the keys in interactionCost and description should be of type string. Typescript wouldnt want to have any other way.

  const { interactionType, description } = req.body as {
    interactionType: keyof typeof interactionCost;
    description: string;
  };
  const catId = Number(req.params.catId); // Convert catId from string to number
  const userId = req.user?.id; // Get userId from the logged-in user (from JWT middleware)
  if (isNaN(catId) || userId === undefined) {
    res.status(400).json({ message: "Invalid or not found cat or user Id" }); // Handle invalid catId
  }

  try {
    const interaction = await Interaction.create({
      interactionType,
      interactionDate: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      catId, // Log the interaction for this specific cat
      userId, // Log which user is interacting
      description,
    });
    // retrieve user to update yarn
    const user = await getUser(interaction.userId);
    if (interaction.interactionType in interactionCost && user) {
      user.yarn -= interactionCost[interactionType];
      await user.save();
    }
    // send back the interaction response
    res.status(201).json(interaction); // Respond with the logged interaction
  } catch (error) {
    res.status(500).json({ error: "Failed to log interaction" });
  }
};

// GET -/interactions/lastfive/:catId
export const getLast5Interactions = async (req: Request, res: Response) => {
  try {
    const catId = Number(req.params.catId);
    const userId = req.user?.id;
    const fiveInteractions = await Interaction.findAll({
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["username"],
        },
        {
          model: Cat,
          as: "cat",
          attributes: ["name"],
        },
      ],
      where: { catId, userId },
      attributes: ["interactionType", "interactionDate"],
      order: ["interactionDate"],
      limit: 5,
    });
    if (fiveInteractions.length < 5 && fiveInteractions.length > 0) {
      res.status(200).json(fiveInteractions);
    } else {
      res.status(404).json("No interactions were found, feed your cat already");
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// no PUT request needed. I dont think we would be updating an interaction once it's made. at leats it doesnt make sense to me.

// no DELETE request needed, because I dont think it's reasonable to delete an interaction once it's made.
