import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssues = async (req: Request, res: Response) => {
  // console.log(req.body);
  // const { title,description,type } = req.body;

  try {
    const result = await issueService.createIssuesIntoDB(req.body);

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

const getIssues=async(req:Request,res:Response)=>{

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

}

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


export const issueController = {
  createIssues,getIssues,getSingleissue
};
