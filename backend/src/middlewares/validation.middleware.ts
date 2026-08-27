import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { HttpStatus } from "../constants/httpStatus.js";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: "Dados inválidos",
        details: result.error.flatten(),
      });
    }

    req.body = result.data;
    return next();
  };
};
