import { Count, DataObject, DefaultCrudRepository, Entity, Options, Where } from "@loopback/repository";
export declare class TimestampedCrudRepository<E extends Entity & {
    createdAt?: Date;
    updatedAt?: Date;
}, ID> extends DefaultCrudRepository<E, ID> {
    create(entity: DataObject<E>, options?: Options): Promise<E>;
    createAll(entities: DataObject<E>[], options?: Options): Promise<E[]>;
    updateAll(data: DataObject<E>, where?: Where<E>, options?: Options): Promise<Count>;
    replaceById(id: ID, data: DataObject<E>, options?: Options): Promise<void>;
    __handleId(entity: DataObject<E>): void;
    __updateTimes(entity: DataObject<E>, options?: Options): void;
}
