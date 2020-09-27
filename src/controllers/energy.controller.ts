// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';

import {Count, repository} from '@loopback/repository';
import {api, del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody} from '@loopback/rest';
import {EnergyDataProcessedRepository, EnergyDataRepository, UserRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {SecurityBindings} from '@loopback/security';
import {UserProfileDescription} from '../security/authentication-strategies/csToken-strategy';
import {SecurityTypes} from '../constants/Constants';

/**
 * This controller will echo the state of the hub.
 */
export class EnergyController {

  constructor(
    @repository(EnergyDataProcessedRepository) protected energyDataProcessedRepo: EnergyDataProcessedRepository,
    @repository(EnergyDataRepository) protected energyDataRepo: EnergyDataRepository,
  ) {}


  @get('/energyRange')
  @authenticate(SecurityTypes.sphere)
  async getEnergyData(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.number('crownstoneUID', {required:true}) crownstoneUID: number,
    @param.query.dateTime('from', {required:false}) from: Date,
    @param.query.dateTime('until', {required:false}) until: Date,
    @param.query.number('limit', {required:true}) limit: number,
  ) {
    let filters : any[] = [{stoneUID:crownstoneUID}];
    if (from)  { filters.push({timestamp:{gte: from}})  }
    if (until) { filters.push({timestamp:{lte: until}}) }

    let query = {where: {and: filters}, limit: limit, fields:{energyUsage: true, timestamp: true}, order: 'timestamp ASC'}
    // @ts-ignore
    return await this.energyDataProcessedRepo.find(query)
  }


  @get('/energyAvailability')
  @authenticate(SecurityTypes.sphere)
  async getEnergyAvailability(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) : Promise<{crownstoneUID: number, count: number}[]> {
    let collection = this.energyDataProcessedRepo.dataSource.connector?.collection("EnergyDataProcessed");
    if (collection) {
      let result = [];
      let uids = await collection.distinct('stoneUID');
      for (let i = 0; i < uids.length; i++) {
        let count = await this.energyDataProcessedRepo.count({stoneUID: uids[i]});
        result.push({crownstoneUID: uids[i] as number, count: count.count});
      }
      return result;
    }
    throw new HttpErrors.InternalServerError("Could not get distinct list");
  }

  @del('/energyFromCrownstone')
  @authenticate(SecurityTypes.admin)
  async deleteStoneEnergy(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.number('crownstoneUID', {required:true}) crownstoneUID: number,
  ) : Promise<Count> {
   return this.energyDataProcessedRepo.deleteAll({stoneUID: crownstoneUID})
  }

  @del('/energyData')
  @authenticate(SecurityTypes.admin)
  async deleteAllEnergyData(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) : Promise<Count> {
    let count = await this.energyDataProcessedRepo.deleteAll()
    await this.energyDataRepo.deleteAll()
    return count;
  }



}
