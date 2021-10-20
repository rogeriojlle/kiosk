const EventEmitter = require('events');
const { join } = require('path');
const arquivoGtk = (arquivo) => join(__dirname, '../desktop-gtk', arquivo);

let instancia = false;
class Emitter extends EventEmitter {}

const Kiosk = class {
  #pronto = false;
  #eventos = false;
  #isProduction;
  #isDevelopment;

  async preparar() {
    if (this.#pronto) return this;

    this.uri = () => process.env['ROOT_URL'];

    const { gi, Gtk, runModule } = await require(arquivoGtk(
      'wait-for-gtk.js'
    ))();

    const { MainWindow } = await require(arquivoGtk('widgets.js'))();
    const WebKit2 = gi.require('WebKit2');

    this.isProduction = async () => {
      if (!this.#isProduction)
        this.#isProduction = await runModule({
          modulePath: 'meteor/fork-process/meteor.js',
          args: [{ metodo: 'isProduction' }],
        });
      return this.#isProduction;
    };

    this.isDevelopment = async () => {
      if (!this.#isDevelopment)
        this.#isDevelopment = await runModule({
          modulePath: 'meteor/fork-process/meteor.js',
          args: [{ metodo: 'isDevelopment' }],
        });
      return this.#isDevelopment;
    };

    this.eventos = () => {
      if (!this.#eventos) this.#eventos = new Emitter();
      return this.#eventos;
    };

    this.gtkWindow = new MainWindow({});

    this.scrolledWindow = new Gtk.ScrolledWindow();

    this.gtkSettings = Gtk.Settings.getDefault();

    this.webView = new WebKit2.WebView();

    this.gtkSettings.gtkApplicationPreferDarkTheme = true;

    this.gtkSettings.gtkTouchscreenMode = true;

    this.contentManager = this.webView.getUserContentManager();

    this.webSettings = this.webView.getSettings();

    this.on = (...argumentos) => {
      this.eventos().on.call(this, ...argumentos);
    };

    this.emit = (...argumentos) => {
      this.eventos().emit.call(this, ...argumentos);
    };

    this.contentManager.on('script-message-received::ipc', (message) => {
      const { event, data } = JSON.parse(message.getJsValue());
      this.emit(event, data);
      return false;
    });

    this.gtkWindow.add(this.scrolledWindow);

    this.scrolledWindow.add(this.webView);

    this.contentManager.registerScriptMessageHandler('ipc');

    this.webSettings.enableCaretBrowsing = false;

    this.webSettings.defaultCharset = 'utf-8';

    this.webSettings.defaultFontFamily = this.gtkSettings.gtkFontName.split(
      ' '
    )[0];

    this.webSettings.enableDeveloperExtras = await this.isDevelopment();

    /*
    this.webView.on('load-changed', async (loadEvent) => {
      console.log({ loadEvent, ...WebKit2.LoadEvent });

      switch (loadEvent) {
        case WebKit2.LoadEvent.COMMITTED:
          //console.log('COMMITTED');
          break;

        case WebKit2.LoadEvent.FINISHED:
          //console.log('FINISHED');
          break;
      }

      return false;
    });
    */

    this.webView.on('decide-policy', (acao, numero) => {
      // numero é o tipo de navegacao
      // 0 - normal
      // 1 - em nova pagina
      // 2 - a resposta da requisicao
      const { uri } = acao.request;
      if (uri.startsWith(this.uri())) {
        return false;
      }
      console.log('não pode sair!');
      console.log(acao);
      return true;
    });

    this.webView.on('load-failed', (motivo) => {
      console.log('load-failed', motivo);
      setTimeout(() => {
        this.loadHome();
      }, 1000);
      return false;
    });

    //esse evento não funciona assincrono
    this.webView.on('context-menu', () => {
      if (this.#isProduction) {
        console.log('menu de contexto desabilitado em produção');
        return true;
      }
      return false;
    });

    this.send = (event, data) => {
      this.webView.runJavascript(
        `window.webkitIpc.run('${event}', ${JSON.stringify(data)})`
        //null,
        /*
        (err, res) => {
          console.log(arguments);
          console.log({ err, res });
        }
        */
      );
    };

    this.iniciar = async () => {
      this.loadHome();
      if (await this.isProduction()) this.fullScreen();
      this.gtkWindow.showAll();
    };

    this.fullScreen = () => {
      this.gtkWindow.fullscreen();
    };

    this.unFullScreen = () => {
      this.gtkWindow.unfullscreen();
    };

    this.loadHome = () => {
      this.webView.loadUri(this.uri());
    };

    this.#pronto = true;

    return this;
  }
};

module.exports = async () => {
  if (!instancia) {
    instancia = new Kiosk();
    await instancia.preparar();
    await instancia.iniciar();
  }
  return instancia;
};
