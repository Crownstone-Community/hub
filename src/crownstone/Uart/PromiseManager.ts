const LOG = require('debug-level')('crownstone-hub-PromiseManager');
const PROMISE_MANAGER_FALLBACK_TIMEOUT = 5000;

interface PromiseContainer {
  promise: () => Promise<any>,
  resolve: (result: any) => any,
  reject: (err: any) => void,
  message: string,
  completed: boolean,
  timeout: number
}

export class PromiseManager {
  pendingPromises : any;
  promiseInProgress : any;
  clearPendingPromiseTimeout : any;

  constructor() {
    this.pendingPromises = [];
    this.promiseInProgress = undefined;
    this.clearPendingPromiseTimeout = undefined;
  }

  register(promise : () => Promise<any>, message= "" , customTimeoutMs: number = PROMISE_MANAGER_FALLBACK_TIMEOUT) : Promise<any> {
    return this._register(promise, message, false, customTimeoutMs);
  }

  registerPriority(promise : () => Promise<any>, message= "" , customTimeoutMs: number = PROMISE_MANAGER_FALLBACK_TIMEOUT) : Promise<any> {
    // this can interrupt any BatchCommandHandler pending low priority processes.
    return this._register(promise, message, true, customTimeoutMs);
  }

  _register(promise : () => Promise<any>, message= "" , priorityCommand : boolean = false, timeout: number = PROMISE_MANAGER_FALLBACK_TIMEOUT) : Promise<any> {
    LOG.info("HubPromiseManager: registered promise in manager");
    return new Promise((resolve, reject) => {
      let container = { promise: promise, resolve: resolve, reject: reject, message: message, completed: false, timeout: timeout };
      if (this.promiseInProgress === undefined) {
        this.executePromise(container);
      }
      else {
        if (priorityCommand === true) {
          LOG.info('HubPromiseManager: adding to top of stack: ', message, ' currentlyPending:', this.promiseInProgress.message);
          this.pendingPromises.unshift(container);
        }
        else {
          LOG.info('HubPromiseManager: adding to stack: ', message, ' currentlyPending:', this.promiseInProgress.message);
          this.pendingPromises.push(container);
        }
      }
    })
  }

  executePromise(promiseContainer: PromiseContainer) {
    LOG.info('HubPromiseManager: executing promise: ', promiseContainer.message);
    this.promiseInProgress = promiseContainer;

    // This timeout is a fallback to ensure the promise manager will not get jammed with a single promise.
    // It guarantees uniqueness
    this.clearPendingPromiseTimeout = setTimeout(() => {
      LOG.warn('HubPromiseManager: Forced timeout after', PROMISE_MANAGER_FALLBACK_TIMEOUT*0.001 , 'seconds for', promiseContainer.message);
      this.clearPendingPromiseTimeout = null;
      this.finalize(promiseContainer, () => {
        promiseContainer.reject('Forced timeout after ' + PROMISE_MANAGER_FALLBACK_TIMEOUT*0.001 + ' seconds.');
      });
    }, promiseContainer.timeout);

    promiseContainer.promise()
      .then((data : any) => {
        LOG.info("HubPromiseManager: resolved: ", promiseContainer.message);
        this.finalize(promiseContainer, () => { promiseContainer.resolve(data); });
      })
      .catch((err : any) => {
        LOG.warn("HubPromiseManager: rejected: ", promiseContainer.message);
        this.finalize(promiseContainer, () => { promiseContainer.reject(err); });
      })
  }


  /**
   * This method makes sure the promise is only resolved or rejected once! This also makes sure the moveOn() method
   * is not invoked multiple times.
   * @param promiseContainer
   * @param callback
   */
  finalize(promiseContainer : PromiseContainer, callback : () => void) {
    if (typeof this.clearPendingPromiseTimeout === 'function') {
      this.clearPendingPromiseTimeout();
      this.clearPendingPromiseTimeout = null;
    }
    if (promiseContainer.completed === false) {
      promiseContainer.completed = true;
      callback();
      this.moveOn();
    }
  }

  moveOn() {
    this.promiseInProgress = undefined;
    this.getNextPromise()
  }

  getNextPromise() {
    LOG.debug('HubPromiseManager: get next');
    if (this.pendingPromises.length > 0) {
      let nextPromise = this.pendingPromises[0];
      this.executePromise(nextPromise);
      this.pendingPromises.shift();
    }
  }
}
