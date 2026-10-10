// Mock for express-request-id
import { Request, Response, NextFunction } from 'express';

const mockRequestId = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    (req as Request & { id?: string }).id = 'test-request-id';
    next();
  };
};

export default mockRequestId;
