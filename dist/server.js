
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    

// src/app.ts
import express from "express";

// src/modules/user/user.routes.ts
import { Router } from "express";

// src/modules/user/user.service.ts
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`

    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'contributor',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )
            
            `);
    await pool.query(`

      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title VARCHAR (150) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
      status VARCHAR(20) NOT NULL DEFAULT 'open'
      CHECK (status IN ('open', 'in_progress', 'resolved')),
      reporter_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW())


      `);
    console.log("database connected successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/user/user.service.ts
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hasPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
        INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,$4) RETURNING*
        `,
    [name, email, hasPassword, role ?? "contributor"]
  );
  delete result.rows[0].password;
  return result;
};
var getusersfromDB = async () => {
  const result = await pool.query(`
            SELECT id, name, email, role, created_at, updated_at FROM users
            `);
  return result;
};
var getSingleuserfromDB = async (id) => {
  const result = await pool.query(
    `
      SELECT id, name, email, role, created_at, updated_at FROM users WHERE id=$1
`,
    [id]
  );
  return result;
};
var userService = {
  createUserIntoDB,
  getusersfromDB,
  getSingleuserfromDB
};

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllusers = async (req, res) => {
  try {
    const result = await userService.getusersfromDB();
    res.status(200).json({
      success: true,
      message: "Users retrived successfully",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleuser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.getSingleuserfromDB(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "user not found",
        data: null
      });
    }
    return res.status(200).json({
      success: true,
      message: "user retrived",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser,
  getAllusers,
  getSingleuser
};

// src/modules/user/user.routes.ts
var router = Router();
router.post("/", userController.createUser);
router.get("/", userController.getAllusers);
router.get("/:id", userController.getSingleuser);
var userRoute = router;

// src/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";
var loginuserintoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email =$1

        `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("invalid credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("invalid credentials!");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const token = jwt.sign(jwtpayload, config_default.secret, {
    expiresIn: "1d"
  });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};
var authService = {
  loginuserintoDB
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginuserintoDB(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token: result.token,
        user: result.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser
};

// src/modules/auth/auth.route.ts
var router2 = Router2();
router2.post("/signup", userController.createUser);
router2.post("/login", authController.loginUser);
var authRoute = router2;

// src/modules/issues/issue.routes.ts
import { Router as Router3 } from "express";

// src/modules/issues/issue.service.ts
var createIssuesIntoDB = async (payload, reporter_id) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `INSERT INTO issues(title, description, type, reporter_id) VALUES($1,$2,$3,$4) RETURNING*`,
    [title, description, type, reporter_id]
  );
  return result;
};
var checkUserExists = async (id) => {
  const result = await pool.query(`SELECT id FROM users WHERE id=$1`, [id]);
  return result.rows.length > 0;
};
var GetIssuesfromDB = async (filters) => {
  const { sort, type, status } = filters;
  const values = [];
  const conditions = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderClause = sort === "oldest" ? "ORDER BY created_at ASC" : "ORDER BY created_at DESC";
  const result = await pool.query(
    `SELECT * FROM issues ${whereClause} ${orderClause}`,
    values
  );
  return result;
};
var getReportersByIds = async (ids) => {
  const result = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1::int[])`,
    [ids]
  );
  return result;
};
var getReporterById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [id]
  );
  return result;
};
var getSingleissuefromDB = async (id) => {
  const result = await pool.query(
    `SELECT * FROM issues WHERE id=$1`,
    [id]
  );
  return result;
};
var updateIssuefromDB = async (payload, id) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `UPDATE issues SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      updated_at = NOW()
    WHERE id=$4 RETURNING *`,
    [title, description, type, id]
  );
  return result;
};
var updateStatusInDB = async (id, status) => {
  const result = await pool.query(
    `UPDATE issues SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
    [status, id]
  );
  return result;
};
var deleteissuefromDB = async (id) => {
  const result = await pool.query(
    `DELETE FROM issues WHERE id=$1 RETURNING *`,
    [id]
  );
  return result;
};
var issueService = {
  createIssuesIntoDB,
  checkUserExists,
  GetIssuesfromDB,
  getReportersByIds,
  getReporterById,
  getSingleissuefromDB,
  updateIssuefromDB,
  updateStatusInDB,
  deleteissuefromDB
};

// src/modules/issues/issue.controller.ts
var createIssues = async (req, res) => {
  try {
    const reporter_id = req.user?.id;
    const userExists = await issueService.checkUserExists(reporter_id);
    if (!userExists) {
      res.status(404).json({
        success: false,
        message: "reporter user not found"
      });
      return;
    }
    const result = await issueService.createIssuesIntoDB(req.body, reporter_id);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getIssues = async (req, res) => {
  try {
    const sort = req.query["sort"];
    const type = req.query["type"];
    const status = req.query["status"];
    const issuesResult = await issueService.GetIssuesfromDB({ sort, type, status });
    const issues = issuesResult.rows;
    if (issues.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }
    const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
    const reportersResult = await issueService.getReportersByIds(reporterIds);
    const reporterMap = {};
    for (const r of reportersResult.rows) {
      reporterMap[r.id] = r;
    }
    const data = issues.map((issue) => {
      const { reporter_id, ...rest } = issue;
      return {
        ...rest,
        reporter: reporterMap[reporter_id] ?? null
      };
    });
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleissue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleissuefromDB(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "issue not found",
        data: null
      });
      return;
    }
    const issue = result.rows[0];
    const reporterResult = await issueService.getReporterById(issue.reporter_id);
    const { reporter_id, ...rest } = issue;
    res.status(200).json({
      success: true,
      data: {
        ...rest,
        reporter: reporterResult.rows[0] ?? null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user?.role;
  const userId = req.user?.id;
  try {
    if (userRole === "contributor") {
      const existing = await issueService.getSingleissuefromDB(id);
      if (existing.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "issue not found"
        });
        return;
      }
      const issue = existing.rows[0];
      if (issue.reporter_id !== userId) {
        res.status(403).json({
          success: false,
          message: "forbidden: you can only update your own issues"
        });
        return;
      }
      if (issue.status !== "open") {
        res.status(403).json({
          success: false,
          message: "forbidden: you can only update issues with open status"
        });
        return;
      }
    }
    const result = await issueService.updateIssuefromDB(req.body, id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "issue not found"
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["open", "in_progress", "resolved"];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({
      success: false,
      message: "invalid status. must be one of: open, in_progress, resolved"
    });
    return;
  }
  try {
    const result = await issueService.updateStatusInDB(id, status);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "issue not found"
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "issue status updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteissuefromDB(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "issue not found"
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "issue deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var issueController = {
  createIssues,
  getIssues,
  getSingleissue,
  updateIssue,
  updateStatus,
  deleteIssue
};

// src/middlewire/auth.ts
import jwt2 from "jsonwebtoken";
var auth = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({
      success: false,
      message: "unauthorized access"
    });
    return;
  }
  try {
    const decoded = jwt2.verify(token, config_default.secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "invalid or expired token"
    });
  }
};
var auth_default = auth;

// src/middlewire/requireRole.ts
var requireRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: "forbidden: you do not have permission to perform this action"
      });
      return;
    }
    next();
  };
};
var requireRole_default = requireRole;

// src/modules/issues/issue.routes.ts
var router3 = Router3();
router3.post("/", auth_default, issueController.createIssues);
router3.get("/", issueController.getIssues);
router3.get("/:id", issueController.getSingleissue);
router3.patch("/:id/status", auth_default, requireRole_default("maintainer"), issueController.updateStatus);
router3.patch("/:id", auth_default, issueController.updateIssue);
router3.delete("/:id", auth_default, requireRole_default("maintainer"), issueController.deleteIssue);
var issueroute = router3;

// src/middlewire/logger.ts
import fs from "fs";
var logger = ((req, res, next) => {
  console.log("method - url -time: ", req.method, req.url, Date.now());
  const log = `
Method -> ${req.method}-Time -> ${Date.now()} -URL -> ${req.url}
`;
  fs.appendFile("logger.txt", log, (err) => {
    console.log(err);
  });
  next();
});
var logger_default = logger;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger_default);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "server is running",
    author: "jubayer"
  });
});
app.use("/api/users", userRoute);
app.use("/api/issues", issueroute);
app.use("/api/auth", authRoute);
var app_default = app;

// src/server.ts
var port = config_default.port;
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
main();
//# sourceMappingURL=server.js.map