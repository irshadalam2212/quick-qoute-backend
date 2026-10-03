import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

type AsyncRequestHandler<P, ReqBody> = (
  req: Request<P, unknown, ReqBody>,
  res: Response,
  next: NextFunction,
) => Promise<unknown> | unknown;

/** Forwards sync throws and rejected async handler promises to Express error middleware. */
const asyncHandler = <P = ParamsDictionary, ReqBody = unknown>(
  requestHandler: AsyncRequestHandler<P, ReqBody>,
): RequestHandler<P, unknown, ReqBody> => {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => requestHandler(req, res, next))
      .catch(next);
  };
};

export { asyncHandler };