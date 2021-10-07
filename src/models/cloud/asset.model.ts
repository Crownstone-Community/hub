import {belongsTo,  model, property}      from '@loopback/repository';
import {AddTimestamps}                    from '../bases/timestamp-mixin';
import {BaseEntity}                       from '../bases/base-entity';
import {AssetFilter}                      from './asset-filter.model';
import {FormatMaskedAdData}               from './filterSubModels/format-masked-ad-data.model';
import {FormatFullAdData}                 from './filterSubModels/format-full-ad-data.model';
import {FormatMacAddress}                 from './filterSubModels/format-mac-address.model';
import {FilterInputManufacturerId}        from './filterSubModels/filter-input-manufacturer-id';
import {OutputDescription_mac_report}     from './filterSubModels/output-description-mac-report.model';
import {OutputDescription_assetId_report} from './filterSubModels/output-description-assetId-report.model';
import {OutputDescription_no_output}      from './filterSubModels/output-description-no-output.model';

export type filterFormat            = FormatMacAddress | FormatFullAdData | FormatMaskedAdData | FilterInputManufacturerId;
export type filterOutputDescription = OutputDescription_assetId_report | OutputDescription_mac_report | OutputDescription_no_output


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

  @property({type: 'boolean', default: false})
  exclude: boolean;

  @property({type: 'string'})
  desiredFilterType: filterType_t;

  @property({required: true})
  inputData: filterFormat

  @property({required: true})
  outputDescription: filterOutputDescription

  @property({required: true})
  data: string // hexString

  @belongsTo(() => AssetFilter, {name:'filter'})
  filterId: string;



}
