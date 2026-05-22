import bcrypt from "bcryptjs"
import { pool } from "../../db";
import type { typeofUser } from "./user.interface";

const createUserIntoDB = async (payload: typeofUser) => {
  const { name, email, password } = payload;
  const hasPassword= await bcrypt.hash(password,10);

  const result = await pool.query(
    `
        INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING*
        `,
    [name, email, hasPassword],
  );
  delete result.rows[0].password;
 
  return result;
};

const getusersfromDB = async () => {
  const result = await pool.query(`
            SELECT * FROM users
            `);
  return result;
};

const getSingleuserfromDB = async (id: string) => {
  const result = await pool.query(
    `
      SELECT * FROM users WHERE id=$1

`,
    [id],
  );
  return result;
};

export const userService = {
  createUserIntoDB,
  getusersfromDB,
  getSingleuserfromDB,
};
