import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import {findOrCreate} from "../helpers/database.js";

export const configurePassport = () => {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['read:org', 'repo', 'user'],
    session: false
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const data = {
        githubId: profile.id,
        accessToken,
        displayName: profile.displayName,
        username: profile.username,
        email: profile.emails.shift()?.value,
        profileUrl: profile._json.url,
        avatarUrl: profile._json.avatar_url,
      }

      const user = await findOrCreate(User, { githubId: profile.id }, data);

      done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

}
