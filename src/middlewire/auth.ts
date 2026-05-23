
import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../config";

const auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
        res.status(401).json({
            success: false,
            message: "unauthorized access"
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, config.secret as string) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "invalid or expired token"
        });
    }
}

export default auth;
