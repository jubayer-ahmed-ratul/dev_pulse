
import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../config";

const auth=()=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        // console.log("this is protected route");
        // console.log(req.headers.authorization);
        const token =req.headers.authorization;
        if (!token) {

            res.status(401).json({
                success:false,
                message:"unauthorized access"
            })
        }

        const decoded =jwt.verify(token as string,config.secret as string) as JwtPayload;
        // console.log(decoded);
        next();
    }
}

export default auth;