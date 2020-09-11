import Timeout = NodeJS.Timeout;



export class Timekeeper {

  timeInterval : Timeout | null;
  hubReference: CrownstoneHub

  constructor(hub : CrownstoneHub) {
    this.hubReference = hub;
  }

  init() {
    this.stop();
    this.timeInterval = setInterval(() => {
      this.action();
    }, 30*60*1000); // every 30 minutes;

    // set the time initially
    this.action();
  }

  action() {
    // TODO: set time;
  }

  stop() {
    if (this.timeInterval) {
      clearTimeout(this.timeInterval)
    }
  }
}