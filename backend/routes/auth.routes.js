import express from "express";
import { login, logout, signup, verifyEmail, forgotPassword, resetPawssord } from "../controllers/auth.controller.js";

const router = express.Router();

// https://localhost:3000/api/auth/login
router.post("/login", login);

// https://localhost:3000/api/auth/signup
router.post("/signup", signup);

// https://localhost:3000/api/auth/logout
router.post("/logout", logout);

// https://localhost:3000/api/auth/verifyEmail
router.post("/verifyEmail", verifyEmail)

// https://localhost:3000/api/auth/password-recovery
router.post("/password-recovery", forgotPassword)

// https://localhost:3000/api/auth/reset-password/:token
router.post("/reset-password/:token", resetPawssord)

export default router;