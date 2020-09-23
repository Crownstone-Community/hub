import Timeout = NodeJS.Timeout;
import {Logger} from '../../Logger';
const log = Logger(__filename);


export class Timekeeper {

  timeInterval : Timeout | null;
  hubReference: CrownstoneHub

  constructor(hub : CrownstoneHub) {
    this.hubReference = hub;
  }

  init() {
    this.stop();
    this.timeInterval = setInterval(() => {
      this.setTime();
    }, 30*60*1000); // every 30 minutes;

    // set the time initially
    this.setTime();
  }

  async setTime() {
    try {
      await this.hubReference.uart.uart.setTime();
    }
    catch (e) {
      log.warn("Error when trying to set time", e);
    }
  }

  stop() {
    if (this.timeInterval) {
      clearTimeout(this.timeInterval)
    }
  }
}