import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class HospitalizationService {
  // --- Wards ---
  async findAllWards() {
    return prisma.ward.findMany({
      include: { _count: { select: { rooms: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createWard(data: { name: string; type: string; floor: number; capacity?: number }) {
    return prisma.ward.create({ data });
  }

  async findWardById(id: string) {
    const ward = await prisma.ward.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            beds: true,
            _count: { select: { beds: true } },
          },
        },
      },
    });
    if (!ward) throw new AppError('Service non trouvé.', 404);
    return ward;
  }

  async updateWard(id: string, data: any) {
    const ward = await prisma.ward.findUnique({ where: { id } });
    if (!ward) throw new AppError('Service non trouvé.', 404);
    return prisma.ward.update({ where: { id }, data });
  }

  // --- Rooms ---
  async findAllRooms(wardId?: string) {
    const where: any = {};
    if (wardId) where.wardId = wardId;
    return prisma.room.findMany({
      where,
      include: {
        ward: true,
        beds: true,
        _count: { select: { beds: true } },
      },
      orderBy: { roomNumber: 'asc' },
    });
  }

  async createRoom(data: { wardId: string; roomNumber: string; type?: string; floor: number }) {
    return prisma.room.create({
      data: { ...data, type: (data.type as any) || 'STANDARD' },
      include: { ward: true },
    });
  }

  async findRoomById(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: { ward: true, beds: true },
    });
    if (!room) throw new AppError('Chambre non trouvée.', 404);
    return room;
  }

  async updateRoom(id: string, data: any) {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) throw new AppError('Chambre non trouvée.', 404);
    return prisma.room.update({ where: { id }, data });
  }

  // --- Beds ---
  async findAllBeds(roomId?: string) {
    const where: any = {};
    if (roomId) where.roomId = roomId;
    return prisma.bed.findMany({
      where,
      include: {
        room: { include: { ward: true } },
        hospitalizations: {
          where: { status: 'ADMIS' },
          include: { patient: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
      orderBy: { bedNumber: 'asc' },
    });
  }

  async createBed(data: { roomId: string; bedNumber: string; type?: string }) {
    return prisma.bed.create({ data, include: { room: { include: { ward: true } } } });
  }

  async findBedById(id: string) {
    const bed = await prisma.bed.findUnique({
      where: { id },
      include: {
        room: { include: { ward: true } },
        hospitalizations: {
          include: { patient: true },
          orderBy: { admissionDate: 'desc' },
          take: 5,
        },
      },
    });
    if (!bed) throw new AppError('Lit non trouvé.', 404);
    return bed;
  }

  async updateBed(id: string, data: any) {
    const bed = await prisma.bed.findUnique({ where: { id } });
    if (!bed) throw new AppError('Lit non trouvé.', 404);
    return prisma.bed.update({ where: { id }, data });
  }

  async getBedAvailability() {
    return prisma.bed.groupBy({
      by: ['status'],
      _count: true,
    });
  }

  // --- Hospitalizations ---
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.hospitalization.findMany({
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          bed: { include: { room: { include: { ward: true } } } },
        },
        orderBy: { admissionDate: 'desc' },
      }),
      prisma.hospitalization.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const hosp = await prisma.hospitalization.findUnique({
      where: { id },
      include: {
        patient: true,
        bed: { include: { room: { include: { ward: true } } } },
      },
    });
    if (!hosp) throw new AppError('Hospitalisation non trouvée.', 404);
    return hosp;
  }

  async admit(data: { patientId: string; bedId: string; reason: string; diagnosis?: string; notes?: string }) {
    // Check bed availability
    const bed = await prisma.bed.findUnique({ where: { id: data.bedId } });
    if (!bed) throw new AppError('Lit non trouvé.', 404);
    if (bed.status !== 'DISPONIBLE') throw new AppError('Ce lit n\'est pas disponible.', 400);

    // Create hospitalization and update bed status in a transaction
    return prisma.$transaction(async (tx) => {
      const hosp = await tx.hospitalization.create({
        data: {
          patientId: data.patientId,
          bedId: data.bedId,
          reason: data.reason,
          diagnosis: data.diagnosis,
          notes: data.notes,
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          bed: { include: { room: { include: { ward: true } } } },
        },
      });

      await tx.bed.update({
        where: { id: data.bedId },
        data: { status: 'OCCUPE' },
      });

      return hosp;
    });
  }

  async discharge(id: string, notes?: string) {
    const hosp = await prisma.hospitalization.findUnique({
      where: { id },
      include: { bed: true },
    });
    if (!hosp) throw new AppError('Hospitalisation non trouvée.', 404);
    if (hosp.status === 'SORTI') throw new AppError('Patient déjà sorti.', 400);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.hospitalization.update({
        where: { id },
        data: {
          status: 'SORTI',
          dischargeDate: new Date(),
          notes: notes || hosp.notes,
        },
      });

      await tx.bed.update({
        where: { id: hosp.bedId },
        data: { status: 'DISPONIBLE' },
      });

      return updated;
    });
  }

  async transfer(id: string, newBedId: string, reason?: string) {
    const hosp = await prisma.hospitalization.findUnique({
      where: { id },
      include: { bed: true },
    });
    if (!hosp) throw new AppError('Hospitalisation non trouvée.', 404);
    if (hosp.status !== 'ADMIS') throw new AppError('Patient non admis actuellement.', 400);

    const newBed = await prisma.bed.findUnique({ where: { id: newBedId } });
    if (!newBed) throw new AppError('Nouveau lit non trouvé.', 404);
    if (newBed.status !== 'DISPONIBLE') throw new AppError('Le nouveau lit n\'est pas disponible.', 400);

    return prisma.$transaction(async (tx) => {
      // Release old bed
      await tx.bed.update({
        where: { id: hosp.bedId },
        data: { status: 'DISPONIBLE' },
      });

      // Occupy new bed
      await tx.bed.update({
        where: { id: newBedId },
        data: { status: 'OCCUPE' },
      });

      const updated = await tx.hospitalization.update({
        where: { id },
        data: {
          bedId: newBedId,
          status: 'TRANSFERE',
          notes: reason ? `${hosp.notes || ''}\nTransfert: ${reason}` : hosp.notes,
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          bed: { include: { room: { include: { ward: true } } } },
        },
      });

      return updated;
    });
  }

  async getCurrentPatients() {
    return prisma.hospitalization.findMany({
      where: { status: { in: ['ADMIS', 'TRANSFERE'] } },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, bloodGroup: true } },
        bed: { include: { room: { include: { ward: true } } } },
      },
      orderBy: { admissionDate: 'desc' },
    });
  }
}

export const hospitalizationService = new HospitalizationService();
