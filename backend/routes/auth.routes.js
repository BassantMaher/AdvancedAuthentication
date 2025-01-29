import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";

const router = express.Router();

// https://localhost:3000/api/auth/login
router.post("/login",login);

// https://localhost:3000/api/auth/signup
router.post("/signup",signup);

// https://localhost:3000/api/auth/logout
router.post("/logout",logout);

export default router;