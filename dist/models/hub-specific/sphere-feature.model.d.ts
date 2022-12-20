import { Entity } from '@loopback/repository';
export declare class SphereFeature extends Entity {
    id: string;
    name: string;
    data: string;
    enabled: boolean;
    from?: Date;
    to?: Date;
}
