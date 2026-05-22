import { pool } from "../../db";

const createUserIntoDB = async (payload: any) => {
  const { name, email, password } = payload;

  const result = await pool.query(
    `
        INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING*
        `,
    [name, email, password],
  );
  return result;
};


const getusersfromDB=async()=>{
    const result = await pool.query(`
            SELECT * FROM users
            `);
            return result
}

const getSingleuserfromDB=async(id:string)=>{
    const result = await pool.query(
      `
      SELECT * FROM users WHERE id=$1

`,
      [id],
    );
    return result
}


export const userService = {
  createUserIntoDB,getusersfromDB,getSingleuserfromDB
};
