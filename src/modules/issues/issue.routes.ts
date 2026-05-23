import { Router } from "express";
import { issueController } from "./issue.controller";


const router =Router();
router.post("/",issueController.createIssues);
router.get("/",issueController.getIssues);
router.get("/:id",issueController.getSingleissue );
router.patch("/:id", issueController.updateIssue);
export const issueroute=router;