import passport from "passport";
import { fetchOrganizations } from "../services/githubSyncService.js";
import jwt from "jsonwebtoken";

export const githubAuth = passport.authenticate("github", { session: false });

export const githubCallback = async (req, res) => {
  const { user } = req;

  await fetchOrganizations(user);

  const token = jwt.sign({ userId: user.id }, process.env.SESSION_SECRET, {
    expiresIn: "5d",
  });

  res.redirect(`${process.env.FRONTEND_URL}/authenticated?token=${token}`);
};
