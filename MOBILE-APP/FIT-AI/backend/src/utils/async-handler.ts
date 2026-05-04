import type { NextFunction, Request, RequestHandler, Response } from 'express';

export function asyncHandler<TReq extends Request = Request, TRes extends Response = Response>(
  fn: (req: TReq, res: TRes, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req as TReq, res as TRes, next).catch(next);
  };
}
