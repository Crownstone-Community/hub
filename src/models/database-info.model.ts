import { Entity, model, property } from '@loopback/repository';

@model()
export class DatabaseInfo extends Entity {
  constructor(data?: Partial<DatabaseInfo>) {
    super(data);
  }

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'number', required: true})
  version: number;

}
