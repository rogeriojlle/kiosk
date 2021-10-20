import { Meteor } from 'meteor/meteor';
import EventEmitter from 'events';

export const webkitIpc = new (class extends EventEmitter {
  constructor() {
    super();
    Meteor.startup(() => {
      window.webkitIpc = this;
      if (Meteor.isDevelopment)
        console.log(`
use: import { webkitIpc } from meteor/kiosk
or: window.webkitIpc
`);
    });
  }

  send(event, data) {
    window.webkit.messageHandlers.ipc.postMessage(
      JSON.stringify({ event, data })
    );
  }

  //essa funcao é chamada pelo servidor no metodo send()
  run(event, ...args) {
    this.emit(event, ...args);
  }
})();
