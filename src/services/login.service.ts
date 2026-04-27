import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import DB from "../db/db_configuration";

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
    throw new Error("Credenciales inválidas");
  }

  const user = result.rows[0];

  // 🔐 comparar hash
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