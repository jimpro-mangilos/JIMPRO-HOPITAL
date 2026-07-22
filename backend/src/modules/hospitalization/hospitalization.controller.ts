import { Request, Response } from 'express';
import { hospitalizationService } from './hospitalization.service';

export class HospitalizationController {
  // Wards
  async findAllWards(_req: Request, res: Response) {
    try { res.json(await hospitalizationService.findAllWards()); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async createWard(req: Request, res: Response) {
    try { res.status(201).json(await hospitalizationService.createWard(req.body)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async findWardById(req: Request, res: Response) {
    try { res.json(await hospitalizationService.findWardById(req.params.id)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async updateWard(req: Request, res: Response) {
    try { res.json(await hospitalizationService.updateWard(req.params.id, req.body)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }

  // Rooms
  async findAllRooms(req: Request, res: Response) {
    try { res.json(await hospitalizationService.findAllRooms(req.query.wardId as string)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async createRoom(req: Request, res: Response) {
    try { res.status(201).json(await hospitalizationService.createRoom(req.body)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async findRoomById(req: Request, res: Response) {
    try { res.json(await hospitalizationService.findRoomById(req.params.id)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async updateRoom(req: Request, res: Response) {
    try { res.json(await hospitalizationService.updateRoom(req.params.id, req.body)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }

  // Beds
  async findAllBeds(req: Request, res: Response) {
    try { res.json(await hospitalizationService.findAllBeds(req.query.roomId as string)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async createBed(req: Request, res: Response) {
    try { res.status(201).json(await hospitalizationService.createBed(req.body)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async findBedById(req: Request, res: Response) {
    try { res.json(await hospitalizationService.findBedById(req.params.id)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async updateBed(req: Request, res: Response) {
    try { res.json(await hospitalizationService.updateBed(req.params.id, req.body)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async getBedAvailability(_req: Request, res: Response) {
    try { res.json(await hospitalizationService.getBedAvailability()); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }

  // Hospitalizations
  async findAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      res.json(await hospitalizationService.findAll(page, limit));
    } catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async findById(req: Request, res: Response) {
    try { res.json(await hospitalizationService.findById(req.params.id)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async admit(req: Request, res: Response) {
    try { res.status(201).json(await hospitalizationService.admit(req.body)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async discharge(req: Request, res: Response) {
    try { res.json(await hospitalizationService.discharge(req.params.id, req.body.notes)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async transfer(req: Request, res: Response) {
    try {
      const { newBedId, reason } = req.body;
      res.json(await hospitalizationService.transfer(req.params.id, newBedId, reason));
    } catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async getCurrentPatients(_req: Request, res: Response) {
    try { res.json(await hospitalizationService.getCurrentPatients()); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
}

export const hospitalizationController = new HospitalizationController();
