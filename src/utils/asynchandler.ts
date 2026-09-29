import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

type AsyncRequestHandler<P, ReqBody> = (
  req: Request<P, unknown, ReqBody>,
  res: Response,
  next: NextFunction,
) => Promise<unknown> | unknown;

const asyncHandler = <P = ParamsDictionary, ReqBody = unknown>(
  requestHandler: AsyncRequestHandler<P, ReqBody>,
): RequestHandler<P, unknown, ReqBody> => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
