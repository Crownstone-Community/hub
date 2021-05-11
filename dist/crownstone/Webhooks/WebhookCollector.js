"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookCollector = void 0;
const HubEventBus_1 = require("../HubEventBus");
const topics_1 = require("../topics");
const AssetReportWebhookData_1 = require("./data/AssetReportWebhookData");
class WebhookCollector {
    constructor(hook, invocationCallback) {
        this.collectedData = [];
        this.subscriptions = [];
        this._batched = false;
        this._invocationCallback = invocationCallback;
        this._hook = hook;
        if (hook.batchTimeSeconds && hook.batchTimeSeconds > 0) {
            this._batched = true;
            this._interval = setInterval(() => {
                this._invocationCallback(this._getData());
            }, hook.batchTimeSeconds * 1000);
        }
        this._setListeners();
    }
    _setListeners() {
        this._removeListeners();
        switch (this._hook.event) {
            case 'ASSET_REPORT':
                this.subscriptions.push(HubEventBus_1.eventBus.on(topics_1.WebhookInternalTopics.__ASSET_REPORT, (data) => {
                    this.load(topics_1.WebhookInternalTopics.__ASSET_REPORT, data);
                }));
                break;
            case 'ASSET_TRACKING':
                // TODO: implement
                break;
        }
    }
    load(topic, data) {
        let dataClass = new AssetReportWebhookData_1.AssetReportWebhookData(data);
        if (!this._batched) {
            this._invocationCallback([dataClass]);
        }
        else {
            this.collectedData.push(dataClass);
        }
    }
    _getData() {
        let data = this.collectedData;
        this.collectedData = [];
        return data;
    }
    async wrapUp() {
        clearInterval(this._interval);
        if (this.collectedData.length > 0) {
            await this._invocationCallback(this._getData());
        }
        this.cleanup();
    }
    _removeListeners() {
        for (let unsub of this.subscriptions) {
            unsub();
        }
        this.subscriptions = [];
    }
    cleanup() {
        this._removeListeners();
        this.collectedData = [];
        clearInterval(this._interval);
    }
}
exports.WebhookCollector = WebhookCollector;
//# sourceMappingURL=WebhookCollector.js.map