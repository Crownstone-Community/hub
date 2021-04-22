import { Entity } from '@loopback/repository';
export declare class SwitchData extends Entity {
    id: string;
    stoneUID: number;
    percentage: number;
    timestamp: Date;
}
