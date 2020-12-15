import {CrownstoneHub} from '../CrownstoneHub';


class HubStatusManagerClass {
  encryptionRequired : boolean = false;
  clientHasBeenSetup : boolean = false;
  clientHasInternet : boolean = false;
  clientHasError    : boolean = false;

  async setStatus(hubStatus: HubStatusData) {
    this.encryptionRequired = hubStatus.encryptionRequired ?? this.encryptionRequired;
    this.clientHasBeenSetup = hubStatus.clientHasBeenSetup ?? this.clientHasBeenSetup;
    this.clientHasInternet  = hubStatus.clientHasInternet ?? this.clientHasInternet;
    this.clientHasError     = hubStatus.clientHasError ?? this.clientHasError;

    await CrownstoneHub.uart.connection.hub.setStatus(hubStatus);
  }

  async setActualStatus() {
    await CrownstoneHub.uart.connection.hub.setStatus({
      encryptionRequired: this.encryptionRequired,
      clientHasBeenSetup: this.clientHasBeenSetup,
      clientHasInternet:  this.clientHasInternet,
      clientHasError:     this.clientHasError,
    });
  }
}

export const HubStatusManager = new HubStatusManagerClass();