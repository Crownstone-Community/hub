// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {del, get, getModelSchemaRef, HttpErrors, oas, param, post, requestBody, Response, RestBindings} from '@loopback/rest';
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {SecurityBindings} from '@loopback/security';
import {UserProfileDescription} from '../../security/authentication-strategies/csToken-strategy';
import {SecurityTypes} from '../../constants/Constants';
import {repository} from '@loopback/repository';
import {EnergyDataProcessedRepository, EnergyDataRepository} from '../../repositories';
import {CrownstoneHub} from '../../crownstone/CrownstoneHub';


export class DevController {

  constructor(
    @repository(EnergyDataProcessedRepository) protected energyDataProcessedRepo: EnergyDataProcessedRepository,
    @repository(EnergyDataRepository) protected energyDataRepo: EnergyDataRepository,
  ) {}


  @get('/rawEnergyRange')
  @authenticate(SecurityTypes.admin)
  async getRawEnergyData(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.number('crownstoneUID', {required:true}) crownstoneUID: number,
    @param.query.dateTime('from', {required:false}) from: Date,
    @param.query.dateTime('until', {required:false}) until: Date,
    @param.query.number('limit', {required:true}) limit: number,
  ) {
    let filters : any[] = [{stoneUID:crownstoneUID}];
    if (from)  { filters.push({timestamp:{gte: from}})  }
    if (until) { filters.push({timestamp:{lte: until}}) }

    let query = {where: {and: filters}, limit: limit, order: 'timestamp ASC'}
    // @ts-ignore
    return await this.energyDataRepo.find(query)
  }


  @get('/reprocessEnergyData')
  @authenticate(SecurityTypes.admin)
  async reprocessEnergyData(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) {
    await this.energyDataProcessedRepo.deleteAll();
    await this.energyDataRepo.updateAll({processed:false});
    await CrownstoneHub.mesh.energy.processMeasurements()

  }
}
