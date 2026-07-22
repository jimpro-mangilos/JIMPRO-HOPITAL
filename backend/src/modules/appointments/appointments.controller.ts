import { Request, Response } from 'express';
import { appointmentsService } from './appointments.service';

export class AppointmentsController {
  async create(req: Request, res: Response) {
    try {
      const appointment = await appointmentsService.create(req.body);
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await appointmentsService.findAll(page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const appointment = await appointmentsService.findById(req.params.id);
      res.json(appointment);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const appointment = await appointmentsService.update(req.params.id, req.body);
      res.json(appointment);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const appointment = await appointmentsService.updateStatus(req.params.id, status);
      res.json(appointment);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getByDateRange(req: Request, res: Response) {
    try {
      const { start, end } = req.query;
      const startDate = start ? new Date(start as string) : new Date();
      const endDate = end ? new Date(end as string) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const appointments = await appointmentsService.getByDateRange(startDate, endDate);
      res.json(appointments);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getTodayAppointments(_req: Request, res: Response) {
    try {
      const appointments = await appointmentsService.getTodayAppointments();
      res.json(appointments);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

export const appointmentsController = new AppointmentsController();
