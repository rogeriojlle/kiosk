import { Meteor } from 'meteor/meteor';

export default async () => {
  import desktop from 'meteor/desktop-gtk';

  desktop._process.on('exit', () => {
    console.log('saiu');
    if (Meteor.isProduction) process.exit();
  });

  const caminho = Assets.absoluteFilePath('kiosk.js');

  await desktop.runModule({
    modulePath: caminho,
  });

  return { caminho, processo: desktop };
};
