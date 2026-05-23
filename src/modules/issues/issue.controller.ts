import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssues = async (req: Request, res: Response) => {
  try {
    const reporter_id = req.user?.id as number;

    const userExists = await issueService.checkUserExists(reporter_id);
    if (!userExists) {
      res.status(404).json({
        success: false,
        message: "reporter user not found",
      });
      return;
    }

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
    const sort = req.query["sort"] as string | undefined;
    const type = req.query["type"] as string | undefined;
    const status = req.query["status"] as string | undefined;

    const issuesResult = await issueService.GetIssuesfromDB({ sort, type, status });
    const issues = issuesResult.rows;

    if (issues.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const reporterIds = [...new Set(issues.map((i: any) => i.reporter_id))] as number[];
    const reportersResult = await issueService.getReportersByIds(reporterIds);
    const reporterMap: Record<number, any> = {};
    for (const r of reportersResult.rows) {
      reporterMap[r.id] = r;
    }

    const data = issues.map((issue: any) => {
      const { reporter_id, ...rest } = issue;
      return {
        ...rest,
        reporter: reporterMap[reporter_id] ?? null,
      };
    });

    res.status(200).json({
      success: true,
      data,
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

  try {
    const result = await issueService.getSingleissuefromDB(id as string);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "issue not found",
        data: null,
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
        reporter: reporterResult.rows[0] ?? null,
      },
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
    if (userRole === "contributor") {
      const existing = await issueService.getSingleissuefromDB(id as string);

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

    const result = await issueService.updateIssuefromDB(req.body, id as string);

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

const updateStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["open", "in_progress", "resolved"];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({
      success: false,
      message: "invalid status. must be one of: open, in_progress, resolved",
    });
    return;
  }

  try {
    const result = await issueService.updateStatusInDB(id as string, status);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "issue not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "issue status updated successfully",
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
    const result = await issueService.deleteissuefromDB(id as string);

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
  updateStatus,
  deleteIssue,
};
