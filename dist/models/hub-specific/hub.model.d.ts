import { Entity } from '@loopback/repository';
export declare class Hub extends Entity {
    id: string;
    name: string;
    token: string;
    uartKey: string;
    accessToken: string;
    accessTokenExpiration: Date;
    cloudId: string;
    sphereId: string;
    linkedStoneId: string | null;
}
