"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseManager = void 0;
const Logger_1 = require("../../Logger");
const log = (0, Logger_1.Logger)(__filename);
const PROMISE_MANAGER_FALLBACK_TIMEOUT = 5000;
class PromiseManager {
    constructor() {
        this.pendingPromises = [];
        this.promiseInProgress = null;
        this.clearPendingPromiseTimeout = null;
    }
    register(promise, message = "", customTimeoutMs = PROMISE_MANAGER_FALLBACK_TIMEOUT) {
        return this._register(promise, message, false, customTimeoutMs);
    }
    registerPriority(promise, message = "", customTimeoutMs = PROMISE_MANAGER_FALLBACK_TIMEOUT) {
        // this can interrupt any BatchCommandHandler pending low priority processes.
        return this._register(promise, message, true, customTimeoutMs);
    }
    _register(promise, message = "", priorityCommand = false, timeout = PROMISE_MANAGER_FALLBACK_TIMEOUT) {
        log.info("HubPromiseManager: registered promise in manager");
        return new Promise((resolve, reject) => {
            let container = { promise: promise, resolve: resolve, reject: reject, message: message, completed: false, timeout: timeout };
            if (this.promiseInProgress === null) {
                this.executePromise(container);
            }
            else {
                if (priorityCommand === true) {
                    log.info('HubPromiseManager: adding to top of stack: ', message, ' currentlyPending:', this.promiseInProgress.message);
                    this.pendingPromises.unshift(container);
                }
                else {
                    log.info('HubPromiseManager: adding to stack: ', message, ' currentlyPending:', this.promiseInProgress.message);
                    this.pendingPromises.push(container);
                }
            }
        });
    }
    executePromise(promiseContainer) {
        log.info('HubPromiseManager: executing promise: ', promiseContainer.message);
        this.promiseInProgress = promiseContainer;
        // This timeout is a fallback to ensure the promise manager will not get jammed with a single promise.
        // It guarantees uniqueness
        this.clearPendingPromiseTimeout = setTimeout(() => {
            log.warn('HubPromiseManager: Forced timeout after', PROMISE_MANAGER_FALLBACK_TIMEOUT * 0.001, 'seconds for', promiseContainer.message);
            this.clearPendingPromiseTimeout = null;
            this.finalize(promiseContainer, () => {
                promiseContainer.reject('Forced timeout after ' + PROMISE_MANAGER_FALLBACK_TIMEOUT * 0.001 + ' seconds.');
            });
        }, promiseContainer.timeout);
        promiseContainer.promise()
            .then((data) => {
            if (promiseContainer.completed) {
                return;
            }
            log.info("HubPromiseManager: resolved: ", promiseContainer.message);
            this.finalize(promiseContainer, () => { promiseContainer.resolve(data); });
        })
            .catch((err) => {
            if (promiseContainer.completed) {
                return;
            }
            log.warn("HubPromiseManager: rejected: ", promiseContainer.message);
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
        clearTimeout(this.clearPendingPromiseTimeout);
        this.clearPendingPromiseTimeout = null;
        if (promiseContainer.completed === false) {
            promiseContainer.completed = true;
            callback();
            this.moveOn();
        }
    }
    moveOn() {
        this.promiseInProgress = null;
        this.getNextPromise();
    }
    getNextPromise() {
        log.debug('HubPromiseManager: get next');
        if (this.pendingPromises.length > 0) {
            let nextPromise = this.pendingPromises[0];
            this.executePromise(nextPromise);
            this.pendingPromises.shift();
        }
    }
}
exports.PromiseManager = PromiseManager;
//# sourceMappingURL=PromiseManager.js.map