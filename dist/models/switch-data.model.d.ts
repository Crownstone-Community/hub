import { Entity } from '@loopback/repository';
export declare class SwitchData extends Entity {
    constructor(data?: Partial<SwitchData>);
    id: string;
    stoneUID: number;
    switchState: number;
    timestamp: Date;
}
