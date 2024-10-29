// import { seedUsers } from "./user-seeds.js";
import { seedCats } from "./cat-seeds.js";
// import { seedInteractions } from "./interaction-seeds.js";
import sequelize from "../config/connection.js";

const seedAll = async (): Promise<void> => {
  try {
    // sync the database
    await sequelize.sync({ force: true });
    console.log("\n----- DATABASE SYNCED -----\n");

    // seed the users table
    // await seedUsers();
    // console.log("\n----- USERS SEEDED -----\n");

    // seed the cats table
    await seedCats();
    console.log("\n----- CATS SEEDED -----\n");

    // seed the interactions table
    // await seedInteractions();
    // console.log("\n----- INTERACTIONS SEEDED -----\n");

    // exit with code 0 once all is seeded
    process.exit(0);
  } catch (error) {
    console.log("Error seeding the database", error);
    process.exit(1);
  }
};

seedAll();
