import {addLoggingRoutes} from './LoggingRoutes';
import {addVisualizationRoutes} from './VisualizationRoutes';
import {CrownstoneHubApplication} from '../application';
import express from 'express';
import {addDeveloperRoutes} from './DeveloperRoutes';

export function applyCustomRoutes(app : express.Application, loopbackApp: CrownstoneHubApplication) {
  addLoggingRoutes(app, loopbackApp);
  addDeveloperRoutes(app, loopbackApp);
  addVisualizationRoutes(app, loopbackApp);
}