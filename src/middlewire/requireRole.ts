import type { NextFunction, Request, Response } from "express";

const requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole || !roles.includes(userRole)) {
            res.status(403).json({
                success: false,
                message: "forbidden: you do not have permission to perform this action"
            });
            return;
        }

        next();
    };
};

export default requireRole;
