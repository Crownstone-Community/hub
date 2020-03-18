import {ModuleBase} from '../ModuleBaseClass';


export class SseReceiver extends ModuleBase {
  eventSource : EventSource | null = null;
  token: string;
  ready = false;

  initialize(): Promise<void> {
    return Promise.resolve();
  }

  loadToken(token : string) {
    if (token.length < 64) {
      console.log("That isn't a valid token...");
      return
    }
    this.token = token;
    this.startEventFeed();
  }

  startEventFeed() {
    console.log("Starting...");
    if (this.eventSource !== null) {
      this.eventSource.close();
    }
    this.eventSource = new EventSource("https://events.crownstone.rocks/sse?accessToken=" + this.token);
    this.eventSource.onopen = (event) => {
      this.ready = true;
      console.log("Ready! Messages will come in as events are triggered!\n");
    };
    this.eventSource.onmessage = (event) => {
      let eventData = JSON.parse(event.data);
      console.log(new Date().toLocaleString() + ": \n" + JSON.stringify(eventData, null, 2));
    };
    this.eventSource.onerror = (event) => {
      this.ready = false;
      console.log("There was an error... Check your console for more information.");
      setTimeout(() => { this.startEventFeed(); } ,1000)
    };
  }
}