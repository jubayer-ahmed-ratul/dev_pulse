
import express, {
  type Application,
  type Request,
  type Response,
} from "express";


import { userRoute } from "./modules/user/user.routes";
import { authRoute } from "./modules/auth/auth.route";
const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  //   res.send('dev pulse server is running')
  res.status(200).json({
    message: "server is running",
    author: "jubayer",
  });
});

//ADD USER (POST)
app.use("/api/auth/signup", userRoute);

//GETTING ALL USERS
app.get("/api/users", userRoute);

//GETTING single USERS
app.get("/api/users/:id", userRoute);

//LOGIN USER
app.use("/api/auth",authRoute)

export default app;
