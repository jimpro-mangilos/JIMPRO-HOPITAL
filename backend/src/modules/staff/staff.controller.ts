import { Request, Response } from 'express';
import { staffService } from './staff.service';

export class StaffController {
  async findAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const department = req.query.department as string;
      const result = await staffService.findAll(page, limit, department);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const staff = await staffService.findById(req.params.id);
      res.json(staff);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const staff = await staffService.update(req.params.id, req.body);
      res.json(staff);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getSchedule(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date();
      const end = endDate ? new Date(endDate as string) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      const schedule = await staffService.getStaffSchedule(req.params.id, start, end);
      res.json(schedule);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getDoctors(_req: Request, res: Response) {
    try {
      const doctors = await staffService.getDoctors();
      res.json(doctors);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

export const staffController = new StaffController();
