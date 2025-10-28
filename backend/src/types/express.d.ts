import 'express-serve-static-core';

declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}
