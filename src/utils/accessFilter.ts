import { Request } from 'express';

export interface CurrentUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  userRole: any;
  userAccess: any;
}

export function getCurrentUser(req: Request): CurrentUser | null {
  try {
    const currentUserHeader = req.headers["currentUser"] as string;
    if (!currentUserHeader) return null;
    return JSON.parse(currentUserHeader);
  } catch (error) {
    console.log('Error parsing currentUser from headers:', error);
    return null;
  }
}

export function getAccessFilter(req: Request, module: string): any {
    const currentUser = getCurrentUser(req);
    
    if (!currentUser || !currentUser.userAccess) {
      // If no user or userAccess, return empty filter (show all) for backward compatibility
      return {};
    }
  
    const userAccess = currentUser.userAccess;
    const moduleAccess = userAccess[module];
  
    if (!moduleAccess) {
      // If module access not found, return empty filter (show all) for backward compatibility
      return {};
    }
  
    // If canViewAll is true, return empty filter (show all)
    if (moduleAccess.canViewAll === true) {
        console.log('canViewAll is true');
      return {};
    }
    console.log('canViewAll is false');
  
    // If canViewAll is false, filter by createdBy
    // Include records created by user, null createdBy, or where createdBy doesn't exist
    return {
      $or: [
        { createdBy: currentUser.userId },
        // { createdBy: null },
        // { createdBy: { $exists: true } }
      ]
    };
  }

export function hasModulePermission(req: Request, module: string, permission: string): boolean {
  const currentUser = getCurrentUser(req);
  
  if (!currentUser || !currentUser.userAccess) {
    return false;
  }

  const userAccess = currentUser.userAccess;
  const moduleAccess = userAccess[module];

  if (!moduleAccess) {
    return false;
  }

  return moduleAccess[permission] === true;
} 