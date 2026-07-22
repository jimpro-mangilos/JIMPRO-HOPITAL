import { Request, Response } from 'express';
import { consultationsService } from './consultations.service';

export class ConsultationsController {
  async create(req: Request, res: Response) {
    try {
      const consultation = await consultationsService.create(req.body);
      res.status(201).json(consultation);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async startFromAppointment(req: Request, res: Response) {
    try {
      const { appointmentId } = req.body;
      const consultation = await consultationsService.startFromAppointment(appointmentId, req.user!.userId);
      res.status(201).json(consultation);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await consultationsService.findAll(page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const consultation = await consultationsService.findById(req.params.id);
      res.json(consultation);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const consultation = await consultationsService.update(req.params.id, req.body);
      res.json(consultation);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getByPatient(req: Request, res: Response) {
    try {
      const consultations = await consultationsService.getByPatient(req.params.patientId);
      res.json(consultations);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getByStaff(req: Request, res: Response) {
    try {
      const consultations = await consultationsService.getByStaff(req.params.staffId);
      res.json(consultations);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

export const consultationsController = new ConsultationsController();
