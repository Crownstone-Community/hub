import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {AddTimestamps}                          from '../bases/timestamp-mixin';
import {BaseEntity}                             from '../bases/base-entity';
import {InputMacAddress} from './filterSubModels/input-mac-address.model';
import {InputAdData} from './filterSubModels/input-ad-data.model';
import {OutputDescriptionReport} from './filterSubModels/output-description-report.model';
import {OutputDescriptionTrackMacAddress} from './filterSubModels/output-description-track-mac-address.model';
import {OutputDescriptionTrackAdData} from './filterSubModels/output-description-track-ad-data.model';
import {Asset} from './asset.model';
import {FilterSet} from './filter-set.model';

@model()
export class Filter extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  cloudId: string;

  @property({type: 'number', required: true})
  filterVersion: number;

  @property({type: 'number', required: true})
  filterId: number;

  @property({type: 'string', required: true})
  filterCRC: string;

  @property({required: true})
  inputData: InputMacAddress |
             InputAdData;

  @property({required: true})
  outputDescription: OutputDescriptionReport          |
                     OutputDescriptionTrackMacAddress |
                     OutputDescriptionTrackAdData;

  @hasMany(() => Asset, {keyTo: 'filterId'})
  assets: Asset[];

  @belongsTo(() => FilterSet, {name:'filterSetId'})
  filterSetId: string;
}
