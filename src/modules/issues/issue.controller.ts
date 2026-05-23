import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssues = async (req: Request, res: Response) => {
  try {
    const reporter_id = req.user?.id as number;
    const result = await issueService.createIssuesIntoDB(req.body, reporter_id);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getIssues = async (req: Request, res: Response) => {
  try {
    const result = await issueService.GetIssuesfromDB();

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getSingleissue = async (req: Request, res: Response) => {
  const { id } = req.params;
  //   console.log(id);

  try {
    const result = await issueService.getSingleissuefromDB(id as string);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "issue not found",
        data: null,
      });
    }
    return res.status(200).json({
      success: true,
      message: "issue retrived",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userRole = req.user?.role;
  const userId = req.user?.id as number;

  try {
    // contributor হলে — নিজের issue কিনা এবং status open কিনা check করো
    if (userRole === "contributor") {
      const existing = await issueService.getSingleissuefromDB(id);

      if (existing.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "issue not found",
        });
        return;
      }

      const issue = existing.rows[0];

      if (issue.reporter_id !== userId) {
        res.status(403).json({
          success: false,
          message: "forbidden: you can only update your own issues",
        });
        return;
      }

      if (issue.status !== "open") {
        res.status(403).json({
          success: false,
          message: "forbidden: you can only update issues with open status",
        });
        return;
      }
    }

    const result = await issueService.updateIssuefromDB(req.body, id);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "issue not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "issue updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};



const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await issueService.deleteissuefromDB( id as string);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "issue not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "issue deleted successfully",
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const issueController = {
  createIssues,
  getIssues,
  getSingleissue,
  updateIssue,
  deleteIssue,
};
