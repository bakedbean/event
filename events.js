/* eslint-disable */
import { head, tail } from 'lodash';
import { EVENT_LOGGING } from './constants';

const local = window.location.host.match(/localhost/) || window.location.host.match(/127.0.0.1/);
const staging = window.location.host.match(/staging/);

class Event {
  constructor(type) {
    this.type = type;
  }

  detect(fn, args) {
    (!local) ? fn.call() : EVENT_LOGGING && console.log(this.type, args);
    return new Provider().provide(this.type);
  }
}

class Service extends Event {
  log(...args) {
    // make sure trackers are loaded
    return this[this.type](head(args), tail(args));
  }

  google(event, args) {
    if (!ga) return false;
    return this.detect(ga.bind(this, 'send', 'event', event, head(args).action, head(args).label), arguments);
  }

  kissmetrics(event, args) {
    if (!_kmq) return false;
    return this.detect(_kmq.push.bind(this, [event].concat(args)), arguments);
  }

  facebook(event, args) {
    if (!fbq) return false;
    return this.detect(fbq.bind(this, 'track', event, args), arguments);
  }
}

class Provider {
  constructor() {
    this.service = null;
  }

  provide(type, service = false) {
    this.type = type;
    this.service = new Service(type);

    if (service) return this.service;

    return this;
  }
}
 
export const Events = new Provider();
