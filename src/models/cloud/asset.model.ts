import {belongsTo,  model, property} from '@loopback/repository';
import {AddTimestamps}               from '../bases/timestamp-mixin';
import {BaseEntity}                  from '../bases/base-entity';
import {AssetFilter} from './asset-filter.model';
import {FormatMaskedAdData} from './filterSubModels/format-masked-ad-data.model';
import {FormatAdData} from './filterSubModels/format-ad-data.model';
import {FormatMacAddress} from './filterSubModels/format-mac-address.model';
import {OutputDescription_shortId_track} from './filterSubModels/output-description-shortId-track.model';
import {OutputDescription_mac_report} from './filterSubModels/output-description-mac-report.model';

export type filterFormat = FormatMacAddress | FormatAdData | FormatMaskedAdData;
export type filterOutputDescription = OutputDescription_shortId_track | OutputDescription_mac_report


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

  @property({type: 'boolean', required: true, default: false})
  committed: boolean;

  @property({type: 'boolean', required: true, default: false})
  markedForDeletion: boolean;

  @property({type: 'number'})
  profileId: number;

  @property({required: true})
  inputData: filterFormat

  @property({required: true})
  outputDescription: filterOutputDescription

  @property({required: true})
  data: string // hexString

  // @hasOne(() => AssetPresence, {name: 'presence', keyTo:'assetId', keyFrom:'presenceId'})
  // presence: AssetPresence;

  @belongsTo(() => AssetFilter, {name:'filter'})
  filterId: string;



}
