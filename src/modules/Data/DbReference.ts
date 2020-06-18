import {HubRepository} from '../../repositories/hub.repository';
import {PowerDataRepository} from '../../repositories/power-data.repository';
import {EnergyDataRepository} from '../../repositories/energy-data.repository';

class DbReferenceClass {
  hub    : HubRepository
  power  : PowerDataRepository
  energy : EnergyDataRepository
}
export const DbRef = new DbReferenceClass();