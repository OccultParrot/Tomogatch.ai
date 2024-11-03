import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserCats,
  catsOwnedByUser,
  getUserCreatedAt,
  getAdoptableCats,
  updateUserBio,
  updateUserPassword,
  updateUserUsername,
  getLastLogin,
  updateLastLogin,
} from "../../controllers/user-controller.js";

const router = express.Router();

// GET /users - get all users
router.get("/", getAllUsers);

// GET /users/cats -get the cats for a single user
router.get("/adoptedcats", getUserCats);

// GET /users/adoptablecats - get all cats that are not adopted
router.get("/adoptablecats", getAdoptableCats);

// GET /users/:id - get user by id
router.get("/:id", getUserById);

// POST /users - create a new user
router.post("/", createUser);

//PUT /users/:id - update a user by id
router.put("/:id", updateUser);

//DELETE /users/:id - delete a user by id
router.delete("/:id", deleteUser);

// number of cats owned by the user
router.get("/:id/cats", catsOwnedByUser);

// get /users/:userId/createdAt
router.get("/:id/createdat", getUserCreatedAt);

// put /users/:userId/username -update user username
router.put("/:id/username", updateUserUsername);

// put /users/:userId/password -update user password
router.put("/:id/password", updateUserPassword);

// put /users/:userId/bio -update user bio
router.put("/:id/bio", updateUserBio);

// get /users/:userId/lastLogin
router.get("/:id/lastLogin", getLastLogin);

// PUT /users/:id/lastLogin
router.put("/:id/lastLogin", updateLastLogin);

export { router as userRouter };
