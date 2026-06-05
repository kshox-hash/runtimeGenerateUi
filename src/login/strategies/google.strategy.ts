import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import DB from "../../db/db_configuration";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const picture = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error("Google no devolvió correo"));
        }

        const pool = DB.getPool();

        let result = await pool.query(
          `
          SELECT id, email
          FROM users
          WHERE lower(email) = lower($1)
          LIMIT 1
          `,
          [email]
        );

        let user = result.rows[0];

        if (!user) {
          result = await pool.query(
            `
            INSERT INTO users (
              email,
              password
            )
            VALUES (
              $1,
              $2
            )
            RETURNING id, email
            `,
            [email, null]
          );

          user = result.rows[0];
        }

        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
          },
          process.env.JWT_SECRET as string,
          {
            expiresIn: "7d",
          }
        );

        return done(null, {
          token,
          user: {
            id: user.id,
            email: user.email,
            name,
            picture,
          },
        });
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export {};