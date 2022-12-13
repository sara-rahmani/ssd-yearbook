const express = require("express");
const userRouter = express.Router();
const fs = require("fs").promises;

const UserController = require("../controllers/UserController");
userRouter.get("/", UserController.Index);

userRouter.get("/register", UserController.Register);
userRouter.post("/register", UserController.RegisterUser);

userRouter.get("/register/:id", UserController.Edit);
userRouter.post("/register/:id", UserController.EditProfile);

userRouter.get("/login", UserController.Login);
userRouter.post("/login", UserController.LoginUser);

userRouter.get("/logout", UserController.Logout);

userRouter.get("/:id", UserController.Detail);

userRouter.get("/:id/delete", UserController.DeleteUserById);

module.exports = userRouter;
