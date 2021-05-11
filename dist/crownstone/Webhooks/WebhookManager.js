"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookManager = void 0;
const DbReference_1 = require("../data/DbReference");
const Logger_1 = require("../../Logger");
const request_1 = require("crownstone-cloud/dist/util/request");
const WebhookCollector_1 = require("./WebhookCollector");
const log = Logger_1.Logger(__filename);
class WebhookManager {
    constructor() {
        this.collectors = [];
    }
    init() {
        this.refreshHooks();
    }
    cleanup() {
        for (let collector of this.collectors) {
            collector.cleanup();
        }
    }
    async refreshHooks() {
        try {
            let hooks = await DbReference_1.Dbs.webhooks.find();
            for (let collector of this.collectors) {
                await collector.wrapUp();
            }
            this.collectors = [];
            for (let hook of hooks) {
                this.collectors.push(new WebhookCollector_1.WebhookCollector(hook, async (data) => {
                    await this.invoke(hook, data);
                }));
            }
        }
        catch (e) {
            log.error("Failed to refresh hooks", e);
        }
    }
    async invoke(hook, data) {
        if (data.length === 0) {
            return;
        }
        let headers = {};
        if (hook.apiKey) {
            headers[hook.apiKeyHeader ?? "apiKey"] = hook.apiKey;
        }
        let payload = {
            event: hook.event,
            clientSecret: hook.clientSecret,
            data: this.formatData(hook, data),
            timestamp: Date.now()
        };
        try {
            await request_1.req("POST", hook.endPoint, { headers: headers, json: payload });
        }
        catch (err) {
            log.error("Something went wrong during invocation of ", hook.id, err);
        }
    }
    formatData(hook, items) {
        let dataFormat = [];
        if (hook.compressed) {
            for (let item of items) {
                dataFormat.push(item.getCompressedData());
            }
        }
        else {
            for (let item of items) {
                dataFormat.push(item.getData());
            }
        }
        return dataFormat;
    }
}
exports.WebhookManager = WebhookManager;
//# sourceMappingURL=WebhookManager.js.map