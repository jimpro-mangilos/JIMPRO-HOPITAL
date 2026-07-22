import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { prisma } from './lib/prisma';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import patientsRoutes from './modules/patients/patients.routes';
import staffRoutes from './modules/staff/staff.routes';
import appointmentsRoutes from './modules/appointments/appointments.routes';
import consultationsRoutes from './modules/consultations/consultations.routes';
import prescriptionsRoutes from './modules/prescriptions/prescriptions.routes';
import pharmacyRoutes from './modules/pharmacy/pharmacy.routes';
import laboratoryRoutes from './modules/laboratory/laboratory.routes';
import imagingRoutes from './modules/imaging/imaging.routes';
import hospitalizationRoutes from './modules/hospitalization/hospitalization.routes';
import billingRoutes from './modules/billing/billing.routes';
import emergencyRoutes from './modules/emergency/emergency.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';

const app = express();
const httpServer = createServer(app);

// Socket.IO for real-time notifications
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JIMPRO-HOPITAL API',
      version: '1.0.0',
      description: 'API de gestion hospitalière JIMPRO-HOPITAL',
    },
    servers: [{ url: `http://localhost:${config.PORT}/api/v1` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts'],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientsRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/appointments', appointmentsRoutes);
app.use('/api/v1/consultations', consultationsRoutes);
app.use('/api/v1/prescriptions', prescriptionsRoutes);
app.use('/api/v1/pharmacy', pharmacyRoutes);
app.use('/api/v1/laboratory', laboratoryRoutes);
app.use('/api/v1/imaging', imagingRoutes);
app.use('/api/v1/hospitalization', hospitalizationRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/emergency', emergencyRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationsRoutes);

// Error handler
app.use(errorHandler);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

// Export io for use in services
export { io };

// Graceful startup
async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Base de données connectée');

    httpServer.listen(config.PORT, () => {
      console.log(`🚀 Serveur JIMPRO-HOPITAL démarré sur http://localhost:${config.PORT}`);
      console.log(`📚 Documentation API: http://localhost:${config.PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
}

start();
