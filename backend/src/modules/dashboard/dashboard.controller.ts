import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  async getKPIs(_req: Request, res: Response) {
    try { res.json(await dashboardService.getKPIs()); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }

  async getAppointmentsChart(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      res.json(await dashboardService.getAppointmentsChart(days));
    } catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }

  async getRevenueChart(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      res.json(await dashboardService.getRevenueChart(days));
    } catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }

  async getDepartmentStats(_req: Request, res: Response) {
    try { res.json(await dashboardService.getDepartmentStats()); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
}

export const dashboardController = new DashboardController();
