import express, {Request, Response} from 'express';
import {extractToken} from '../security/authentication-strategies/csToken-strategy';
import {checkAccessToken} from '../services';
import {DbRef} from '../crownstone/Data/DbReference';
import {getHubConfig, storeHubConfig} from '../util/ConfigUtil';
import {CrownstoneHubApplication, updateControllersBasedOnConfig} from '../application';
import {HttpErrors} from '@loopback/rest';

export function addDebugRoutes(app : express.Application, loopbackApp: CrownstoneHubApplication) {

}