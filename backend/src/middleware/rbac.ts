import { Request, Response, NextFunction } from 'express';

export function rbac(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentification requise.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: 'Accès interdit. Vous n\'avez pas les permissions nécessaires.',
      });
      return;
    }

    next();
  };
}
