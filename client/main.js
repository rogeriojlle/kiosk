import { Meteor } from 'meteor/meteor';
import { webkitIpc } from 'meteor/kiosk';

webkitIpc.on('bla', (...args) => {
  console.log('veio do servidor', ...args);
});

document.querySelector('#btn-enviar').addEventListener('click', () => {
  console.log(webkitIpc.send('bla', { verdade: true }));
});

Meteor.startup(() => {
  //
});
