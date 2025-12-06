import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

export const verifyAppCheck = async (req: Request, res: Response, next: NextFunction) => {
  // Skip App Check in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const token = (req.headers['x-firebase-appcheck'] || req.headers['X-Firebase-AppCheck']) as string | undefined;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Missing App Check token' });
    return;
  }

  try {
    await admin.appCheck().verifyToken(token);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid App Check token' });
  }
};
