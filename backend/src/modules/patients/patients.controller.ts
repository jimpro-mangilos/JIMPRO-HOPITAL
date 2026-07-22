import { Request, Response } from 'express';
import { patientsService } from './patients.service';

export class PatientsController {
  async create(req: Request, res: Response) {
    try {
      const patient = await patientsService.create(req.body);
      res.status(201).json(patient);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await patientsService.findAll(page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const patient = await patientsService.findById(req.params.id);
      res.json(patient);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const patient = await patientsService.update(req.params.id, req.body);
      res.json(patient);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const patient = await patientsService.delete(req.params.id);
      res.json({ message: 'Patient désactivé.', patient });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const results = await patientsService.search(req.query);
      res.json(results);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const history = await patientsService.getPatientHistory(req.params.id);
      res.json(history);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

export const patientsController = new PatientsController();
