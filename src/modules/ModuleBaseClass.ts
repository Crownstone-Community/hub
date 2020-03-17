

export class ModuleBase {

  __initialized = false;
  ready = false;

  // DO NOT OVERLOAD THIS.
  init() {
    if (!this.__initialized === true) {
      this.initialize();
      this.__initialized = true;
    }
  }


  // This is the one to overload. It should set the ready boolean when it is finished.
  initialize() : Promise<void> {
    return Promise.resolve()
  }

}