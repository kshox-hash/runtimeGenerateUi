import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import DB from "../db/db_configuration";
import { OAuth2Client } from "google-auth-library";

export async function loginUser(email: string, password: string) {
  const pool = DB.getPool();

  const result = await pool.query(
    `
    select id, email, password
    from users
    where lower(email) = lower($1)
    limit 1
    `,
    [email]
  );

  if (result.rowCount === 0) {
    throw new Error("Usuario no existe");
  }

  const user = result.rows[0];

  if (!user.password) {
    throw new Error("Credenciales inválidas");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Credenciales inválidas");
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

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function loginWithGoogle(idToken: string) {

  //get 
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Token de Google inválido");
  }

  const email = payload.email;
  const name = payload.name;
  const picture = payload.picture;

  if (!email) {
    throw new Error("Google no devolvió correo");
  }

  const pool = DB.getPool();

  let result = await pool.query(
    `
    select id, email
    from users
    where lower(email) = lower($1)
    limit 1
    `,
    [email]
  );

  let user = result.rows[0];

  if (!user) {
    result = await pool.query(
      `
      insert into users (email, password)
      values ($1, $2)
      returning id, email
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

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name,
      picture,
    },
  };
}