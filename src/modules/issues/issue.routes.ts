import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middlewire/auth";


const router =Router();
router.post("/",issueController.createIssues);
router.get("/",auth(),issueController.getIssues);
router.get("/:id",auth(),issueController.getSingleissue );
router.patch("/:id",auth(), issueController.updateIssue);
router.delete("/:id",auth(), issueController.deleteIssue);
export const issueroute=router;