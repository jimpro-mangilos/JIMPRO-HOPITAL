import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../lib/jwt';
import { auditLog } from '../../lib/audit';
import { AppError } from '../../middleware/errorHandler';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role?: string;
    speciality?: string;
    licenseNumber?: string;
    department?: string;
    position?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Cet email est déjà utilisé.', 409);

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: (data.role as any) || 'ACCUEIL',
        staff: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            speciality: data.speciality,
            licenseNumber: data.licenseNumber,
            department: data.department,
            position: data.position,
          },
        },
      },
      include: { staff: true },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        staff: user.staff,
      },
      token,
    };
  }

  async login(email: string, password: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { staff: true },
    });
    if (!user) throw new AppError('Email ou mot de passe incorrect.', 401);
    if (!user.isActive) throw new AppError('Ce compte est désactivé.', 403);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Email ou mot de passe incorrect.', 401);

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await auditLog({ userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id, ipAddress });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        staff: user.staff,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { staff: true },
    });
    if (!user) throw new AppError('Utilisateur non trouvé.', 404);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      staff: user.staff,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    speciality?: string;
    department?: string;
    position?: string;
    avatarUrl?: string;
  }) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { staff: true } });
    if (!user) throw new AppError('Utilisateur non trouvé.', 404);

    await prisma.staff.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        speciality: data.speciality,
        department: data.department,
        position: data.position,
        avatarUrl: data.avatarUrl,
      },
    });

    await auditLog({ userId, action: 'UPDATE', entity: 'Staff', entityId: user.staff?.id });

    return this.getProfile(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Utilisateur non trouvé.', 404);

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new AppError('Mot de passe actuel incorrect.', 400);

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    await auditLog({ userId, action: 'UPDATE', entity: 'User', entityId: userId, details: { field: 'password' } });

    return { message: 'Mot de passe changé avec succès.' };
  }

  async listUsers() {
    return prisma.user.findMany({
      include: { staff: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    speciality?: string;
    licenseNumber?: string;
    department?: string;
    position?: string;
  }) {
    return this.register(data);
  }

  async updateUserRole(userId: string, role: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Utilisateur non trouvé.', 404);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      include: { staff: true },
    });

    await auditLog({ userId, action: 'UPDATE', entity: 'User', entityId: userId, details: { role } });

    return updated;
  }
}

export const authService = new AuthService();
