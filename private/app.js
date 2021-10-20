const { join } = require('path');
const cwd = process.cwd();
const Kiosk = require(join(cwd, '/assets/packages/kiosk/kiosk.js'));

//é só um exemplo de como acessar os pacotes do proceso principal
const Future = require(join(cwd, '/node_modules/fibers/future.js'));
console.log({ Future });

Kiosk().then(
  (self) => {
    self.on('bla', function (...args) {
      console.log('disparou evento bla', args, this);
      this.send('bla', { resposta: Math.random() });
    });
  },
  (err) => console.error
);
