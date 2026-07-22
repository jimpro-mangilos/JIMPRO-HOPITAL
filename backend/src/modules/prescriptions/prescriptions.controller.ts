import { Request, Response } from 'express';
import { prescriptionsService } from './prescriptions.service';

export class PrescriptionsController {
  async create(req: Request, res: Response) {
    try {
      const prescription = await prescriptionsService.create(req.body);
      res.status(201).json(prescription);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await prescriptionsService.findAll(page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const prescription = await prescriptionsService.findById(req.params.id);
      res.json(prescription);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const prescription = await prescriptionsService.update(req.params.id, req.body);
      res.json(prescription);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async dispense(req: Request, res: Response) {
    try {
      const prescription = await prescriptionsService.dispense(req.params.id, req.user!.userId);
      res.json(prescription);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getByConsultation(req: Request, res: Response) {
    try {
      const prescriptions = await prescriptionsService.getByConsultation(req.params.consultationId);
      res.json(prescriptions);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

export const prescriptionsController = new PrescriptionsController();
