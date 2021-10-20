import { Meteor } from 'meteor/meteor';
import { onPageLoad } from 'meteor/server-render';

import Kiosk from 'meteor/kiosk';

Meteor.startup(() => {
  Kiosk().then(async (obj) => {
    obj.processo.runModule({
      modulePath: Assets.absoluteFilePath('app.js'),
    });
  });
});

onPageLoad((sink) => {
  // Code to run on every request.
  sink.renderIntoElementById(
    'server-render-target',
    `Server time: ${new Date()}`
  );
});
