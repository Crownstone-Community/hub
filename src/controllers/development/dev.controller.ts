// Uncomment these imports to begin using these cool features!
import {del, get, getModelSchemaRef, HttpErrors, oas, param, post, requestBody, Response, RestBindings} from '@loopback/rest';
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {SecurityBindings} from '@loopback/security';
import {UserProfileDescription} from '../../security/authentication-strategies/csToken-strategy';
import {SecurityTypes} from '../../constants/Constants';
import {repository} from '@loopback/repository';
import {EnergyDataProcessedRepository, EnergyDataRepository} from '../../repositories';
import {CrownstoneHub} from '../../crownstone/CrownstoneHub';
import {Logger} from '../../Logger';

const log = Logger(__filename);

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


  @post('/reprocessEnergyData')
  @authenticate(SecurityTypes.admin)
  async reprocessEnergyData(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) {
    if (CrownstoneHub.mesh.energy.energyIsProcessing) {
      throw new HttpErrors.PreconditionFailed("Energy is being processed at the moment. Please try again later.")
    }
    if (CrownstoneHub.mesh.energy.energyIsAggregating) {
      throw new HttpErrors.PreconditionFailed("Energy is being aggregated at the moment. Please try again later.")
    }
    CrownstoneHub.mesh.energy.pauseProcessing(3600);
    await this.energyDataProcessedRepo.deleteAll();
    await this.energyDataRepo.updateAll({processed:false});
    setTimeout(async() => {
      await CrownstoneHub.mesh.energy.processMeasurements();
      CrownstoneHub.mesh.energy.resumeProcessing();
    });
  }


  @post('/reprocessEnergyAggregates')
  @authenticate(SecurityTypes.admin)
  async reprocessEnergyAggregates(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) {
    log.debug("Invoked reprocessEnergyAggregates!")
    if (CrownstoneHub.mesh.energy.energyIsProcessing) {
      throw new HttpErrors.PreconditionFailed("Energy is being processed at the moment. Please try again later.")
    }
    if (CrownstoneHub.mesh.energy.energyIsAggregating) {
      throw new HttpErrors.PreconditionFailed("Energy is being aggregated at the moment. Please try again later.")
    }

    CrownstoneHub.mesh.energy.pauseAggregationProcessing(3600);
    log.debug("Deleting all aggregated items...")
    let count = await this.energyDataProcessedRepo.deleteAll({interval:{neq:'1m'}, stoneUID: 68});
    log.debug("Deleting all aggregated items... DONE", count);
    log.debug("Checking how many entries are left:")
    let remainderCount5m  = await this.energyDataProcessedRepo.count({interval:'5m', stoneUID:68});
    let remainderCount10m = await this.energyDataProcessedRepo.count({interval:'10m', stoneUID:68});
    let remainderCount15m = await this.energyDataProcessedRepo.count({interval:'15m', stoneUID:68});
    let remainderCount30m = await this.energyDataProcessedRepo.count({interval:'30m', stoneUID:68});
    let remainderCount1h  = await this.energyDataProcessedRepo.count({interval:'1h', stoneUID:68});
    let remainderCount3h  = await this.energyDataProcessedRepo.count({interval:'3h', stoneUID:68});
    let remainderCount6h  = await this.energyDataProcessedRepo.count({interval:'6h', stoneUID:68});
    let remainderCount12h = await this.energyDataProcessedRepo.count({interval:'12h', stoneUID:68});
    let remainderCount1d  = await this.energyDataProcessedRepo.count({interval:'1d', stoneUID:68});
    let remainderCount1w  = await this.energyDataProcessedRepo.count({interval:'1w', stoneUID:68});
    log.debug("All counts:",
      "\n5m",  remainderCount5m,
      "\n10m", remainderCount10m,
      "\n15m", remainderCount15m,
      "\n30m", remainderCount30m,
      "\n1h",  remainderCount1h,
      "\n3h",  remainderCount3h,
      "\n6h",  remainderCount6h,
      "\n12h", remainderCount12h,
      "\n1d",  remainderCount1d,
      "\n1w",  remainderCount1w,
    );


    setTimeout(async () => {
      await CrownstoneHub.mesh.energy.processAggregations();
      CrownstoneHub.mesh.energy.resumeAggregationProcessing();
    }, 1000);
    return count;
  }

  @get('/reprocessEnergyDataStatus')
  @authenticate(SecurityTypes.admin)
  async reprocessEnergyDataStatus(
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
  @get('/reprocessEnergyAggregatesStatus')
  @authenticate(SecurityTypes.admin)
  async reprocessEnergyAggregatesStatus(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) : Promise<any> {
    if (CrownstoneHub.mesh.energy.energyIsAggregating) {
      let totalCount     = await this.energyDataProcessedRepo.count({interval: '1m'});
      let processedCount = await this.energyDataProcessedRepo.count({interval: {neq:'1m'}});
      let assumedFactor = 1/5 + 1/10 + 1/15 + 1/30 + 1/60 + 1/(3*60) + 1/(6*60) + 1/(12*60) + 1/(24*60) + 1/(7*24*60);
      let expectedCount = totalCount.count * assumedFactor;
      return {
        status: "IN_PROGRESS",
        percentage: 100*(processedCount.count / expectedCount)
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
