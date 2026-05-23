import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import { userRoute } from "./modules/user/user.routes";
import { authRoute } from "./modules/auth/auth.route";
import { issueroute } from "./modules/issues/issue.routes";
import logger from "./middlewire/logger";
import errorHandler from "./middlewire/errorHandler";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use(logger);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "server is running",
    author: "jubayer",
  });
});

// USERS
app.use("/api/users", userRoute);

// ISSUES
app.use("/api/issues", issueroute);

// AUTH
app.use("/api/auth", authRoute);

// GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;
