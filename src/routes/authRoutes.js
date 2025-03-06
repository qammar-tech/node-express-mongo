import express from 'express';
import { githubAuth, githubCallback } from '../controllers/authController.js';
import passport from "passport";

const router = express.Router();

router.get('/auth/github', githubAuth);
router.get('/auth/github/callback',
  passport.authenticate("github", { failureRedirect: "/" }),
  githubCallback);

export default router;
