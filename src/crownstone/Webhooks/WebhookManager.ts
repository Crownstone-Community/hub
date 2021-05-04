import {Dbs} from '../Data/DbReference';
import {Webhook} from '../../models/hub-specific/webhook.model';
import {Logger} from '../../Logger';
import {WebhookInternalTopics, WebhookTopics} from '../topics';
import {eventBus} from '../HubEventBus';
import {req} from 'crownstone-cloud/dist/util/request';

const log = Logger(__filename);

type fn = () => void
export class WebhookManager {

  initialized = false;
  hooksByEvent : {[eventTopic: string] : Webhook[]} = {};
  subscriptions : fn[] = [];


  init() {
    if (this.initialized === false) {
      this.initialized = true;
      for (let topic in WebhookTopics) {
        this.subscriptions.push(
          eventBus.on(WebhookTopics[topic], (data : any) => {
            this.evaluateHooks(topic, data);
          })
        );
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

  mapData(incomingTopic: string, data: any) : { topic: string, data: any } | null {
    switch (incomingTopic) {
      case WebhookInternalTopics.__ASSET_REPORT:
        return {topic: WebhookTopics.ASSET_REPORT, data }
      case WebhookInternalTopics.__ASSET_TRACKING_UPDATE:
        return {topic: WebhookTopics.ASSET_TRACKING, data: {type: "update", ...data } }
      case WebhookInternalTopics.__ASSET_TRACKING_TIMEOUT:
        return {topic: WebhookTopics.ASSET_TRACKING, data: {type: "timeout", ...data }  }
    }
    return null;
  }

  evaluateHooks(incomingTopic: string, data: any) {
    let converted = this.mapData(incomingTopic, data);
    if (!converted) {
      return;
    }

    if (this.hooksByEvent[converted.topic]) {
      for (let listener of this.hooksByEvent[converted.topic]) {
        this.invoke(listener, converted.data)
      }
    }
  }

  async invoke(hook: Webhook, data: any) {
    try {

      let headers : any = {};
      if (hook.apiKey) {
        headers[hook.apiKeyHeader ?? "apiKey"] = hook.apiKey;
      }

      let payload = {
        event: hook.event,
        clientSecret: hook.clientSecret,
        data: data,
        timestamp: Date.now()
      };

      await req("POST", hook.endPoint, { headers: headers, json: payload })
    }
    catch (err) {
      log.error("Something went wrong during invocation of ", hook.id, err);
    }
  }

}
