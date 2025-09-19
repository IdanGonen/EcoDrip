import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
  };
}

/**
 * Basic authentication middleware that expects userId in the request body
 * This is a simple implementation - in production you would use JWT tokens
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('Request method:', req.method);
    console.log('Request body:', req.body);
    console.log('Request query:', req.query);
    console.log('Request headers:', req.headers['content-type']);

    // For GET requests, check query parameters
    // For POST/PUT/DELETE requests, check body (including ownerId for file uploads)
    let userId: string | undefined;
    
    if (req.method === 'GET') {
      userId = req.query.userId as string;
    } else {
      userId = req.body.userId || req.body.ownerId;
    }

    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({
        success: false,
        message: 'Authentication required - userId missing',
      });
    }

    // Add userId to request for controllers to use
    if (!req.body) {
      req.body = {};
    }
    req.body.userId = userId;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Admin authentication middleware
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { isAdmin } = req.body;

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Admin authentication failed',
    });
  }
};
