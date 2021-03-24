var isLocal =
  !window.location.hostname || window.location.hostname == 'localhost' || window.location.hostname == '192.168.1.11';

class App {
  constructor() {
    this.isDeviceReady = false;
    this.pendingOpen = false;
    this.maxExitCount = 3;
    this.maxWaitingCount = 3;
    this.urlEditable = true;
    this.kioskMode = true;
    this.checkInternetJsonp = {
      jsonpCallback: 'checkInternet',
      url: 'https://mdisplay.github.io/live/check-internet.js',
      // url: 'http://192.168.1.11/mdisplay/live/check-internet.js',
    };
    this.data = {
      showIntroMessages: true,
      url: 'https://mdisplay.github.io/live/',
      // url: 'http://192.168.1.11/mdisplay/live/',
      exitCount: 0,
      version: '1.2.0',
      hello: 'World',
      initialized: false,
      editMode: false,
      waitingCount: 0,
      network: {
        status: 'Unknown',
        checking: false,
        checkingMessage: {
          color: '',
          text: '',
        },
      },
    };
    this.SETTINGS_STORAGE_KEY = 'mdisplay-launcher.settings';
  }

  checkNetworkStatus() {
    if (!this.isDeviceReady || typeof Connection === 'undefined') {
      return;
    }
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN] = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI] = 'WiFi connection';
    states[Connection.CELL_2G] = 'Cell 2G connection';
    states[Connection.CELL_3G] = 'Cell 3G connection';
    states[Connection.CELL_4G] = 'Cell 4G connection';
    states[Connection.CELL] = 'Cell generic connection';
    states[Connection.NONE] = 'No network connection';

    this.data.network.status = states[networkState];

    // alert('Connection type: ' + states[networkState]);
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
      // exitCount: this.data.exitCount,
    };
    if (settings) {
      settingsNew.url = settings.url;
      // settingsNew.exitCount = settings.exitCount;
    }
    localStorage.setItem(this.SETTINGS_STORAGE_KEY, JSON.stringify(settingsNew));
    // this.data.version = 'EXIT: ' + this.data.exitCount;
    // this.data.version = 'EXIT: ' + localStorage.getItem(this.SETTINGS_STORAGE_KEY);
  }

  readSettings(initial) {
    if (!initial) {
      return;
    }
    let settings = {
      url: this.data.url,
      // exitCount: 0,
    };
    let settingsAlready;
    try {
      settingsAlready = JSON.parse(localStorage.getItem(this.SETTINGS_STORAGE_KEY));
    } catch (e) {}
    if (settingsAlready) {
      settings.url = settingsAlready.url;
      // settings.exitCount = settingsAlready.exitCount ? parseInt(settingsAlready.exitCount) : 0;
    }
    this.data.url = settings.url;
    // this.data.exitCount = settings.exitCount;
    return settings;
  }

  initStorage(callback) {
    this.readSettings(true);
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

  setNetworkCheckingStatus(message, mode, status, timeout) {
    const colors = {
      init: '#ffff20',
      error: '#ff1919',
      success: '#49ff50',
    };
    setTimeout(
      () => {
        this.data.network.checkingMessage.text = message;
        this.data.network.checkingMessage.color = colors[mode];
      },
      timeout ? 500 : 0
    );
    setTimeout(() => {
      // this.fetchingInternetTime = status;
      // this.data.network.checking = status;
    }, timeout || 0);
  }

  checkInternetAvailability(okCallback) {
    if (this.data.editMode || this.data.waitingCount > 0 || this.data.exitCount > 0) {
      this.data.network.checking = false;
      return;
    }
    this.checkNetworkStatus();
    this.data.network.checking = true;
    let url;
    url = 'http://192.168.1.11/qurapp/qurapp/public/api/time';
    url = 'http://192.168.1.11/non';
    url = 'http://plaintext.qurapp.com/api/time'; // https won't work when time is invalid
    url = 'https://qurapp.com/api/time';

    this.setNetworkCheckingStatus('Checking Internet Connection...', 'init', true);
    const retry = (okCallback) => {
      setTimeout(() => {
        this.checkInternetAvailability(okCallback);
      }, 3000);
    };
    const useJsonp = true;
    if (useJsonp) {
      $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: this.checkInternetJsonp.url,
        jsonpCallback: this.checkInternetJsonp.jsonpCallback,
        contentType: 'application/json; charset=utf-8',
        success: (response) => {
          // console.log('Result received', response);
          if (response && response.result == 'ok') {
            this.setNetworkCheckingStatus('Internet Connection OK ', 'success', false, 1);
            setTimeout(() => {
              okCallback();
              this.network.checking = false;
            }, 1500);
            return;
          }
          this.setNetworkCheckingStatus('INVALID response', 'error', false, 999);
          retry(okCallback);
        },
        error: (err) => {
          // console.log('err: ', err);
          // // alert('err: ' + err);
          this.setNetworkCheckingStatus('Internet Connection FAILED', 'error', false, 999);
          retry(okCallback);
        },
      });
      return;
    }
    ajax.get(url).then(
      (response) => {
        // alert('response : ' + response);
        if (!(response && response.data)) {
          console.log('Invalid response', response);
          this.setNetworkCheckingStatus('INVALID response', 'error', false, 999);
          retry(okCallback);
          return;
        }
        this.setNetworkCheckingStatus('Internet Connection OK ', 'success', false, 1);
        setTimeout(() => {
          okCallback();
          this.network.checking = false;
        }, 1500);
      },
      (err) => {
        console.log('err: ', err);
        // alert('err: ' + err);
        this.setNetworkCheckingStatus('Internet Connection FAILED - ' + err, 'error', false, 999);
        retry(okCallback);
      }
    );
  }

  doGoToUrl() {
    if (this.data.editMode) {
      return;
    }
    if (typeof cordova === 'undefined') {
      if (confirm('Redirect to this URL in Cordova environment: \n"' + this.data.url + '" Simulate this behaviour?')) {
        window.location = this.data.url;
      }
      return;
    }
    this.checkInternetAvailability(() => {
      // finally!
      cordova.InAppBrowser.open(
        this.data.url,
        '_self',
        'location=no,hidenavigationbuttons=yes,hideurlbar=yes,hardwareback=yes,footer=no,fullscreen=' +
          (this.kioskMode ? 'yes' : 'no')
      );
    });
    //
  }

  onInterruptKeyPressed() {
    if (this.data.editMode) {
      return;
    }
    clearTimeout(this.exitTimeoutRef);
    if (this.data.exitCount >= this.maxExitCount) {
      this.data.exitCount = 0;
      this.incrementWaitingCount();
      return;
    }
    this.data.exitCount = this.data.exitCount + 1;
    this.exitTimeoutRef = setTimeout(() => {
      this.goToUrl();
    }, 3000);
  }

  goToUrl(initial) {
    // alert('goToUrl');
    // if (initial) {
    this.data.exitCount = 0;
    this.data.waitingCount = 0;
    this.data.editMode = false;
    // }
    if (!this.isDeviceReady) {
      this.pendingOpen = true;
      return;
    }
    this.doGoToUrl();
  }

  urlChanged() {
    this.writeSettings();
  }

  goToUrlInit() {
    if (this.data.url != '' /*  && !this.data.exitCount */) {
      setTimeout(() => {
        if (this.data.editMode || this.data.waitingCount > 0 || this.data.exitCount > 0) {
          return;
        }
        this.goToUrl(true);
      }, 2000);
    }
  }

  clearUrl(input) {
    if (!confirm('Are you sure to clear URL?')) {
      return;
    }
    this.data.url = '';
    this.urlChanged();
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
    if (this.kioskMode) {
      try {
        window.AndroidFullScreen.immersiveMode(
          function () {
            //
          },
          function () {
            //
          }
        );
      } catch (e) {
        // alert('HA: ' + e);
      }
    }
    // window.askAndAutoUpdate();
    if (this.urlEditable) {
      document.addEventListener(
        'backbutton',
        (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.onInterruptKeyPressed();
          return false;
        },
        false
      );
    }
  }

  deviceReady() {
    this.isDeviceReady = true;
    this.bindCordovaEvents();
    if (this.pendingOpen) {
      this.pendingOpen = false;
      this.doGoToUrl();
    }
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
