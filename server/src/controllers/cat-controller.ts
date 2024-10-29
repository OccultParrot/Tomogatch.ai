import { Request, Response } from "express";
import { Cat, User } from "../models/index.js";

// GET /cats - get all cats and include the owner's username in the table
export const getAllCats = async (_req: Request, res: Response) => {
  try {
    const cats = await Cat.findAll({
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["username"], // when fetching cats, include the owner's username
        },
      ],
    });
    res.status(200).json(cats);
    console.log(cats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /cats/:id
export const getCatById = async (req: Request, res: Response) => {
  try {
    const cat = await Cat.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["username"], // include the owner's username attribute when fetching the specific cat
        },
      ],
    });
    if (!cat) {
      res.status(404).json({ message: "Cat not found" });
    } else {
      res.status(200).json(cat);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /cats - create a cat, not sure if we're going to need this
export const createCat = async (req: Request, res: Response) => {
  try {
    const {
      name,
      avatar,
      skin,
      personality,
      mood,
      deathFlag,
      isAlive,
      userId,
    } = req.body;
    const cat = await Cat.create({
      name,
      skin,
      avatar,
      personality,
      mood,
      deathFlag,
      isAlive,
      userId,
    });
    // Once the cat is created, we need to update the list of cats in the UI
    console.log("Cat created successfully!", cat);
    // I THINK the only place the call will be made will be from the home page
    // So we can send back the updated list of cats to use as the new state to update the UI
    const updatedCats = await Cat.findAll({ where: { userId } });
    // return the updated list of cats that the Home page is awaiting now
    res.status(201).json(updatedCats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /cats/:id - update a cat by id
export const updateCat = async (req: Request, res: Response) => {
  try {
    const {
      name,
      skin,
      avatar,
      personality,
      mood,
      deathFlag,
      isAlive,
      userId,
    } = req.body;
    const cat = await Cat.findByPk(req.params.id);
    if (!cat) {
      res.status(404).json({ message: "Cat not found" });
    } else {
      cat.name = name;
      cat.avatar = avatar;
      cat.skin = skin;
      cat.personality = personality;
      (cat.mood = mood), (cat.deathFlag = deathFlag);
      cat.isAlive = isAlive;
      cat.userId = userId;
      await cat.save();
      res.status(201).json(cat);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /cats/:id - delete a cat by id
export const deleteCat = async (req: Request, res: Response) => {
  try {
    const cat = await Cat.findByPk(req.params.id);
    if (!cat) {
      res.status(404).json({ message: "Cat not found" });
    } else {
      await cat.destroy();
      res.status(201).json({ message: "Cat has been deleted" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
