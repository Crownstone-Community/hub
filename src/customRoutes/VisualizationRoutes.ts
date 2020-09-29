import express, {Request, Response} from 'express';
import path from "path";
import {CrownstoneHubApplication} from '../application';


export function addVisualizationRoutes(app : express.Application, loopbackApp: CrownstoneHubApplication) {
  app.get('/energy',async (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../public/energyViewer/index.html'));
  });
}