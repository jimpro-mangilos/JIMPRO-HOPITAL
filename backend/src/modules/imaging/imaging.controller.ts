import { Request, Response } from 'express';
import { imagingService } from './imaging.service';

export class ImagingController {
  async createRequest(req: Request, res: Response) {
    try {
      const request = await imagingService.createRequest(req.body);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findAllRequests(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await imagingService.findAllRequests(page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findRequestById(req: Request, res: Response) {
    try {
      const request = await imagingService.findRequestById(req.params.id);
      res.json(request);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async updateRequestStatus(req: Request, res: Response) {
    try {
      const { status, clinicalInfo } = req.body;
      const request = await imagingService.updateRequestStatus(req.params.id, status, clinicalInfo);
      res.json(request);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getByPatient(req: Request, res: Response) {
    try {
      const requests = await imagingService.getByPatient(req.params.patientId);
      res.json(requests);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async createResult(req: Request, res: Response) {
    try {
      const result = await imagingService.createResult(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findAllResults(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await imagingService.findAllResults(page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

export const imagingController = new ImagingController();
