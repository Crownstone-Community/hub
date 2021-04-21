import {hasMany, model, property} from '@loopback/repository';
import {AddTimestamps}            from '../bases/timestamp-mixin';
import {BaseEntity}               from '../bases/base-entity';
import {Filter} from './filter.model';

@model()
export class FilterSet extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  cloudId: string;

  @property({type: 'number', required: true})
  masterVersion: number;

  @hasMany(() => Filter, {keyTo: 'filterSetId'})
  filters: Filter[];
}
