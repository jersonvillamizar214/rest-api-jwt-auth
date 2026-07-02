import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

// Validates req.body against a Zod schema and replaces it with the parsed
// (typed, coerced) result. Passes ZodError to the error handler on failure.
export const validateBody =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
