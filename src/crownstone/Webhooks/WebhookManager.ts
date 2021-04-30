import {Dbs} from '../Data/DbReference';
import {Webhook} from '../../models/hub-specific/webhook.model';
import {Logger} from '../../Logger';

const log = Logger(__filename);

export class WebhookManager {

  initialized = false;

  hooksByEvent : {[eventTopic: string] : Webhook[]};

  init() {

  }

  async refreshHooks() {
    try {
      let hooks = await Dbs.webhooks.find();
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

}
