import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middlewire/auth";
import requireRole from "../../middlewire/requireRole";

const router = Router();
router.post("/", auth, issueController.createIssues);
router.get("/", issueController.getIssues);
router.get("/:id", issueController.getSingleissue);
router.patch("/:id", auth, issueController.updateIssue);
router.delete("/:id", auth, requireRole("maintainer"), issueController.deleteIssue);
export const issueroute = router;