import config from "./config";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
const port=config.port;

import { Pool } from "pg";
const app: Application = express();


app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: config.connection_string,
});

const initDB = async () => {
  try {
    await pool.query(`

    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(20) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'contributor',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )
            
            `);
    console.log("database connected successfully");
  } catch (error) {
    console.log(error);
  }
};
initDB();

app.get("/", (req: Request, res: Response) => {
  //   res.send('dev pulse server is running')
  res.status(200).json({
    message: "server is running",
    author: "jubayer",
  });
});

//ADD USER (POST)

app.post("/api/auth/signup", async (req: Request, res: Response) => {
  // console.log(req.body);
  const { name, email, password } = req.body;

  try {
    const result = await pool.query(
      `
        INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING*
        `,
      [name, email, password],
    );
    //  console.log(result);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
});

//GETTING ALL USERS
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
            SELECT * FROM users
            `);
    res.status(200).json({
      success: true,
      message: "Users retrived successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
});

//GETTING single USERS
app.get("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
//   console.log(id);

  try {
    const result = await pool.query(
      `
      SELECT * FROM users WHERE id=$1

`,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "user not found",
        data: null,
      });

     
    }
     return res.status(200).json({
        success: true,
        message: "user retrived",
        data: result.rows[0],
      });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
