"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookManager = void 0;
const DbReference_1 = require("../Data/DbReference");
const Logger_1 = require("../../Logger");
const topics_1 = require("../topics");
const HubEventBus_1 = require("../HubEventBus");
const request_1 = require("crownstone-cloud/dist/util/request");
const log = Logger_1.Logger(__filename);
class WebhookManager {
    constructor() {
        this.initialized = false;
        this.hooksByEvent = {};
        this.subscriptions = [];
    }
    init() {
        if (this.initialized === false) {
            this.initialized = true;
            for (let topic in topics_1.WebhookTopics) {
                this.subscriptions.push(HubEventBus_1.eventBus.on(topics_1.WebhookTopics[topic], (data) => {
                    this.evaluateHooks(topic, data);
                }));
            }
            this.refreshHooks();
        }
    }
    cleanup() {
        this.initialized = false;
        for (let unsub of this.subscriptions) {
            unsub();
        }
        this.subscriptions = [];
        this.hooksByEvent = {};
    }
    async refreshHooks() {
        try {
            let hooks = await DbReference_1.Dbs.webhooks.find();
            this.hooksByEvent = {};
            for (let hook of hooks) {
                if (this.hooksByEvent[hook.event] === undefined) {
                    this.hooksByEvent[hook.event] = [];
                }
                this.hooksByEvent[hook.event].push(hook);
            }
        }
        catch (e) {
            log.error("Failed to refresh hooks", e);
        }
    }
    mapData(incomingTopic, data) {
        switch (incomingTopic) {
            case topics_1.WebhookInternalTopics.__ASSET_REPORT:
                return { topic: topics_1.WebhookTopics.ASSET_REPORT, data };
            case topics_1.WebhookInternalTopics.__ASSET_TRACKING_UPDATE:
                return { topic: topics_1.WebhookTopics.ASSET_TRACKING, data: { type: "update", ...data } };
            case topics_1.WebhookInternalTopics.__ASSET_TRACKING_TIMEOUT:
                return { topic: topics_1.WebhookTopics.ASSET_TRACKING, data: { type: "timeout", ...data } };
        }
        return null;
    }
    evaluateHooks(incomingTopic, data) {
        let converted = this.mapData(incomingTopic, data);
        if (!converted) {
            return;
        }
        if (this.hooksByEvent[converted.topic]) {
            for (let listener of this.hooksByEvent[converted.topic]) {
                this.invoke(listener, converted.data);
            }
        }
    }
    async invoke(hook, data) {
        var _a;
        try {
            let headers = {};
            if (hook.apiKey) {
                headers[(_a = hook.apiKeyHeader) !== null && _a !== void 0 ? _a : "apiKey"] = hook.apiKey;
            }
            let payload = {
                event: hook.event,
                clientSecret: hook.clientSecret,
                data: data,
                timestamp: Date.now()
            };
            await request_1.req("POST", hook.endPoint, { headers: headers, json: payload });
        }
        catch (err) {
            log.error("Something went wrong during invocation of ", hook.id, err);
        }
    }
}
exports.WebhookManager = WebhookManager;
//# sourceMappingURL=WebhookManager.js.map