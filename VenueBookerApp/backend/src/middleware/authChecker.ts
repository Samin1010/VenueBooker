import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { sendError } from "../types/responses";

export function authChecker(role : Array<"hirer" | "vendor">)
{
    const userRepository = AppDataSource.getRepository(User);
    return async (req : Request, res : Response,next : NextFunction) => {
        
        const {userId} = req.body;
         const user = await userRepository.findOne({
            where : {
                id : Number(userId)
            }
        });

        if(!user)
        {
            return sendError(res , 404, "NOT_FOUND","User not found");
        }

        if(!role.find((role) => role === user.role))
        {
            return sendError(res,403,"NOT_ALLOWED","User does not have permission to perform this action");
        }

        next();
    }
}
