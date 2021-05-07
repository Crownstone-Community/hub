import {CloudManager} from './CloudManager';
import {Util} from '../../util/Util';


type CloudPromiseCallback = (cloud: CloudManager) => Promise<void>

class CloudCommandHandlerClass {

  manager: CloudManager;
  queue : CloudPromiseCallback[] = [];

  iterating = false;
  constructor() {}

  async iterate() {
    if (!this.iterating && this.manager && this.manager.initialized) {
      this.iterating = true;
      await this.iterateStep()
      this.iterating = false;
    }
  }

  async iterateStep() {
    if (this.queue.length > 0) {
      try {
        await this.queue[0](this.manager)
      }
      catch (e) {}

      this.queue.splice(0,1);
      await Util.wait(250);
      this.iterateStep()
    }
  }

  loadManager(manager : CloudManager) {
    this.manager = manager
  }

  addToQueue(cloudCall: CloudPromiseCallback) {
    this.queue.push(cloudCall);
    this.iterate();
  }

}

export const CloudCommandHandler = new CloudCommandHandlerClass();