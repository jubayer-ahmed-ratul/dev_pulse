
import express, {
  type Application,
  type Request,
  type Response,
} from "express";


import { userRoute } from "./modules/user/user.routes";
import { authRoute } from "./modules/auth/auth.route";
import { issueroute } from "./modules/issues/issue.routes";
import logger from "./middlewire/logger";
const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use(logger)

app.get("/", (req: Request, res: Response) => {
  //   res.send('dev pulse server is running')
  res.status(200).json({
    message: "server is running",
    author: "jubayer",
  });
});



//USERS
app.use("/api/users", userRoute);

//ISSUES RELATED APIS

app.use("/api/issues", issueroute);

//AUTH
app.use("/api/auth",authRoute)






export default app;
