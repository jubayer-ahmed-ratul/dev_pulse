import { Router, type Request, type Response } from "express";
import { userController } from "./user.controller";

const router = Router();

router.post("/", userController.createUser);

router.get("/api/users",userController.getAllusers );

router.get("/api/users/:id",userController.getSingleuser );


export const userRoute = router;
