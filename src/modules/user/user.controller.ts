import type { Request, Response } from "express";

import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  // console.log(req.body);
  //   const { name, email, password } = req.body;

  try {
    const result = await userService.createUserIntoDB(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
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

const getAllusers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getusersfromDB();

    res.status(200).json({
      success: true,
      message: "Users retrived successfully",
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

const getSingleuser = async (req: Request, res: Response) => {
  const { id } = req.params;
  //   console.log(id);

  try {
    const result = await userService.getSingleuserfromDB(id as string);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "user not found",
        data: null,
      });
    }
    return res.status(200).json({
      success: true,
      message: "user retrived",
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

export const userController = {
  createUser,
  getAllusers,
  getSingleuser,
};
