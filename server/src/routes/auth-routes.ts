import { Router, Request, Response } from "express";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// login function
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body;
    console.log({ username });
    console.log({ password });
    const user = await User.findOne({
      where: { username },
    });
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Authentication Failed" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log(password);
      console.log(user.password);
      return res.status(401).json({ message: "Authentication Failed" });
    }

    const secretKey = process.env.JWT_SECRET_KEY || "";
    if (!secretKey) {
      return res.status(500).json({ message: "JWT Secret key not configured" });
    }

    const token = jwt.sign(
      { username: user.username, id: user.id },
      secretKey,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

// signup function
export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    // extract username, password, and other required fields from req.body
    const { username, email, password, bio } = req.body;
    // check if a user with the given email already exists in the database
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res
        .status(409)
        .json("User already exists with that email address");
    }
    // create a new user record in the database
    const newUser = await User.create({
      username,
      email,
      password,
      bio,
      userRole: "standard",
      yarn: 200,
      lastLoginDate: new Date(),
    });

    // generate a JWT token for the user for auto-login after signup -- for greg's sake
    const secretKey = process.env.JWT_SECRET_KEY || "";
    if (!secretKey) {
      return res.status(500).json({ message: "JWT Secret key not configured" });
    }

    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

    return res.status(201).json({
      message: "Account has been created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        userRole: newUser.userRole,
        yarn: newUser.yarn,
        lastLoginDate: newUser.lastLoginDate,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json("Error creating new user");
  }
};

const router = Router();

router.post("/login", login);
router.post("/signup", signup);

export default router;
