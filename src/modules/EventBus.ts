import {Util} from '../util/Util';

const debug        = require("debug")("events")
const debugVerbose = require("debug")("events.verbose")

export class EventBusClass {
  _topics   : { [key:string]: {id:string, callback: (data?:any) => void}[] };
  _topicIds : { [key:string]: boolean };

  constructor() {
    this._topics   = {};
    this._topicIds = {};
  }
  
  on(topic : string, callback : () => void) {
    if (!(topic)) {
      debug('Attempting to subscribe to undefined topic:', topic);
      return;
    }
    if (!(callback)) {
      debug('Attempting to subscribe without callback to topic:', topic);
      return;
    }

    if (this._topics[topic] === undefined) {
      this._topics[topic] = [];
    }

    // generate unique id
    let id: string;
    id = Util.getUUID();

    debugVerbose('Something is subscribing to ', topic, 'got ID:', id);

    this._topics[topic].push({id,callback});
    this._topicIds[id] = true;

    // return unsubscribe function.
    return () => {
      if (this._topics[topic] !== undefined) {
        // find id and delete
        for (let i = 0; i < this._topics[topic].length; i++) {
          if (this._topics[topic][i].id === id) {
            this._topics[topic].splice(i,1);
            break;
          }
        }

        // clear the ID
        delete this._topicIds[id];

        if (this._topics[topic].length === 0) {
          delete this._topics[topic];
        }

        debugVerbose('Something with ID ', id ,' unsubscribed from ', topic);
      }
    };
  }

  emit(topic: string, data? : any) {
    if (this._topics[topic] !== undefined) {
      debug(topic, data);
      // Firing these elements can lead to a removal of a point in this._topics.
      // To ensure we do not cause a shift by deletion (thus skipping a callback) we first put them in a separate Array
      let fireElements = [];

      for (let i = 0; i < this._topics[topic].length; i++) {
        fireElements.push(this._topics[topic][i]);
      }

      for (let i = 0; i < fireElements.length; i++) {
        // this check makes sure that if a callback has been deleted, we do not fire it.
        if (this._topicIds[fireElements[i].id] === true) {
          fireElements[i].callback(data);
        }
      }
    }
  }


  clearAllEvents() {
    debug("EventBus: Clearing all event listeners.");
    this._topics = {};
    this._topicIds = {};
  }

}

export let eventBus : any = new EventBusClass();
