"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseManager = void 0;
const debug = require("debug")("promiseManager");
const PROMISE_MANAGER_FALLBACK_TIMEOUT = 5000;
class PromiseManager {
    constructor() {
        this.pendingPromises = [];
        this.promiseInProgress = undefined;
        this.clearPendingPromiseTimeout = undefined;
    }
    register(promise, message = "", customTimeoutMs = PROMISE_MANAGER_FALLBACK_TIMEOUT) {
        return this._register(promise, message, false, customTimeoutMs);
    }
    registerPriority(promise, message = "", customTimeoutMs = PROMISE_MANAGER_FALLBACK_TIMEOUT) {
        // this can interrupt any BatchCommandHandler pending low priority processes.
        return this._register(promise, message, true, customTimeoutMs);
    }
    _register(promise, message = "", priorityCommand = false, timeout = PROMISE_MANAGER_FALLBACK_TIMEOUT) {
        debug("BlePromiseManager: registered promise in manager");
        return new Promise((resolve, reject) => {
            let container = { promise: promise, resolve: resolve, reject: reject, message: message, completed: false, timeout: timeout };
            if (this.promiseInProgress === undefined) {
                this.executePromise(container);
            }
            else {
                if (priorityCommand === true) {
                    debug('BlePromiseManager: adding to top of stack: ', message, ' currentlyPending:', this.promiseInProgress.message);
                    this.pendingPromises.unshift(container);
                }
                else {
                    debug('BlePromiseManager: adding to stack: ', message, ' currentlyPending:', this.promiseInProgress.message);
                    this.pendingPromises.push(container);
                }
            }
        });
    }
    executePromise(promiseContainer) {
        debug('BlePromiseManager: executing promise: ', promiseContainer.message);
        this.promiseInProgress = promiseContainer;
        // This timeout is a fallback to ensure the promise manager will not get jammed with a single promise.
        // It guarantees uniqueness
        this.clearPendingPromiseTimeout = setTimeout(() => {
            debug('BlePromiseManager: Forced timeout after', PROMISE_MANAGER_FALLBACK_TIMEOUT * 0.001, 'seconds for', promiseContainer.message);
            this.clearPendingPromiseTimeout = null;
            this.finalize(promiseContainer, () => {
                promiseContainer.reject('Forced timeout after ' + PROMISE_MANAGER_FALLBACK_TIMEOUT * 0.001 + ' seconds.');
            });
        }, promiseContainer.timeout);
        promiseContainer.promise()
            .then((data) => {
            debug("BlePromiseManager: resolved: ", promiseContainer.message);
            this.finalize(promiseContainer, () => { promiseContainer.resolve(data); });
        })
            .catch((err) => {
            debug("BlePromiseManager: rejected: ", promiseContainer.message);
            this.finalize(promiseContainer, () => { promiseContainer.reject(err); });
        });
    }
    /**
     * This method makes sure the promise is only resolved or rejected once! This also makes sure the moveOn() method
     * is not invoked multiple times.
     * @param promiseContainer
     * @param callback
     */
    finalize(promiseContainer, callback) {
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
        this.getNextPromise();
    }
    getNextPromise() {
        debug('BlePromiseManager: get next');
        if (this.pendingPromises.length > 0) {
            let nextPromise = this.pendingPromises[0];
            this.executePromise(nextPromise);
            this.pendingPromises.shift();
        }
    }
}
exports.PromiseManager = PromiseManager;
//# sourceMappingURL=PromiseManager.js.map