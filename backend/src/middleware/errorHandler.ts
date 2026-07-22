import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        message: 'Un enregistrement avec ces données existe déjà.',
        field: (err.meta?.target as string[])?.[0],
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'Enregistrement non trouvé.' });
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ message: 'Données invalides.' });
    return;
  }

  res.status(500).json({
    message: 'Erreur interne du serveur.',
    ...(process.env.NODE_ENV === 'development' && { detail: err.message }),
  });
}
