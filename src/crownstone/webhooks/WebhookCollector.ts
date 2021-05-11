import {eventBus} from '../HubEventBus';
import {Webhook} from '../../models/hub-specific/webhook.model';
import {WebhookInternalTopics} from '../topics';
import {AssetReportWebhookData} from './data/AssetReportWebhookData';

type fn = () => void
export type webhookDataType = AssetReportWebhookData
type invocator = (data: webhookDataType[]) => Promise<void>;

export class WebhookCollector{

  collectedData : AssetReportWebhookData[] = [];
  subscriptions : fn[] = [];
  _hook: Webhook
  _interval : NodeJS.Timeout;
  _batched = false;
  _invocationCallback : invocator

  constructor(hook: Webhook, invocationCallback: invocator) {
    this._invocationCallback = invocationCallback;
    this._hook = hook;
    if (hook.batchTimeSeconds && hook.batchTimeSeconds > 0) {
      this._batched = true;
      this._interval = setInterval(() => {
        this._invocationCallback(this._getData())
      }, hook.batchTimeSeconds*1000)
    }
    this._setListeners();
  }

  _setListeners() {
    this._removeListeners();
    switch (this._hook.event) {
      case 'ASSET_REPORT':
        this.subscriptions.push(
          eventBus.on(
            WebhookInternalTopics.__ASSET_REPORT, (data: AssetMacReportData) => {
              this.load(WebhookInternalTopics.__ASSET_REPORT, data)
            }
        ));
        break;
      case 'ASSET_TRACKING':
        // TODO: implement
        break;
    }
  }

  load(topic: string, data: AssetMacReportData) {
    let dataClass = new AssetReportWebhookData(data);
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