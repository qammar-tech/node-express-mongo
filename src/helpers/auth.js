import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const validateUser = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SESSION_SECRET, async (err, decoded) => {
      if (err) {
        return resolve(false)
      }
      const user = await User.findOne({id: decoded.id});
      return resolve(user);
    });
  })
}
