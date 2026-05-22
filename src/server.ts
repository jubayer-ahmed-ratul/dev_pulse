import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import dotenv from "dotenv"
dotenv.config();
import { Pool } from "pg";
const app: Application = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL,
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

app.post("/", async (req: Request, res: Response) => {
  // console.log(req.body);
  const { name, email, password } = req.body;
  res.status(201).json({
    message: "user is created",
    data: {
      name,
      email,
    },
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
