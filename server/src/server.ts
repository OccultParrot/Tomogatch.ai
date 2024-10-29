import sequelize from "./config/connection.js";
import express from "express";
import routes from "./routes/index.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const forceDatabaseRefresh = false;
const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files before routes and middleware
const buildPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(buildPath));

// Allow cross-origin requests from Vite (development mode)
app.use(
  cors({
    origin: "http://localhost:5173", // Adjusted for Vite dev server
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register your routes (auth and API)
app.use(routes);

// Catch-all handler to serve React for non-API routes
app.get("*", (_req, res) => {
  res.sendFile(path.resolve(buildPath, "index.html"));
});

// Start the server and sync the database
sequelize
  .sync({ force: forceDatabaseRefresh })
  .then(() => {
    console.log("Connected to the catgpt database successfully");
    app.listen(PORT, () => {
      console.log(`Server is listening on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error syncing the database: ", error);
  });
