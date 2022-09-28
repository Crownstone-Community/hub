import {Dbs} from '../data/DbReference';
import {Webhook} from '../../models/hub-specific/webhook.model';
import {Logger} from '../../Logger';
import {req} from 'crownstone-cloud/dist/util/request';
import {WebhookCollector, webhookDataType} from './WebhookCollector';

const log = Logger(__filename);

type customHandler = (hook: Webhook, data: webhookDataType[]) => Promise<void>;

export class WebhookManager {

  hookIntervals: () => {}
  collectors : WebhookCollector[] = []

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
      let hooks = await Dbs.webhooks.find();

      // close the current collectors before remaking them.
      for (let collector of this.collectors) {
        await collector.wrapUp();
      }

      this.collectors = [];


      for (let hook of hooks) {
        let customHandler : null | customHandler = null;
        if (hook.customHandler) {
          try {
            eval(hook.customHandler)
          }
          catch (err) {
            customHandler = null;
          }
        }

        this.collectors.push(new WebhookCollector(hook, async (data : webhookDataType[]) => {
          if (customHandler) {
            try {
              await customHandler(hook, data);
              if (hook.customHandlerIssue !== "none") {
                hook.customHandlerIssue = 'Executed successfully on' + Date.now();
                await Dbs.webhooks.update(hook)
              }
            }
            catch (err : any) {
              hook.customHandlerIssue = "Error while executing: " + err.message;
              await Dbs.webhooks.update(hook)
            }
            return;
          }
          await this.invoke(hook, data);
        }))
      }
    }
    catch (e) {
      log.error("Failed to refresh hooks", e);
    }
  }

  async invoke(hook: Webhook, data: webhookDataType[]) {
    if (data.length === 0) { return; }

    let headers : any = {};
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
      await req("POST", hook.endPoint, { headers: headers, json: payload }, true);
    }
    catch (err) {
      // log.error("Something went wrong during invocation of ", hook.id, err);
    }
  }


  formatData(hook : Webhook, items: webhookDataType[]) {
    let dataFormat = [];
    if (hook.compressed) {
      for (let item of items) {
        dataFormat.push(item.getCompressedData())
      }
    }
    else {
      for (let item of items) {
        dataFormat.push(item.getData())
      }
    }
    return dataFormat;
  }

}
