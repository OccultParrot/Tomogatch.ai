import { Request, Response } from "express";
import { Interaction, Cat, User } from "../models/index.js";
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
      interactionDate: new Date().toISOString(),
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

// GET -/interactions/lastfive/:catId?userId=userId - get the last 5 interactions on a certain cat
export const getLast5Interactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // console.log("query", req.query, "params", req.params);
    const catId = Number(req.query.catId);
    const userId = Number(req.query.userId); // Extracted from query now

    // Validate the parameters
    if (isNaN(catId) || isNaN(userId)) {
      res.status(400).json({ message: "Invalid cat or user ID." });
      return;
    }

    const fiveInteractions = await Interaction.findAll({
      include: [
        { model: User, as: "owner", attributes: ["username"] },
        { model: Cat, as: "cat", attributes: ["name"] },
      ],
      where: { catId, userId },
      attributes: ["interactionType", "interactionDate"],
      order: [["interactionDate", "DESC"]],
      limit: 5,
    });

    if (fiveInteractions.length > 0) {
      console.log("Last 5 interactions:", fiveInteractions);
      res.status(200).json(fiveInteractions);
    } else {
      res.status(404).json({ message: "No interactions found for this cat." });
    }
  } catch (error: any) {
    console.error("Error fetching interactions:", error);
    res.status(500).json({ message: error.message });
  }
};

// no PUT request needed. I dont think we would be updating an interaction once it's made. at leats it doesnt make sense to me.

// no DELETE request needed, because I dont think it's reasonable to delete an interaction once it's made.

// These can be modified to get all the interactions instead if that is better for the logic, but for now they are returning the last
// interaction of a certain type for a certain cat.
// GET -/interactions/feed/:catId?userId=userId
export const getFeedInteraction = async (req: Request, res: Response) => {
  try {
    const catId = Number(req.query.catId);
    const userId = Number(req.query.userId);

    if (isNaN(catId) || isNaN(userId)) {
      res.status(400).json({ message: "Invalid cat or user ID." });
      return;
    }

    const feedInteractions = await Interaction.findAll({
      where: { catId, userId, interactionType: "feed" },
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
      order: [["interactionDate", "DESC"]],
      limit: 1,
    });

    if (feedInteractions.length > 0) {
      res.status(200).json(feedInteractions[0]);
    } else {
      res
        .status(404)
        .json({ message: "No feed interactions found for this cat." });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET -/interactions/play/:catId?userId=userId
export const getPlayInteraction = async (req: Request, res: Response) => {
  try {
    const catId = Number(req.query.catId);
    const userId = Number(req.query.userId);

    if (isNaN(catId) || isNaN(userId)) {
      res.status(400).json({ message: "Invalid cat or user ID." });
      return;
    }

    const playInteractions = await Interaction.findAll({
      where: { catId, userId, interactionType: "play" },
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
      order: [["interactionDate", "DESC"]],
      limit: 1,
    });

    if (playInteractions.length > 0) {
      res.status(200).json(playInteractions[0]);
    } else {
      res
        .status(404)
        .json({ message: "No play interactions found for this cat." });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET -/interactions/gift/:catId?userId=userId
export const getGiftInteraction = async (req: Request, res: Response) => {
  try {
    const catId = Number(req.query.catId);
    const userId = Number(req.query.userId);

    if (isNaN(catId) || isNaN(userId)) {
      res.status(400).json({ message: "Invalid cat or user ID." });
      return;
    }

    const giftInteractions = await Interaction.findAll({
      where: { catId, userId, interactionType: "gift" },
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
      order: [["interactionDate", "DESC"]],
      limit: 1,
    });

    if (giftInteractions.length > 0) {
      res.status(200).json(giftInteractions[0]);
    } else {
      res
        .status(404)
        .json({ message: "No gift interactions found for this cat." });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
