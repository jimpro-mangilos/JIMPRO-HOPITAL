import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  // Clean up existing data in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.emergencyVisit.deleteMany();
  await prisma.hospitalization.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.ward.deleteMany();
  await prisma.imagingResult.deleteMany();
  await prisma.imagingRequest.deleteMany();
  await prisma.labResult.deleteMany();
  await prisma.labRequest.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.pharmacyStock.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Données nettoyées');

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // --- Super Admin ---
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@jimpro-hopital.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      staff: {
        create: {
          firstName: 'Jean',
          lastName: 'Directeur',
          phone: '+237600000001',
          speciality: 'Administration',
          department: 'Direction',
          position: 'Directeur Général',
        },
      },
    },
  });
  console.log('👤 Super Admin créé:', superAdmin.email);

  // --- Doctors ---
  const doctor1 = await prisma.user.create({
    data: {
      email: 'dr.kamga@jimpro-hopital.com',
      passwordHash,
      role: 'MEDECIN',
      staff: {
        create: {
          firstName: 'Paul',
          lastName: 'Kamga',
          phone: '+237600000002',
          speciality: 'Médecine Générale',
          licenseNumber: 'MED-001',
          department: 'Médecine Générale',
          position: 'Médecin',
        },
      },
    },
  });

  const doctor2 = await prisma.user.create({
    data: {
      email: 'dr.fotso@jimpro-hopital.com',
      passwordHash,
      role: 'MEDECIN',
      staff: {
        create: {
          firstName: 'Marie',
          lastName: 'Fotso',
          phone: '+237600000003',
          speciality: 'Pédiatrie',
          licenseNumber: 'MED-002',
          department: 'Pédiatrie',
          position: 'Pédiatre',
        },
      },
    },
  });

  console.log('👨‍⚕️ Médecins créés');

  // --- Nurses ---
  const nurse1 = await prisma.user.create({
    data: {
      email: 'inf.kengne@jimpro-hopital.com',
      passwordHash,
      role: 'INFIRMIER',
      staff: {
        create: {
          firstName: 'Sophie',
          lastName: 'Kengne',
          phone: '+237600000004',
          department: 'Médecine Générale',
          position: 'Infirmière',
        },
      },
    },
  });

  const nurse2 = await prisma.user.create({
    data: {
      email: 'inf.tchinda@jimpro-hopital.com',
      passwordHash,
      role: 'INFIRMIER',
      staff: {
        create: {
          firstName: 'Esther',
          lastName: 'Tchinda',
          phone: '+237600000005',
          department: 'Pédiatrie',
          position: 'Infirmière',
        },
      },
    },
  });

  console.log('👩‍⚕️ Infirmières créées');

  // --- Other staff ---
  await prisma.user.create({
    data: {
      email: 'pharma@jimpro-hopital.com',
      passwordHash,
      role: 'PHARMACIEN',
      staff: {
        create: {
          firstName: 'David',
          lastName: 'Mballa',
          phone: '+237600000006',
          department: 'Pharmacie',
          position: 'Pharmacien',
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: 'labo@jimpro-hopital.com',
      passwordHash,
      role: 'LABORANTIN',
      staff: {
        create: {
          firstName: 'Carine',
          lastName: 'Ngo',
          phone: '+237600000007',
          department: 'Laboratoire',
          position: 'Laborantine',
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: 'accueil@jimpro-hopital.com',
      passwordHash,
      role: 'ACCUEIL',
      staff: {
        create: {
          firstName: 'Alice',
          lastName: 'Mekongo',
          phone: '+237600000008',
          department: 'Accueil',
          position: 'Agent d\'accueil',
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: 'compta@jimpro-hopital.com',
      passwordHash,
      role: 'COMPTABLE',
      staff: {
        create: {
          firstName: 'Bertrand',
          lastName: 'Etoundi',
          phone: '+237600000009',
          department: 'Comptabilité',
          position: 'Comptable',
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: 'radio@jimpro-hopital.com',
      passwordHash,
      role: 'RADIOLOGUE',
      staff: {
        create: {
          firstName: 'Georges',
          lastName: 'Ngassa',
          phone: '+237600000010',
          speciality: 'Radiologie',
          licenseNumber: 'RAD-001',
          department: 'Imagerie',
          position: 'Radiologue',
        },
      },
    },
  });

  console.log('👥 Personnel créé');

  // --- Patients ---
  const patient1 = await prisma.patient.create({
    data: {
      firstName: 'Pierre',
      lastName: 'Nkoulou',
      dateOfBirth: new Date('1985-06-15'),
      gender: 'M',
      phone: '+237612345678',
      email: 'pierre.nkoulou@email.com',
      address: 'Quartier Bastos',
      city: 'Yaoundé',
      bloodGroup: 'O_POS',
      allergies: 'Pénicilline',
      insuranceProvider: 'CNAMGS',
      insuranceNumber: 'CNAM-001234',
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      firstName: 'Céline',
      lastName: 'Biya',
      dateOfBirth: new Date('1990-03-22'),
      gender: 'F',
      phone: '+237623456789',
      email: 'celine.biya@email.com',
      address: 'Centre Ville',
      city: 'Douala',
      bloodGroup: 'A_POS',
      chronicConditions: 'Diabète type 2',
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      firstName: 'François',
      lastName: 'Tchakounte',
      dateOfBirth: new Date('1978-11-08'),
      gender: 'M',
      phone: '+237634567890',
      address: 'Quartier Madagascar',
      city: 'Yaoundé',
      bloodGroup: 'B_POS',
      allergies: 'Aspirine',
      emergencyContact: 'Mme Tchakounte',
      emergencyPhone: '+237699887766',
    },
  });

  console.log('🏥 Patients créés');

  // --- Medications ---
  const meds = await Promise.all([
    prisma.medication.create({ data: { name: 'Paracétamol 500mg', genericName: 'Paracétamol', category: 'Antalgique', form: 'Comprimé', dosageUnit: 'mg', unitPrice: 500 } }),
    prisma.medication.create({ data: { name: 'Amoxicilline 500mg', genericName: 'Amoxicilline', category: 'Antibiotique', form: 'Comprimé', dosageUnit: 'mg', unitPrice: 1500 } }),
    prisma.medication.create({ data: { name: 'Ibuprofène 400mg', genericName: 'Ibuprofène', category: 'Anti-inflammatoire', form: 'Comprimé', dosageUnit: 'mg', unitPrice: 800 } }),
    prisma.medication.create({ data: { name: 'Oméprazole 20mg', genericName: 'Oméprazole', category: 'Anti-acide', form: 'Comprimé', dosageUnit: 'mg', unitPrice: 1200 } }),
    prisma.medication.create({ data: { name: 'Métformine 850mg', genericName: 'Métformine', category: 'Antidiabétique', form: 'Comprimé', dosageUnit: 'mg', unitPrice: 600 } }),
    prisma.medication.create({ data: { name: 'Salbutamol Spray', genericName: 'Salbutamol', category: 'Bronchodilatateur', form: 'Spray', dosageUnit: 'mcg', unitPrice: 2500 } }),
    prisma.medication.create({ data: { name: 'Ceftriaxone 1g', genericName: 'Ceftriaxone', category: 'Antibiotique', form: 'Injectable', dosageUnit: 'g', unitPrice: 3500 } }),
    prisma.medication.create({ data: { name: 'Sérum Physiologique 500ml', genericName: 'Chlorure de Sodium', category: 'Soluté', form: 'Poche', dosageUnit: 'ml', unitPrice: 1000 } }),
  ]);

  // --- Supplier ---
  const supplier = await prisma.supplier.create({
    data: {
      name: 'CAMPHARMA Distribution',
      contact: 'M. Tagny',
      phone: '+237600111222',
      email: 'commandes@campharma.cm',
      address: 'Zone Industrielle, Douala',
    },
  });

  // --- Pharmacy Stock ---
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 2);
  const nearExpiry = new Date();
  nearExpiry.setMonth(nearExpiry.getMonth() + 3);

  await Promise.all([
    prisma.pharmacyStock.create({ data: { medicationId: meds[0].id, batchNumber: 'BATCH-001', quantity: 200, unitPrice: 500, expiryDate: futureDate, supplierId: supplier.id, reorderLevel: 20, location: 'Rayon A1' } }),
    prisma.pharmacyStock.create({ data: { medicationId: meds[1].id, batchNumber: 'BATCH-002', quantity: 5, unitPrice: 1500, expiryDate: nearExpiry, supplierId: supplier.id, reorderLevel: 10, location: 'Rayon A2' } }),
    prisma.pharmacyStock.create({ data: { medicationId: meds[2].id, batchNumber: 'BATCH-003', quantity: 150, unitPrice: 800, expiryDate: futureDate, supplierId: supplier.id, reorderLevel: 15, location: 'Rayon B1' } }),
    prisma.pharmacyStock.create({ data: { medicationId: meds[3].id, batchNumber: 'BATCH-004', quantity: 80, unitPrice: 1200, expiryDate: futureDate, supplierId: supplier.id, reorderLevel: 10, location: 'Rayon B2' } }),
    prisma.pharmacyStock.create({ data: { medicationId: meds[4].id, batchNumber: 'BATCH-005', quantity: 3, unitPrice: 600, expiryDate: nearExpiry, supplierId: supplier.id, reorderLevel: 20, location: 'Rayon C1' } }),
    prisma.pharmacyStock.create({ data: { medicationId: meds[5].id, batchNumber: 'BATCH-006', quantity: 50, unitPrice: 2500, expiryDate: futureDate, supplierId: supplier.id, reorderLevel: 5, location: 'Rayon C2' } }),
    prisma.pharmacyStock.create({ data: { medicationId: meds[6].id, batchNumber: 'BATCH-007', quantity: 30, unitPrice: 3500, expiryDate: futureDate, supplierId: supplier.id, reorderLevel: 10, location: 'Réfrigérateur' } }),
    prisma.pharmacyStock.create({ data: { medicationId: meds[7].id, batchNumber: 'BATCH-008', quantity: 100, unitPrice: 1000, expiryDate: futureDate, supplierId: supplier.id, reorderLevel: 20, location: 'Rayon D1' } }),
  ]);

  console.log('💊 Médicaments et stock créés');

  // --- Wards, Rooms, Beds ---
  const ward1 = await prisma.ward.create({ data: { name: 'Médecine Générale', type: 'Médecine', floor: 1, capacity: 20 } });
  const ward2 = await prisma.ward.create({ data: { name: 'Pédiatrie', type: 'Pédiatrie', floor: 1, capacity: 15 } });
  const ward3 = await prisma.ward.create({ data: { name: 'Chirurgie', type: 'Chirurgie', floor: 2, capacity: 15 } });
  const ward4 = await prisma.ward.create({ data: { name: 'Maternité', type: 'Maternité', floor: 2, capacity: 12 } });

  const roomsData = [
    { wardId: ward1.id, roomNumber: '101', type: 'STANDARD' as const, floor: 1 },
    { wardId: ward1.id, roomNumber: '102', type: 'PRIVEE' as const, floor: 1 },
    { wardId: ward2.id, roomNumber: '103', type: 'STANDARD' as const, floor: 1 },
    { wardId: ward2.id, roomNumber: '104', type: 'SEMI_PRIVEE' as const, floor: 1 },
    { wardId: ward3.id, roomNumber: '201', type: 'STANDARD' as const, floor: 2 },
    { wardId: ward3.id, roomNumber: '202', type: 'SOINS_INTENSIFS' as const, floor: 2 },
    { wardId: ward4.id, roomNumber: '203', type: 'PRIVEE' as const, floor: 2 },
  ];

  for (const r of roomsData) {
    const room = await prisma.room.create({ data: r });
    await prisma.bed.create({ data: { roomId: room.id, bedNumber: `${r.roomNumber}-A` } });
    await prisma.bed.create({ data: { roomId: room.id, bedNumber: `${r.roomNumber}-B` } });
    if (r.type === 'STANDARD' || r.type === 'SEMI_PRIVEE') {
      await prisma.bed.create({ data: { roomId: room.id, bedNumber: `${r.roomNumber}-C` } });
    }
  }

  console.log('🏨 Services, chambres et lits créés');
  console.log('✅ Seed terminé avec succès!');
  console.log('📧 Connexion: admin@jimpro-hopital.com / Admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
