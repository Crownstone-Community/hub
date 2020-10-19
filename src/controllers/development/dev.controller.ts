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
    if (CrownstoneHub.mesh.energy.energyIsProcessing) {
      throw new HttpErrors.PreconditionFailed("Energy is being processed at the moment. Please try again later.")
    }
    CrownstoneHub.mesh.energy.pauseProcessing(120);
    await this.energyDataProcessedRepo.deleteAll();
    await this.energyDataRepo.updateAll({processed:false});
    setTimeout(() => {
      CrownstoneHub.mesh.energy.processMeasurements();
      CrownstoneHub.mesh.energy.resumeProcessing();
    });
  }

  @get('/reprocessingStatus')
  @authenticate(SecurityTypes.admin)
  async reprocessingStatus(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) : Promise<any> {
    if (CrownstoneHub.mesh.energy.energyIsProcessing) {
      let totalCount = await this.energyDataRepo.count();
      let processedCount = await this.energyDataRepo.count({processed: true});
      return {
        status: "IN_PROGRESS",
        percentage: 100*(processedCount.count / totalCount.count)
      };
    }
    else {
      return {
        status: "FINISHED",
        percentage: 100
      };
    }
  }
}
