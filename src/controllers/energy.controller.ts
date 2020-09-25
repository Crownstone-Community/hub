// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';

import {repository} from '@loopback/repository';
import {api, del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody} from '@loopback/rest';
import {EnergyDataProcessedRepository, UserRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';

/**
 * This controller will echo the state of the hub.
 */
export class EnergyController {

  constructor(
    @repository(EnergyDataProcessedRepository) protected energyDataProcessedRepo: EnergyDataProcessedRepository,
  ) {}


  @get('/energyRange')
  @authenticate('csToken')
  async getEnergyData(
    // @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
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
  @authenticate('csToken')
  async getEnergyAvailability(
    // @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
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

}
