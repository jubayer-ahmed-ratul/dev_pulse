import { Router, type Request, type Response } from "express";
import { userController } from "./user.controller";

const router = Router();

router.post("/", userController.createUser);

router.get("/",userController.getAllusers );

router.get("/:id",userController.getSingleuser );


export const userRoute = router;
