import {addLoggingRoutes} from './LoggingRoutes';
import {addVisualizationRoutes} from './VisualizationRoutes';
import {CrownstoneHubApplication} from '../application';
import express from 'express';
import {addDebugRoutes} from './DebugRoutes';

export function applyCustomRoutes(app : express.Application, loopbackApp: CrownstoneHubApplication) {
  addLoggingRoutes(app, loopbackApp);
  addDebugRoutes(app, loopbackApp);
  addVisualizationRoutes(app, loopbackApp);
}