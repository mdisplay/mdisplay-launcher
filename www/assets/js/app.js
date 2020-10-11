class App {
  constructor() {
    this.isDeviceReady = false;
    this.pendingOpen = false;
    this.maxExitCount = 3;
    this.maxWaitingCount = 3;
    this.inAppBrowserRef = undefined;
    this.data = {
      url: '',
      exitCount: 0,
      version: '1.1.4',
      hello: 'World',
      initialized: false,
      editMode: false,
      waitingCount: 0,
    };
  }

  getExitCountDownMessage() {
    return this.maxExitCount - this.data.exitCount + 1;
  }

  // @deprecated
  getCountDownMessage() {
    return this.getExitCountDownMessage();
  }

  getWaitingCountDownMessage() {
    return this.maxWaitingCount - this.data.waitingCount + 1;
  }

  writeSettings(settings) {
    let settingsNew = {
      url: this.data.url,
      exitCount: this.data.exitCount,
    };
    if (settings) {
      settingsNew.url = settings.url;
      settingsNew.exitCount = settings.exitCount;
    }
    localStorage.setItem('zetmel-kiosk.settings', JSON.stringify(settingsNew));
  }

  readSettings() {
    let settings = {
      url: '',
      exitCount: 0,
    };
    let settingsAlready;
    try {
      settingsAlready = JSON.parse(localStorage.getItem('zetmel-kiosk.settings'));
    } catch (e) {}
    if (settingsAlready) {
      settings.url = settingsAlready.url;
      settings.exitCount = settingsAlready.exitCount ? parseInt(settingsAlready.exitCount) : 0;
    }
    this.data.url = settings.url;
    this.data.exitCount = settings.exitCount;
    return settings;
  }

  initStorage(callback) {
    this.readSettings();
    callback();
  }

  initShortcuts() {
    const KEY_CODES = {
      ENTER: 13,
      ARROW_LEFT: 37,
      ARROW_UP: 38,
      ARROW_RIGHT: 39,
      ARROW_DOWN: 40,
    };
    const CODES = {
      ENTER: 'Enter',
      ARROW_LEFT: 'ArrowLeft',
      ARROW_UP: 'ArrowUp',
      ARROW_RIGHT: 'ArrowRight',
      ARROW_DOWN: 'ArrowDown',
    };
    const body = document.querySelector('body');
    body.onkeydown = (event) => {
      console.log(event);
      if (!event.metaKey) {
        // e.preventDefault();
      }
      const code = event.code;
      const keyCode = event.keyCode;
      // alert('keyCode: ' + keyCode);
      if (code == CODES.ENTER || keyCode == KEY_CODES.ENTER) {
        event.preventDefault();

        if (this.data.waitingCount) {
          this.activateEditMode();
        } else {
          this.goToUrl();
        }
        return;
      }
    };
  }

  incrementWaitingCount() {
    if (this.data.editMode) {
      return;
    }
    if (this.data.waitingCount >= this.maxWaitingCount) {
      this.goToUrl();
      return;
    }
    this.data.waitingCount = this.data.waitingCount + 1;
    setTimeout(() => {
      this.incrementWaitingCount();
    }, 1000);
  }

  activateEditMode() {
    if (!this.data.waitingCount) {
      return;
    }
    this.data.editMode = true;
    this.data.waitingCount = 0;
    this.data.exitCount = 0;
  }

  onBodyClick() {
    this.activateEditMode();
  }

  doGoToUrl() {
    if(typeof cordova === 'undefined'){
      alert('Redirect to this URL in Cordova environment: \n"' + this.data.url + '"');
      return;
    }
    this.inAppBrowserRef = cordova.InAppBrowser.open(this.data.url, '_blank', 'location=no,hardwareback=yes,footer=no,fullscreen=yes');
    this.inAppBrowserRef.addEventListener('loadstop', () => {
      // try {
      //   window.AndroidFullScreen.immersiveMode(function () {
      //     //
      //   }, function () {
      //     //
      //   });
      // } catch(e){
      //   alert('hu: ' + e);
      // }
    });
    this.inAppBrowserRef.addEventListener('exit', () => {
      if (this.data.exitCount >= this.maxExitCount) {
        this.data.exitCount = 0;
        this.writeSettings();
        this.incrementWaitingCount();
        return;
      }
      this.readSettings();
      this.data.exitCount = this.data.exitCount + 1;
      this.writeSettings();
      setTimeout(() => {
        this.doGoToUrl();
      }, 1000);
      this.inAppBrowserRef = undefined;
    });
  }

  goToUrl() {
    // alert('goToUrl');
    this.data.exitCount = 0;
    this.data.waitingCount = 0;
    this.data.editMode = false;
    this.writeSettings();
    if (!this.isDeviceReady) {
      this.pendingOpen = true;
      return;
    }
    this.doGoToUrl();
  }

  goToUrlInit(){
    if(this.data.url != ''/*  && !this.data.exitCount */){
      this.goToUrl();
    }
  }

  clearUrl(input) {
    if(!confirm('Are you sure to clear URL?')){
      return;
    }
    this.data.url = '';
    this.writeSettings();
    if (input) {
      input.focus();
    }
  }

  mounted() {}

  created() {
    setTimeout(() => {
      this.data.initialized = true;
    }, 1000);
  }

  bindCordovaEvents() {
    // alert('babul 1');
      try {
        window.AndroidFullScreen.immersiveMode(function () {
          //
        }, function () {
          //
        });
      } catch(e){
        // alert('HA: ' + e);
      }
      // alert('babul 2');
      // window.askAndAutoUpdate();
    document.addEventListener(
      'backbutton',
      (event) => {
        event.preventDefault();
        if(this.data.editMode){
          this.readSettings();
          if(this.data.url != ''){
            this.goToUrl();          
          }
        }
        // if (this.data.settingsMode) {
        //   //
        // } else {
        // }
        return false;
      },
      false
    );
  }

  deviceReady() {
    this.isDeviceReady = true;
    if (this.pendingOpen) {
      this.pendingOpen = false;
      this.doGoToUrl();
    }
    this.bindCordovaEvents();
  }

  init(callback) {
    this.initStorage(() => {
      if (this.data.url == '') {
        this.data.editMode = true;
      }
      this.goToUrlInit();
      if (callback) {
        callback();
      }
      this.initShortcuts();
    });
  }
}
