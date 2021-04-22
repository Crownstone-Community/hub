import {belongsTo, hasOne, model, property} from '@loopback/repository';
import {AddTimestamps}                          from '../bases/timestamp-mixin';
import {BaseEntity}                             from '../bases/base-entity';
import {InputMacAddress} from './filterSubModels/input-mac-address.model';
import {InputAdData} from './filterSubModels/input-ad-data.model';
import {OutputDescriptionReport} from './filterSubModels/output-description-report.model';
import {OutputDescriptionTrackMacAddress} from './filterSubModels/output-description-track-mac-address.model';
import {OutputDescriptionTrackAdData} from './filterSubModels/output-description-track-ad-data.model';
import {AssetFilter} from './asset-filter.model';
// import {AssetPresence} from './filterSubModels/asset-presence.model';

@model()
export class Asset extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  name: string;

  @property({type: 'string'})
  description: string;

  @property({type: 'string'})
  type: string;

  @property({type: 'string'})
  cloudId: string;

  @property({required: true})
  inputData: InputMacAddress |
             InputAdData;

  @property({required: true})
  outputDescription: OutputDescriptionReport          |
                     OutputDescriptionTrackMacAddress |
                     OutputDescriptionTrackAdData;

  @property({required: true})
  data: string // hexString

  // @hasOne(() => AssetPresence, {name: 'presence', keyTo:'assetId', keyFrom:'presenceId'})
  // presence: AssetPresence;

  @belongsTo(() => AssetFilter, {name:'filter'})
  filterId: string;



}
