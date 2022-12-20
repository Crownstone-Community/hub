import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { SphereFeature } from '../../models/hub-specific/sphere-feature.model';
export declare class SphereFeatureRepository extends DefaultCrudRepository<SphereFeature, typeof SphereFeature.prototype.id> {
    protected datasource: juggler.DataSource;
    constructor(datasource: juggler.DataSource);
}
