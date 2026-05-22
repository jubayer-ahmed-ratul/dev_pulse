import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt from "jsonwebtoken";
import config from "../../config";

const loginuserintoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email =$1

        `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("invalid credentials!");
  }
  const user = userData.rows[0];

  const matchPassword = await bcrypt.compare(password, user.password);
  //  console.log(matchPassword);
  if (!matchPassword) {
    throw new Error("invalid credentials!");
  }

  const jwtpayload = {
    id: user.id,
    name: user.name,
    role:user.role
  };
  const token = jwt.sign(jwtpayload, config.secret as string, {
    expiresIn: "1d",
  });
  return { token,
    user:{
        id:user.id,
        name:user.name,
        email:user.email,
        role:user.role,
        created_at:user.created_at,
        updated_at:user.updated_at,
    },
   };
  // console.log(user);
};

export const authService = {
  loginuserintoDB,
};
