import express, { Request, Response, NextFunction } from "express";
import { ApiError, ApiResponse } from "@shared/types";

export function sendSuccess<T>(
    res: Response<ApiResponse<T>>, 
    data: T,message : string, status = 200) {
  return res.status(status).json({
    success: true,
    message : message,
    data,
  });
}

export function sendError(
  res: Response<ApiResponse<never>>,
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  return res.status(status).json({
    success: false,
    message : message,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
}