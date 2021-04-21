import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {Asset} from '../asset.model';
import {AddTimestamps} from '../../bases/timestamp-mixin';
import {BaseEntity} from '../../bases/base-entity';

@model()
export class AssetPresence extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'boolean', required: true})
  inSphere: boolean;

  // @property.array('string')
  // nearestStones: string[]
  //
  // @belongsTo(() => Location)
  // locationId: string;

  @belongsTo(() => Asset)
  assetId: string;
}
