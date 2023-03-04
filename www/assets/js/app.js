function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } }
var isLocal = !window.location.hostname || window.location.hostname == 'localhost' || window.location.hostname == '192.168.1.11';
var App = /*#__PURE__*/function () {
  function App() {
    this.isDeviceReady = false;
    this.pendingOpen = false;
    this.maxExitCount = 3;
    this.maxWaitingCount = 3;
    this.urlEditable = true;
    this.kioskMode = true;
    this.checkInternetJsonp = {
      jsonpCallback: 'checkInternet',
      url: 'https://mdisplay.github.io/live/check-internet.js'
      // url: 'http://192.168.1.11/mdisplay/live/check-internet.js',
    };

    this.data = {
      showIntroMessages: true,
      url: 'https://mdisplay.github.io/live/',
      zipUrl: 'https://github.com/mdisplay/live/archive/refs/heads/master.zip',
      zipDirectory: 'live-master',
      // url: 'http://192.168.1.11/mdisplay/live/',
      zipFirst: true,
      zipCheckInternet: false,
      exitCount: 0,
      version: '1.4.4',
      // patch
      hello: 'World',
      initialized: false,
      editMode: false,
      waitingCount: 0,
      debug: {
        active: false,
        // active: true,
        editMode: true
      },
      zipStatus: {
        isActive: false,
        progressComputable: false,
        progressPercentage: 0,
        progressCurrentSize: '0 KB',
        progressTotalSize: 'Unknown',
        isDownloading: false,
        isDownloaded: false,
        isError: false,
        status: 'Unknown'
      },
      network: {
        status: 'Unknown',
        checking: false,
        internetChecking: false,
        internetCheckingMessage: {
          color: '',
          text: ''
        }
      }
    };
    this.SETTINGS_STORAGE_KEY = 'mdisplay-launcher.settings';
  }
  var _proto = App.prototype;
  _proto.getSizeFormatted = function getSizeFormatted(bytes) {
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return '0 B';
    }
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    i = parseInt('' + i, 10);
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };
  _proto.checkNetworkStatus = function checkNetworkStatus() {
    var _this = this;
    if (!this.isDeviceReady || typeof Connection === 'undefined') {
      return;
    }
    var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN] = 'Unknown Connection';
    states[Connection.ETHERNET] = 'Ethernet Connection';
    states[Connection.WIFI] = 'WiFi Connection';
    states[Connection.CELL_2G] = 'Cell 2G Connection';
    states[Connection.CELL_3G] = 'Cell 3G Connection';
    states[Connection.CELL_4G] = 'Cell 4G Connection';
    states[Connection.CELL] = 'Cell Generic Connection';
    states[Connection.NONE] = 'No Network Connection';
    this.data.network.status = states[networkState];
    if (networkState == Connection.WIFI && typeof WifiWizard2 !== 'undefined') {
      WifiWizard2.getConnectedSSID().then(function (ssid) {
        _newArrowCheck(this, _this);
        this.data.network.status = states[Connection.WIFI] + ' (' + ssid + ')';
      }.bind(this), function (err) {
        _newArrowCheck(this, _this);
        this.data.network.status = states[Connection.WIFI] + ' (SSID: ' + err + ')';
      }.bind(this));
    }

    // alert('Connection type: ' + states[networkState]);
  };
  _proto.getExitCountDownMessage = function getExitCountDownMessage() {
    return this.maxExitCount - this.data.exitCount + 1;
  }

  // @deprecated
  ;
  _proto.getCountDownMessage = function getCountDownMessage() {
    return this.getExitCountDownMessage();
  };
  _proto.getWaitingCountDownMessage = function getWaitingCountDownMessage() {
    return this.maxWaitingCount - this.data.waitingCount + 1;
  };
  _proto.writeSettings = function writeSettings(settings) {
    var settingsNew = {
      url: this.data.url,
      zipUrl: this.data.zipUrl,
      zipDirectory: this.data.zipDirectory,
      zipFirst: this.data.zipFirst,
      zipCheckInternet: this.data.zipCheckInternet
      // exitCount: this.data.exitCount,
    };

    if (settings) {
      settingsNew.url = settings.url;
      settingsNew.zipUrl = settings.zipUrl;
      settingsNew.zipDirectory = settings.zipDirectory;
      settingsNew.zipFirst = settings.zipFirst;
      settingsNew.zipCheckInternet = settings.zipCheckInternet;
      // settingsNew.exitCount = settings.exitCount;
    }

    localStorage.setItem(this.SETTINGS_STORAGE_KEY, JSON.stringify(settingsNew));
    // this.data.version = 'EXIT: ' + this.data.exitCount;
    // this.data.version = 'EXIT: ' + localStorage.getItem(this.SETTINGS_STORAGE_KEY);
  };
  _proto.readSettings = function readSettings(initial) {
    if (!initial) {
      return;
    }
    var settings = {
      url: this.data.url,
      zipUrl: this.data.zipUrl,
      zipDirectory: this.data.zipDirectory,
      zipFirst: this.data.zipFirst,
      zipCheckInternet: this.data.zipCheckInternet
      // exitCount: 0,
    };

    var settingsAlready;
    try {
      settingsAlready = JSON.parse(localStorage.getItem(this.SETTINGS_STORAGE_KEY));
    } catch (e) {}
    if (settingsAlready) {
      if (settingsAlready.url && settingsAlready.url != '') {
        settings.url = settingsAlready.url;
      }
      // settings.exitCount = settingsAlready.exitCount ? parseInt(settingsAlready.exitCount) : 0;
      if (settingsAlready.zipUrl && settingsAlready.zipUrl != '') {
        settings.zipUrl = settingsAlready.zipUrl;
      }
      if (settingsAlready.zipDirectory && settingsAlready.zipDirectory != '') {
        settings.zipDirectory = settingsAlready.zipDirectory;
      }
      if (settingsAlready.zipFirst !== undefined) {
        settings.zipFirst = settingsAlready.zipFirst;
      }
      if (settingsAlready.zipCheckInternet !== undefined) {
        settings.zipCheckInternet = settingsAlready.zipCheckInternet;
      }
    }
    this.data.url = settings.url;
    this.data.zipUrl = settings.zipUrl;
    this.data.zipDirectory = settings.zipDirectory;
    this.data.zipFirst = settings.zipFirst;
    this.data.zipCheckInternet = settings.zipCheckInternet;
    // this.data.exitCount = settings.exitCount;
    return settings;
  };
  _proto.initStorage = function initStorage(callback) {
    this.readSettings(true);
    callback();
  };
  _proto.initShortcuts = function initShortcuts() {
    var _this2 = this;
    var KEY_CODES = {
      ENTER: 13,
      ARROW_LEFT: 37,
      ARROW_UP: 38,
      ARROW_RIGHT: 39,
      ARROW_DOWN: 40
    };
    var CODES = {
      ENTER: 'Enter',
      ARROW_LEFT: 'ArrowLeft',
      ARROW_UP: 'ArrowUp',
      ARROW_RIGHT: 'ArrowRight',
      ARROW_DOWN: 'ArrowDown'
    };
    var body = document.querySelector('body');
    body.onkeydown = function (event) {
      _newArrowCheck(this, _this2);
      console.log(event);
      if (!event.metaKey) {
        // e.preventDefault();
      }
      var code = event.code;
      var keyCode = event.keyCode;
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
    }.bind(this);
  };
  _proto.incrementWaitingCount = function incrementWaitingCount() {
    var _this3 = this;
    if (this.data.editMode) {
      return;
    }
    if (this.data.waitingCount >= this.maxWaitingCount) {
      this.goToUrl();
      return;
    }
    this.data.waitingCount = this.data.waitingCount + 1;
    setTimeout(function () {
      _newArrowCheck(this, _this3);
      this.incrementWaitingCount();
    }.bind(this), 1000);
  };
  _proto.activateEditMode = function activateEditMode() {
    if (!this.data.waitingCount) {
      return;
    }
    this.data.editMode = true;
    this.data.waitingCount = 0;
    this.data.exitCount = 0;
  };
  _proto.onBodyClick = function onBodyClick() {
    this.activateEditMode();
  };
  _proto.setNetworkCheckingStatus = function setNetworkCheckingStatus(message, mode, status, timeout) {
    var _this4 = this;
    var colors = {
      init: '#ffff20',
      error: '#ff1919',
      success: '#49ff50',
      localInit: '#eeff43',
      local: '#17abff'
    };
    setTimeout(function () {
      _newArrowCheck(this, _this4);
      this.data.network.internetCheckingMessage.text = message;
      this.data.network.internetCheckingMessage.color = colors[mode];
    }.bind(this), timeout ? 500 : 0);
    setTimeout(function () {
      _newArrowCheck(this, _this4);
    } // this.fetchingInternetTime = status;
    // this.data.network.checking = status;
    .bind(this), timeout || 0);
  };
  _proto.checkInternetAvailability = function checkInternetAvailability(okCallback) {
    var _this5 = this;
    if (this.data.editMode || this.data.waitingCount > 0 || this.data.exitCount > 0) {
      this.data.network.internetChecking = false;
      return;
    }
    this.checkNetworkStatus();
    this.data.network.internetChecking = true;
    var url;
    url = 'http://192.168.1.11/qurapp/qurapp/public/api/time';
    url = 'http://192.168.1.11/non';
    url = 'http://plaintext.qurapp.com/api/time'; // https won't work when time is invalid
    url = 'https://qurapp.com/api/time';
    this.setNetworkCheckingStatus('Checking Internet Connection...', 'init', true);
    var retry = function retry(okCallback) {
      var _this6 = this;
      _newArrowCheck(this, _this5);
      setTimeout(function () {
        _newArrowCheck(this, _this6);
        this.checkInternetAvailability(okCallback);
      }.bind(this), 3000);
    }.bind(this);
    var useJsonp = true;
    if (useJsonp) {
      $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: this.checkInternetJsonp.url,
        jsonpCallback: this.checkInternetJsonp.jsonpCallback,
        contentType: 'application/json; charset=utf-8',
        success: function success(response) {
          var _this7 = this;
          _newArrowCheck(this, _this5);
          // console.log('Result received', response);
          if (response && response.result == 'ok') {
            this.setNetworkCheckingStatus('Internet Connection OK ', 'success', false, 1);
            setTimeout(function () {
              _newArrowCheck(this, _this7);
              okCallback();
              // this.data.network.checking = false;
            }.bind(this), 1500);
            return;
          }
          this.setNetworkCheckingStatus('INVALID response', 'error', false, 999);
          retry(okCallback);
        }.bind(this),
        error: function error(err) {
          _newArrowCheck(this, _this5);
          // console.log('err: ', err);
          // // alert('err: ' + err);
          this.setNetworkCheckingStatus('Internet Connection FAILED', 'error', false, 999);
          retry(okCallback);
        }.bind(this)
      });
      return;
    }
    ajax.get(url).then(function (response) {
      var _this8 = this;
      _newArrowCheck(this, _this5);
      // alert('response : ' + response);
      if (!(response && response.data)) {
        console.log('Invalid response', response);
        this.setNetworkCheckingStatus('INVALID response', 'error', false, 999);
        retry(okCallback);
        return;
      }
      this.setNetworkCheckingStatus('Internet Connection OK ', 'success', false, 1);
      setTimeout(function () {
        _newArrowCheck(this, _this8);
        okCallback();
        // this.data.network.internetChecking = false;
      }.bind(this), 1500);
    }.bind(this), function (err) {
      _newArrowCheck(this, _this5);
      console.log('err: ', err);
      // alert('err: ' + err);
      this.setNetworkCheckingStatus('Internet Connection FAILED - ' + err, 'error', false, 999);
      retry(okCallback);
    }.bind(this));
  };
  _proto.doGoToUrl = function doGoToUrl(url, checkInternet) {
    var _this9 = this;
    if (this.data.editMode) {
      return;
    }
    if (typeof cordova === 'undefined') {
      if (confirm('Redirect to this URL in Cordova environment: \n"' + this.data.url + '" Simulate this behaviour?')) {
        window.location = this.data.url;
      }
      return;
    }
    var checkInternetAvailability = function checkInternetAvailability(callback) {
      _newArrowCheck(this, _this9);
      if (checkInternet === false) {
        callback();
        return;
      }
      this.checkInternetAvailability(callback);
    }.bind(this);
    checkInternetAvailability(function () {
      _newArrowCheck(this, _this9);
      // finally!
      cordova.InAppBrowser.open(url || this.data.url, '_self', 'location=no,hidenavigationbuttons=yes,hideurlbar=yes,hardwareback=yes,footer=no,fullscreen=' + (this.kioskMode ? 'yes' : 'no'));
    }.bind(this));
    //
  };
  _proto.onInterruptKeyPressed = function onInterruptKeyPressed() {
    var _this10 = this;
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
    this.exitTimeoutRef = setTimeout(function () {
      _newArrowCheck(this, _this10);
      this.goToUrl();
    }.bind(this), 3000);
  };
  _proto.goToUrl = function goToUrl(initial) {
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
  };
  _proto.getZipDirectoryEntry = function getZipDirectoryEntry(callback, errCallback) {
    var _this11 = this;
    if (this.data.zipDirectory && this.data.zipDirectory != '') {
      this.getAppDirectoryEntry(function (dirEntry) {
        var _this12 = this;
        _newArrowCheck(this, _this11);
        dirEntry.getDirectory(this.data.zipDirectory, {
          create: false
        }, function (dirEntry) {
          _newArrowCheck(this, _this12);
          callback(dirEntry);
        }.bind(this), function (err) {
          _newArrowCheck(this, _this12);
          errCallback('Could not get zipDirectory: ' + this.data.zipDirectory);
        }.bind(this));
      }.bind(this), errCallback);
      return;
    }
    return this.getAppDirectoryEntry(callback, errCallback);
  };
  _proto.getAppDirectoryEntry = function getAppDirectoryEntry(callback, errCallback) {
    // if (true) {
    //   return this.getDirectoryEntry('app', callback, errCallback, false, cordova.file.applicationDirectory + '/www');
    // }

    this.getDirectoryEntry('app', callback, errCallback);
  };
  _proto.getDirectoryEntry = function getDirectoryEntry(dirName, callback, errCallback, doCreate, base) {
    var _this13 = this;
    resolveLocalFileSystemURL(base || cordova.file.dataDirectory, function (dataDir) {
      var _this14 = this;
      _newArrowCheck(this, _this13);
      dataDir.getDirectory(dirName, {
        create: doCreate !== false,
        exclusive: false
      }, function (dirEntry) {
        _newArrowCheck(this, _this14);
        callback(dirEntry);
      }.bind(this), function (err) {
        _newArrowCheck(this, _this14);
        errCallback('Could not get/create directory: ' + dirName);
      }.bind(this));
    }.bind(this), function (err) {
      _newArrowCheck(this, _this13);
      errCallback('Could not resolve data directory for:' + dirName);
    }.bind(this));
  };
  _proto.deleteExisting = function deleteExisting(okCallback, errCallback) {
    var _this15 = this;
    this.getAppDirectoryEntry(function (dirEntry) {
      var _this16 = this;
      _newArrowCheck(this, _this15);
      dirEntry.removeRecursively(function () {
        _newArrowCheck(this, _this16);
        okCallback();
      }.bind(this), function (err) {
        _newArrowCheck(this, _this16);
        errCallback(err);
      }.bind(this));
    }.bind(this), function (err) {
      _newArrowCheck(this, _this15);
      errCallback(err);
    }.bind(this));
  };
  _proto.extractZipEntry = function extractZipEntry(fileEntry) {
    var _this17 = this;
    this.data.zipStatus.status = 'Extracting zip...';
    this.getAppDirectoryEntry(function (dirEntry) {
      var _this18 = this;
      _newArrowCheck(this, _this17);
      zip.unzip(fileEntry.toURL(), dirEntry.toURL(), function (err) {
        var _this19 = this;
        _newArrowCheck(this, _this18);
        if (err) {
          alert('Failed to extract zip');
          return;
        }
        setTimeout(function () {
          _newArrowCheck(this, _this19);
          this.data.zipStatus.isDownloading = false;
          this.data.zipStatus.isDownloaded = false;
          this.data.zipStatus.isError = false;
          this.initializeApp();
        }.bind(this), 1000);
        //
      }.bind(this), function (progressEvent) {
        _newArrowCheck(this, _this18);
        var progressPercentage = Math.round(progressEvent.loaded / progressEvent.total * 100);
        this.data.zipStatus.status = 'Extracting zip... (' + progressPercentage + '%)';
        //
      }.bind(this));
    }.bind(this), function (err) {
      _newArrowCheck(this, _this17);
      alert('Could not extract zip (ERROR:44:App Directory Entry Failed)');
    }.bind(this));
    // this.getDirectoryEntry(
    //   'zip',
    //   (dirEntry) => {
    //     entry.copyTo(
    //       dirEntry,
    //       'app.zip',
    //       () => {
    //         alert('copying was successful');
    //       },
    //       () => {
    //         alert('copying FAILED');
    //       }
    //     );
    //   },
    //   (err) => {
    //     alert('Could not create zip directory');
    //   }
    // );
  };
  _proto.doDownloadZipFile = function doDownloadZipFile(fileEntry) {
    var _this20 = this;
    var fileTransfer = new FileTransfer();
    var fileURL = fileEntry.toURL();
    var uri = encodeURI(this.data.zipUrl);
    this.data.zipStatus.isActive = true;
    this.data.zipStatus.progressComputable = false;
    this.data.zipStatus.progressPercentage = 0;
    this.data.zipStatus.progressCurrentSize = '0 KB';
    this.data.zipStatus.progressTotalSize = 'Unknown';
    this.data.zipStatus.isDownloading = true;
    this.data.zipStatus.isDownloaded = false;
    this.data.zipStatus.isError = false;
    this.data.zipStatus.status = 'Unknown';
    fileTransfer.onprogress = function (progressEvent) {
      _newArrowCheck(this, _this20);
      this.data.zipStatus.progressComputable = progressEvent.lengthComputable;
      this.data.zipStatus.progressCurrentSize = this.getSizeFormatted(progressEvent.loaded);
      if (progressEvent.lengthComputable) {
        // Calculate the percentage
        var percentCompleted = progressEvent.loaded * 100 / progressEvent.total;
        this.data.zipStatus.progressPercentage = Math.round(percentCompleted);
        this.data.zipStatus.progressTotalSize = this.getSizeFormatted(progressEvent.total);
      } else {
        var sizeEstimated = 1 * 1024 * 1024; // 1 MB
        if (progressEvent.loaded < sizeEstimated) {
          var _percentCompleted = progressEvent.loaded * 100 / sizeEstimated;
          this.data.zipStatus.progressPercentage = Math.round(_percentCompleted / 2);
        } else {
          var newPercent = this.data.zipStatus.progressPercentage + 1;
          if (newPercent > 99) {
            newPercent = 99;
          }
          this.data.zipStatus.progressPercentage = Math.round(newPercent);
        }
      }

      // Display percentage in the UI
      // console.log('download progress', progressEvent);
    }.bind(this);
    fileTransfer.download(uri, fileURL, function (entry) {
      var _this21 = this;
      _newArrowCheck(this, _this20);
      console.log('download complete: ' + entry.toURL());
      this.data.zipStatus.isDownloading = false;
      this.data.zipStatus.isDownloaded = true;
      this.data.zipStatus.progressPercentage = 100;
      this.data.zipStatus.status = 'Zip file downloaded';
      setTimeout(function () {
        var _this22 = this;
        _newArrowCheck(this, _this21);
        this.data.zipStatus.status = 'Deleting existing files...';
        setTimeout(function () {
          var _this23 = this;
          _newArrowCheck(this, _this22);
          this.deleteExisting(function () {
            _newArrowCheck(this, _this23);
            console.log('deleteExisting successfull!');
            this.extractZipEntry(entry);
          }.bind(this), function (err) {
            _newArrowCheck(this, _this23);
            console.log('deleteExisting failed. Extracting anyway!', err);
            this.extractZipEntry(entry);
          }.bind(this));
        }.bind(this), 1000);
      }.bind(this), 1000);
    }.bind(this), function (error) {
      var _this24 = this;
      _newArrowCheck(this, _this20);
      console.log('download error source ' + error.source);
      console.log('download error target ' + error.target);
      console.log('download error code' + error.code);
      console.log('download error', error);
      this.data.zipStatus.isDownloading = false;
      this.data.zipStatus.isError = true;
      this.data.zipStatus.status = error.exception + '. (Check the device time and internet connectivity) Retrying...';
      setTimeout(function () {
        _newArrowCheck(this, _this24);
        this.doDownloadZipFile(fileEntry);
      }.bind(this), 3000);
    }.bind(this), false, {
      headers: {
        // Authorization: 'Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA==',
      }
    });
  };
  _proto.downloadZipUrl = function downloadZipUrl(initial) {
    var _this25 = this;
    this.data.exitCount = 0;
    this.data.waitingCount = 0;
    this.data.editMode = false;
    this.checkInternetAvailability(function () {
      var _this26 = this;
      _newArrowCheck(this, _this25);
      window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
        var _this27 = this;
        _newArrowCheck(this, _this26);
        console.log('file system open: ' + fs.name);
        var dirEntry = fs.root;
        dirEntry.getFile('app.zip', {
          create: true,
          exclusive: false
        }, function (fileEntry) {
          _newArrowCheck(this, _this27);
          // download(fileEntry, url, true);
          this.doDownloadZipFile(fileEntry);
        }.bind(this), function (err) {
          _newArrowCheck(this, _this27);
          alert('Temporary file could not be created: ' + err);
          console.log(err);
        }.bind(this));
      }.bind(this), function (err) {
        _newArrowCheck(this, _this26);
        alert('Temporary File System could not be loaded: ' + err);
        console.log(err);
      }.bind(this));
    }.bind(this));
  };
  _proto.urlChanged = function urlChanged() {
    this.writeSettings();
  };
  _proto.zipUrlChanged = function zipUrlChanged() {
    this.writeSettings();
  };
  _proto.zipFirstChanged = function zipFirstChanged() {
    this.writeSettings();
  };
  _proto.zipCheckInternetChanged = function zipCheckInternetChanged() {
    this.writeSettings();
  };
  _proto.initializeZipFirst = function initializeZipFirst() {
    var _this28 = this;
    this.data.network.internetChecking = true;
    this.setNetworkCheckingStatus('Checking Local Availability...', 'localInit', true);
    var localCopyNotAvailable = function localCopyNotAvailable() {
      var _this29 = this;
      _newArrowCheck(this, _this28);
      this.setNetworkCheckingStatus('Local copy unavailable.', 'error', true, 999);
      setTimeout(function () {
        _newArrowCheck(this, _this29);
        this.downloadZipUrl();
      }.bind(this), 1500);
    }.bind(this);
    this.getZipDirectoryEntry(function (dirEntry) {
      var _this30 = this;
      _newArrowCheck(this, _this28);
      dirEntry.getFile('index.html', {
        create: false
      }, function (entry) {
        var _this31 = this;
        _newArrowCheck(this, _this30);
        // temp
        // this.data.url = entry.toURL();
        this.setNetworkCheckingStatus('OK. Local copy available.', 'local', true, 999);
        setTimeout(function () {
          _newArrowCheck(this, _this31);
          this.doGoToUrl(entry.toURL(), this.data.zipCheckInternet);
        }.bind(this), 1500);
        console.log('success what?', entry.toURL(), entry);
      }.bind(this), function (err) {
        _newArrowCheck(this, _this30);
        localCopyNotAvailable();
        console.log('error yes?', err);
      }.bind(this));
      console.log('getAppDirectoryEntry', dirEntry);
    }.bind(this), function (err) {
      _newArrowCheck(this, _this28);
      localCopyNotAvailable();
      // alert('Unexpected IO Error:34:getAppDirectoryEntry failed');
      console.log('NOOOOOO getAppDirectoryEntry', err);
    }.bind(this));
  };
  _proto.initializeApp = function initializeApp() {
    var _this32 = this;
    setTimeout(function () {
      _newArrowCheck(this, _this32);
      this.data.network.checking = true;
      this.checkNetworkStatus();
    }.bind(this), 1500);
    setTimeout(function () {
      _newArrowCheck(this, _this32);
      if (this.data.editMode || this.data.waitingCount > 0 || this.data.exitCount > 0) {
        return;
      }
      if (this.data.zipFirst && this.data.zipUrl != '') {
        this.initializeZipFirst();
        return;
      }
      if (this.data.url != '' /*  && !this.data.exitCount */) {
        // setTimeout(() => {
        //   if (this.data.editMode || this.data.waitingCount > 0 || this.data.exitCount > 0) {
        //     return;
        //   }
        this.goToUrl(true);
        // }, 2000);
      }
    }.bind(this), 2000);
  };
  _proto.clearUrl = function clearUrl(input) {
    if (!confirm('Are you sure to clear URL?')) {
      return;
    }
    this.data.url = '';
    this.urlChanged();
    if (input) {
      input.focus();
    }
  };
  _proto.clearZipUrl = function clearZipUrl(input) {
    if (!confirm('Are you sure to clear Zip URL?')) {
      return;
    }
    this.data.zipUrl = '';
    this.data.zipDirectory = '';
    this.zipUrlChanged();
    if (input) {
      input.focus();
    }
  };
  _proto.mounted = function mounted() {};
  _proto.created = function created() {
    var _this33 = this;
    setTimeout(function () {
      _newArrowCheck(this, _this33);
      this.data.initialized = true;
    }.bind(this), 1000);
  };
  _proto.bindCordovaEvents = function bindCordovaEvents() {
    var _this34 = this;
    // alert('babul 1');
    if (this.kioskMode) {
      try {
        window.AndroidFullScreen.immersiveMode(function () {
          _newArrowCheck(this, _this34);
        } //
        .bind(this), function () {
          _newArrowCheck(this, _this34);
        } //
        .bind(this));
      } catch (e) {
        // alert('HA: ' + e);
      }
    }
    // window.askAndAutoUpdate();
    if (this.urlEditable) {
      document.addEventListener('backbutton', function (event) {
        _newArrowCheck(this, _this34);
        event.preventDefault();
        event.stopPropagation();
        this.onInterruptKeyPressed();
        return false;
      }.bind(this), false);
    }
  };
  _proto.deviceReady = function deviceReady() {
    console.log('cordova: ' + typeof cordova);
    if (typeof cordova === 'undefined') {
      return;
    }
    console.log('FileTransfer: ' + typeof FileTransfer);
    console.log('zip: ' + typeof zip);
    console.log('cordova.file: ' + typeof cordova.file);
    console.log('navigator.connection: ' + typeof navigator.connection);
    console.log('Connection: ' + typeof Connection);
    console.log('WifiWizard2: ' + typeof WifiWizard2);
    console.log('cordova.file.dataDirectory: ' + cordova.file.dataDirectory);
    this.isDeviceReady = true;
    this.bindCordovaEvents();
    if (this.pendingOpen) {
      this.pendingOpen = false;
      this.doGoToUrl();
    }
  };
  _proto.ensureDeviceReady = function ensureDeviceReady(callback) {
    var _this35 = this;
    if (this.isDeviceReady) {
      callback();
      return;
    }
    console.log('will ensure..');
    setTimeout(function () {
      _newArrowCheck(this, _this35);
      this.ensureDeviceReady(callback);
    }.bind(this), 500);
  };
  _proto.init = function init(callback) {
    var _this36 = this;
    this.initStorage(function () {
      var _this37 = this;
      _newArrowCheck(this, _this36);
      if (!this.data.zipFirst && this.data.url == '' || this.data.zipFirst && this.data.zipUrl == '') {
        this.data.editMode = true;
      } else {
        this.data.editMode = false;
      }
      this.ensureDeviceReady(function () {
        _newArrowCheck(this, _this37);
        this.initializeApp();
      }.bind(this));
      if (callback) {
        callback();
      }
      this.initShortcuts();
    }.bind(this));
  };
  return App;
}();