import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/kpis', authMiddleware, dashboardController.getKPIs.bind(dashboardController));
router.get('/appointments-chart', authMiddleware, dashboardController.getAppointmentsChart.bind(dashboardController));
router.get('/revenue-chart', authMiddleware, dashboardController.getRevenueChart.bind(dashboardController));
router.get('/department-stats', authMiddleware, dashboardController.getDepartmentStats.bind(dashboardController));

export default router;
