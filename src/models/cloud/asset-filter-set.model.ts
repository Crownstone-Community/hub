import {hasMany, model, property} from '@loopback/repository';
import {AddTimestamps}            from '../bases/timestamp-mixin';
import {BaseEntity}               from '../bases/base-entity';
import {AssetFilter} from './asset-filter.model';

@model()
export class AssetFilterSet extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  cloudId: string;

  @property({type: 'number', required: true})
  masterVersion: number;

  @property({type: 'number', required: true})
  masterCRC: number;

  @hasMany(() => AssetFilter, {keyTo: 'filterSetId'})
  filters: AssetFilter[];
}
