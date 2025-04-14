import { NextFunction, Request, Response } from "express";
import { mainError } from "./mainError";
import { Http } from "../Utils/enums";

const errorBuilder = (err: mainError, res: Response) => {
    res.status(Http.Bad).json({
        name: err.name,
        message: err.message,
        success: err.success,
        status: err.status,
        error: err,
    });
};

export const handleError = (
    err: mainError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    errorBuilder(err, res);
};
