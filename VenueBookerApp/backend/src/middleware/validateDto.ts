import { Request, NextFunction, Response } from "express";
import { validate } from "class-validator";
import {plainToInstance} from "class-transformer";

type ClassConstructor<T extends object> = {
  new (...args: any[]): T;
};

export function validateDto<T extends object>(DtoClass : ClassConstructor<T>){
    return async(req : Request,res : Response, next : NextFunction) => {
        const dtoObject = plainToInstance(DtoClass, req.body);

        const errors = await validate(dtoObject);

        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.map((err) => ({
                property: err.property,
                constraints: err.constraints,
                })),
            });
        }

        return next();
    }
}