import { validateUser } from "./auth.js";

export const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const user = await validateUser(token);

  if (!user) {
    return res.status(401).send("Unauthorized");
  }

  req.user = user;
  next();
};
