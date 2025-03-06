import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from "cors";
import passport from 'passport';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from "./routes/publicRoutes.js";
import {configurePassport} from "./config/passport.js";
import session from "express-session";
import connectDB from "./helpers/connection.js";
import apiRoutes from "./routes/apiRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(authRoutes);
app.use(publicRoutes);
app.use(apiRoutes);

configurePassport();

const PORT = process.env.PORT || 3000;

connectDB().then(() => (
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
  })
)).catch(err => console.error(err));
