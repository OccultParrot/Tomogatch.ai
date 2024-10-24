import { User } from "../models/index.js";
import bcrypt from "bcrypt";

export const seedUsers = async () => {
  await User.bulkCreate([
    {
      username: "johndoe",
      password: await bcrypt.hash("password", 10),
      email: "john.doe@example.com",
      userRole: "standard user",
      bio: "Love cats, and aspiring cat whisperer.",
      yarn: 500,
    },
    {
      username: "janedoe",
      password: await bcrypt.hash("password", 10),
      email: "jane.doe@example.com",
      userRole: "admin",
      bio: "Admin of the CatGPT universe.",
      yarn: 1000,
    },
    {
      username: "catlover99",
      password: await bcrypt.hash("password", 10),
      email: "cat.lover99@example.com",
      userRole: "standard user",
      bio: "Cant stop adopting cats!",
      yarn: 700,
    },
  ]);
};
