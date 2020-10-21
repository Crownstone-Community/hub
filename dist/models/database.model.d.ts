import { Entity } from '@loopback/repository';
export declare class EnergyData extends Entity {
    constructor(data?: Partial<EnergyData>);
    id: string;
    version: number;
}
