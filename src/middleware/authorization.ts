import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../modules/user/user.model';
import UserAccess from '../modules/userAccess/userAccess.model';

export interface AuthRequest extends Request {
  user?: any;
  userAccess?: any;
}

export const authorization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        data: null,
        message: 'Authorization header missing or invalid'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Fetch user with populated userRoleId
    const user = await User.findById(decoded.userId).populate('userRoleId');
    if (!user) {
      return res.status(401).json({
        data: null,
        message: 'User not found'
      });
    }

    // Fetch userAccess using userRole._id
    let userAccess = null;
    if (user.userRoleId) {
      const userRole = user.userRoleId as any;
      userAccess = await UserAccess.findOne({ roleId: userRole._id });
    }

    // Set decoded user info to headers
    req.headers["currentUser"] = JSON.stringify({
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      userRole: user.userRoleId,
      userAccess: userAccess
    });

    // Also set in req for backward compatibility
    req.user = decoded;
    req.userAccess = userAccess;
    
    next();
  } catch (error) {
    console.log("The error in middleware is : ", error)
    return res.status(401).json({
      data: null,
      message: 'Invalid or expired token'
    });
  }
}; 