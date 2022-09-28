"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookManager = void 0;
const DbReference_1 = require("../data/DbReference");
const Logger_1 = require("../../Logger");
const request_1 = require("crownstone-cloud/dist/util/request");
const WebhookCollector_1 = require("./WebhookCollector");
const log = (0, Logger_1.Logger)(__filename);
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
            // close the current collectors before remaking them.
            for (let collector of this.collectors) {
                await collector.wrapUp();
            }
            this.collectors = [];
            for (let hook of hooks) {
                let customHandler = null;
                if (hook.customHandler) {
                    try {
                        eval(hook.customHandler);
                    }
                    catch (err) {
                        customHandler = null;
                    }
                }
                this.collectors.push(new WebhookCollector_1.WebhookCollector(hook, async (data) => {
                    if (customHandler) {
                        try {
                            await customHandler(hook, data);
                            if (hook.customHandlerIssue !== "none") {
                                hook.customHandlerIssue = 'Executed successfully on' + Date.now();
                                await DbReference_1.Dbs.webhooks.update(hook);
                            }
                        }
                        catch (err) {
                            hook.customHandlerIssue = "Error while executing: " + err.message;
                            await DbReference_1.Dbs.webhooks.update(hook);
                        }
                        return;
                    }
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
            await (0, request_1.req)("POST", hook.endPoint, { headers: headers, json: payload }, true);
        }
        catch (err) {
            // log.error("Something went wrong during invocation of ", hook.id, err);
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