import {EnergyDataRepository, HubRepository, PowerDataRepository, SwitchDataRepository, UserRepository} from '../../repositories';

class DbReferenceClass {
  hub      : HubRepository
  power    : PowerDataRepository
  energy   : EnergyDataRepository
  switches : SwitchDataRepository
  user     : UserRepository
}
export const DbRef = new DbReferenceClass();