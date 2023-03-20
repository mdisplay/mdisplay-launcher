var isLocal = !window.location.hostname || window.location.hostname == 'localhost' || window.location.hostname == '192.168.1.11';
function App() {
  var self = this;
  self.isDeviceReady = false;
  self.pendingOpen = false;
  self.maxExitCount = 3;
  self.maxWaitingCount = 3;
  self.urlEditable = true;
  self.kioskMode = true;
  self.checkInternetJsonp = {
    jsonpCallback: 'checkInternet',
    url: 'https://mdisplay.github.io/live/check-internet.js'
    // url: 'http://192.168.1.11/mdisplay/live/check-internet.js',
  };

  self.data = {
    showIntroMessages: true,
    url: 'https://mdisplay.github.io/live/',
    zipUrl: 'https://github.com/mdisplay/live/archive/refs/heads/master.zip',
    zipDirectory: 'live-master',
    // url: 'http://192.168.1.11/mdisplay/live/',
    zipFirst: false,
    zipCheckInternet: false,
    exitCount: 0,
    version: '1.6.0', // patch
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
  self.SETTINGS_STORAGE_KEY = 'mdisplay-launcher.settings';
  self.getSizeFormatted = function (bytes) {
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return '0 B';
    }
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    i = parseInt('' + i, 10);
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };
  self.checkNetworkStatus = function () {
    if (!self.isDeviceReady || typeof Connection === 'undefined') {
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
    self.data.network.status = states[networkState];
    if (networkState == Connection.WIFI && typeof WifiWizard2 !== 'undefined') {
      WifiWizard2.getConnectedSSID().then(function (ssid) {
        self.data.network.status = states[Connection.WIFI] + ' (' + ssid + ')';
      }, function (err) {
        self.data.network.status = states[Connection.WIFI] + ' (SSID: ' + err + ')';
      });
    }

    // alert('Connection type: ' + states[networkState]);
  };

  self.getExitCountDownMessage = function () {
    return self.maxExitCount - self.data.exitCount + 1;
  };

  // @deprecated
  self.getCountDownMessage = function () {
    return self.getExitCountDownMessage();
  };
  self.getWaitingCountDownMessage = function () {
    return self.maxWaitingCount - self.data.waitingCount + 1;
  };
  self.writeSettings = function (settings) {
    var settingsNew = {
      url: self.data.url,
      zipUrl: self.data.zipUrl,
      zipDirectory: self.data.zipDirectory,
      zipFirst: self.data.zipFirst,
      zipCheckInternet: self.data.zipCheckInternet
      // exitCount: self.data.exitCount,
    };

    if (settings) {
      settingsNew.url = settings.url;
      settingsNew.zipUrl = settings.zipUrl;
      settingsNew.zipDirectory = settings.zipDirectory;
      settingsNew.zipFirst = settings.zipFirst;
      settingsNew.zipCheckInternet = settings.zipCheckInternet;
      // settingsNew.exitCount = settings.exitCount;
    }

    localStorage.setItem(self.SETTINGS_STORAGE_KEY, JSON.stringify(settingsNew));
    // self.data.version = 'EXIT: ' + self.data.exitCount;
    // self.data.version = 'EXIT: ' + localStorage.getItem(self.SETTINGS_STORAGE_KEY);
  };

  self.readSettings = function (initial) {
    if (!initial) {
      return;
    }
    var settings = {
      url: self.data.url,
      zipUrl: self.data.zipUrl,
      zipDirectory: self.data.zipDirectory,
      zipFirst: self.data.zipFirst,
      zipCheckInternet: self.data.zipCheckInternet
      // exitCount: 0,
    };

    var settingsAlready;
    try {
      settingsAlready = JSON.parse(localStorage.getItem(self.SETTINGS_STORAGE_KEY));
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
    self.data.url = settings.url;
    self.data.zipUrl = settings.zipUrl;
    self.data.zipDirectory = settings.zipDirectory;
    self.data.zipFirst = settings.zipFirst;
    self.data.zipCheckInternet = settings.zipCheckInternet;
    // self.data.exitCount = settings.exitCount;
    return settings;
  };
  self.initStorage = function (callback) {
    self.readSettings(true);
    callback();
  };
  self.initShortcuts = function () {
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
      console.log(event);
      if (!event.metaKey) {
        // e.preventDefault();
      }
      var code = event.code;
      var keyCode = event.keyCode;
      // alert('keyCode: ' + keyCode);
      if (code == CODES.ENTER || keyCode == KEY_CODES.ENTER) {
        event.preventDefault();
        if (self.data.waitingCount) {
          self.activateEditMode();
        } else {
          self.goToUrl();
        }
        return;
      }
    };
  };
  self.incrementWaitingCount = function () {
    if (self.data.editMode) {
      return;
    }
    if (self.data.waitingCount >= self.maxWaitingCount) {
      self.goToUrl();
      return;
    }
    self.data.waitingCount = self.data.waitingCount + 1;
    setTimeout(function () {
      self.incrementWaitingCount();
    }, 1000);
  };
  self.activateEditMode = function () {
    if (!self.data.waitingCount) {
      return;
    }
    self.data.editMode = true;
    self.data.waitingCount = 0;
    self.data.exitCount = 0;
  };
  self.onBodyClick = function () {
    self.activateEditMode();
  };
  self.setNetworkCheckingStatus = function (message, mode, status, timeout) {
    var colors = {
      init: '#ffff20',
      error: '#ff1919',
      success: '#49ff50',
      localInit: '#eeff43',
      local: '#17abff'
    };
    setTimeout(function () {
      self.data.network.internetCheckingMessage.text = message;
      self.data.network.internetCheckingMessage.color = colors[mode];
    }, timeout ? 500 : 0);
    setTimeout(function () {
      // self.fetchingInternetTime = status;
      // self.data.network.checking = status;
    }, timeout || 0);
  };
  self.checkInternetAvailability = function (okCallback) {
    if (self.data.editMode || self.data.waitingCount > 0 || self.data.exitCount > 0) {
      self.data.network.internetChecking = false;
      return;
    }
    self.checkNetworkStatus();
    self.data.network.internetChecking = true;
    var url;
    url = 'http://192.168.1.11/qurapp/qurapp/public/api/time';
    url = 'http://192.168.1.11/non';
    url = 'http://plaintext.qurapp.com/api/time'; // https won't work when time is invalid
    url = 'https://qurapp.com/api/time';
    self.setNetworkCheckingStatus('Checking Internet Connection...', 'init', true);
    var retry = function retry(okCallback) {
      setTimeout(function () {
        self.checkInternetAvailability(okCallback);
      }, 3000);
    };
    var useJsonp = true;
    if (useJsonp) {
      $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: self.checkInternetJsonp.url,
        jsonpCallback: self.checkInternetJsonp.jsonpCallback,
        contentType: 'application/json; charset=utf-8',
        success: function success(response) {
          // console.log('Result received', response);
          if (response && response.result == 'ok') {
            self.setNetworkCheckingStatus('Internet Connection OK ', 'success', false, 1);
            setTimeout(function () {
              okCallback();
              // self.data.network.checking = false;
            }, 1500);
            return;
          }
          self.setNetworkCheckingStatus('INVALID response', 'error', false, 999);
          retry(okCallback);
        },
        error: function error(err) {
          // console.log('err: ', err);
          // // alert('err: ' + err);
          self.setNetworkCheckingStatus('Internet Connection FAILED', 'error', false, 999);
          retry(okCallback);
        }
      });
      return;
    }
    ajax.get(url).then(function (response) {
      // alert('response : ' + response);
      if (!(response && response.data)) {
        console.log('Invalid response', response);
        self.setNetworkCheckingStatus('INVALID response', 'error', false, 999);
        retry(okCallback);
        return;
      }
      self.setNetworkCheckingStatus('Internet Connection OK ', 'success', false, 1);
      setTimeout(function () {
        okCallback();
        // self.data.network.internetChecking = false;
      }, 1500);
    }, function (err) {
      console.log('err: ', err);
      // alert('err: ' + err);
      self.setNetworkCheckingStatus('Internet Connection FAILED - ' + err, 'error', false, 999);
      retry(okCallback);
    });
  };
  self.doGoToUrl = function (url, checkInternet) {
    if (self.data.editMode) {
      return;
    }
    if (typeof cordova === 'undefined') {
      if (confirm('Redirect to this URL in Cordova environment: \n"' + self.data.url + '" Simulate this behaviour?')) {
        window.location = self.data.url;
      }
      return;
    }
    var checkInternetAvailability = function checkInternetAvailability(callback) {
      if (checkInternet === false) {
        callback();
        return;
      }
      self.checkInternetAvailability(callback);
    };
    checkInternetAvailability(function () {
      // finally!
      cordova.InAppBrowser.open(url || self.data.url, '_self', 'location=no,hidenavigationbuttons=yes,hideurlbar=yes,hardwareback=yes,footer=no,fullscreen=' + (self.kioskMode ? 'yes' : 'no'));
    });
    //
  };

  self.onInterruptKeyPressed = function () {
    if (self.data.editMode) {
      return;
    }
    clearTimeout(self.exitTimeoutRef);
    if (self.data.exitCount >= self.maxExitCount) {
      self.data.exitCount = 0;
      self.incrementWaitingCount();
      return;
    }
    self.data.exitCount = self.data.exitCount + 1;
    self.exitTimeoutRef = setTimeout(function () {
      self.goToUrl();
    }, 3000);
  };
  self.goToUrl = function (initial) {
    // alert('goToUrl');
    // if (initial) {
    self.data.exitCount = 0;
    self.data.waitingCount = 0;
    self.data.editMode = false;
    // }
    if (!self.isDeviceReady) {
      self.pendingOpen = true;
      return;
    }
    self.doGoToUrl();
  };
  self.getZipDirectoryEntry = function (callback, errCallback) {
    if (self.data.zipDirectory && self.data.zipDirectory != '') {
      self.getAppDirectoryEntry(function (dirEntry) {
        dirEntry.getDirectory(self.data.zipDirectory, {
          create: false
        }, function (dirEntry) {
          callback(dirEntry);
        }, function (err) {
          errCallback('Could not get zipDirectory: ' + self.data.zipDirectory);
        });
      }, errCallback);
      return;
    }
    return self.getAppDirectoryEntry(callback, errCallback);
  };
  self.getAppDirectoryEntry = function (callback, errCallback) {
    // if (true) {
    //   return self.getDirectoryEntry('app', callback, errCallback, false, cordova.file.applicationDirectory + '/www');
    // }

    self.getDirectoryEntry('app', callback, errCallback);
  };
  self.getDirectoryEntry = function (dirName, callback, errCallback, doCreate, base) {
    resolveLocalFileSystemURL(base || cordova.file.dataDirectory, function (dataDir) {
      dataDir.getDirectory(dirName, {
        create: doCreate !== false,
        exclusive: false
      }, function (dirEntry) {
        callback(dirEntry);
      }, function (err) {
        errCallback('Could not get/create directory: ' + dirName);
      });
    }, function (err) {
      errCallback('Could not resolve data directory for:' + dirName);
    });
  };
  self.deleteExisting = function (okCallback, errCallback) {
    self.getAppDirectoryEntry(function (dirEntry) {
      dirEntry.removeRecursively(function () {
        okCallback();
      }, function (err) {
        errCallback(err);
      });
    }, function (err) {
      errCallback(err);
    });
  };
  self.extractZipEntry = function (fileEntry) {
    self.data.zipStatus.status = 'Extracting zip...';
    self.getAppDirectoryEntry(function (dirEntry) {
      zip.unzip(fileEntry.toURL(), dirEntry.toURL(), function (err) {
        if (err) {
          alert('Failed to extract zip');
          return;
        }
        setTimeout(function () {
          self.data.zipStatus.isDownloading = false;
          self.data.zipStatus.isDownloaded = false;
          self.data.zipStatus.isError = false;
          self.initializeApp();
        }, 1000);
        //
      }, function (progressEvent) {
        var progressPercentage = Math.round(progressEvent.loaded / progressEvent.total * 100);
        self.data.zipStatus.status = 'Extracting zip... (' + progressPercentage + '%)';
        //
      });
    }, function (err) {
      alert('Could not extract zip (ERROR:44:App Directory Entry Failed)');
    });
    // self.getDirectoryEntry(
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

  self.doDownloadZipFile = function (fileEntry) {
    var fileTransfer = new FileTransfer();
    var fileURL = fileEntry.toURL();
    var uri = encodeURI(self.data.zipUrl);
    self.data.zipStatus.isActive = true;
    self.data.zipStatus.progressComputable = false;
    self.data.zipStatus.progressPercentage = 0;
    self.data.zipStatus.progressCurrentSize = '0 KB';
    self.data.zipStatus.progressTotalSize = 'Unknown';
    self.data.zipStatus.isDownloading = true;
    self.data.zipStatus.isDownloaded = false;
    self.data.zipStatus.isError = false;
    self.data.zipStatus.status = 'Unknown';
    fileTransfer.onprogress = function (progressEvent) {
      self.data.zipStatus.progressComputable = progressEvent.lengthComputable;
      self.data.zipStatus.progressCurrentSize = self.getSizeFormatted(progressEvent.loaded);
      if (progressEvent.lengthComputable) {
        // Calculate the percentage
        var percentCompleted = progressEvent.loaded * 100 / progressEvent.total;
        self.data.zipStatus.progressPercentage = Math.round(percentCompleted);
        self.data.zipStatus.progressTotalSize = self.getSizeFormatted(progressEvent.total);
      } else {
        var sizeEstimated = 1 * 1024 * 1024; // 1 MB
        if (progressEvent.loaded < sizeEstimated) {
          var _percentCompleted = progressEvent.loaded * 100 / sizeEstimated;
          self.data.zipStatus.progressPercentage = Math.round(_percentCompleted / 2);
        } else {
          var newPercent = self.data.zipStatus.progressPercentage + 1;
          if (newPercent > 99) {
            newPercent = 99;
          }
          self.data.zipStatus.progressPercentage = Math.round(newPercent);
        }
      }

      // Display percentage in the UI
      // console.log('download progress', progressEvent);
    };

    fileTransfer.download(uri, fileURL, function (entry) {
      console.log('download complete: ' + entry.toURL());
      self.data.zipStatus.isDownloading = false;
      self.data.zipStatus.isDownloaded = true;
      self.data.zipStatus.progressPercentage = 100;
      self.data.zipStatus.status = 'Zip file downloaded';
      setTimeout(function () {
        self.data.zipStatus.status = 'Deleting existing files...';
        setTimeout(function () {
          self.deleteExisting(function () {
            console.log('deleteExisting successfull!');
            self.extractZipEntry(entry);
          }, function (err) {
            console.log('deleteExisting failed. Extracting anyway!', err);
            self.extractZipEntry(entry);
          });
        }, 1000);
      }, 1000);
    }, function (error) {
      console.log('download error source ' + error.source);
      console.log('download error target ' + error.target);
      console.log('download error code' + error.code);
      console.log('download error', error);
      self.data.zipStatus.isDownloading = false;
      self.data.zipStatus.isError = true;
      self.data.zipStatus.status = error.exception + '. (Check the device time and internet connectivity) Retrying...';
      setTimeout(function () {
        self.doDownloadZipFile(fileEntry);
      }, 3000);
    }, false, {
      headers: {
        // Authorization: 'Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA==',
      }
    });
  };
  self.downloadZipUrl = function (initial) {
    self.data.exitCount = 0;
    self.data.waitingCount = 0;
    self.data.editMode = false;
    self.checkInternetAvailability(function () {
      window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
        console.log('file system open: ' + fs.name);
        var dirEntry = fs.root;
        dirEntry.getFile('app.zip', {
          create: true,
          exclusive: false
        }, function (fileEntry) {
          // download(fileEntry, url, true);
          self.doDownloadZipFile(fileEntry);
        }, function (err) {
          alert('Temporary file could not be created: ' + err);
          console.log(err);
        });
      }, function (err) {
        alert('Temporary File System could not be loaded: ' + err);
        console.log(err);
      });
    });
  };
  self.urlChanged = function () {
    self.writeSettings();
  };
  self.zipUrlChanged = function () {
    self.writeSettings();
  };
  self.zipFirstChanged = function () {
    self.writeSettings();
  };
  self.zipCheckInternetChanged = function () {
    self.writeSettings();
  };
  self.initializeZipFirst = function () {
    self.data.network.internetChecking = true;
    self.setNetworkCheckingStatus('Checking Local Availability...', 'localInit', true);
    var localCopyNotAvailable = function localCopyNotAvailable() {
      self.setNetworkCheckingStatus('Local copy unavailable.', 'error', true, 999);
      setTimeout(function () {
        self.downloadZipUrl();
      }, 1500);
    };
    self.getZipDirectoryEntry(function (dirEntry) {
      dirEntry.getFile('index.html', {
        create: false
      }, function (entry) {
        // temp
        // self.data.url = entry.toURL();
        self.setNetworkCheckingStatus('OK. Local copy available.', 'local', true, 999);
        setTimeout(function () {
          self.doGoToUrl(entry.toURL(), self.data.zipCheckInternet);
        }, 1500);
        console.log('success what?', entry.toURL(), entry);
      }, function (err) {
        localCopyNotAvailable();
        console.log('error yes?', err);
      });
      console.log('getAppDirectoryEntry', dirEntry);
    }, function (err) {
      localCopyNotAvailable();
      // alert('Unexpected IO Error:34:getAppDirectoryEntry failed');
      console.log('NOOOOOO getAppDirectoryEntry', err);
    });
  };
  self.initializeApp = function () {
    setTimeout(function () {
      self.data.network.checking = true;
      self.checkNetworkStatus();
    }, 1500);
    setTimeout(function () {
      if (self.data.editMode || self.data.waitingCount > 0 || self.data.exitCount > 0) {
        return;
      }
      if (self.data.zipFirst && self.data.zipUrl != '') {
        self.initializeZipFirst();
        return;
      }
      if (self.data.url != '' /*  && !self.data.exitCount */) {
        // setTimeout(() => {
        //   if (self.data.editMode || self.data.waitingCount > 0 || self.data.exitCount > 0) {
        //     return;
        //   }
        self.goToUrl(true);
        // }, 2000);
      }
    }, 2000);
  };
  self.clearUrl = function (input) {
    if (!confirm('Are you sure to clear URL?')) {
      return;
    }
    self.data.url = '';
    self.urlChanged();
    if (input) {
      input.focus();
    }
  };
  self.clearZipUrl = function (input) {
    if (!confirm('Are you sure to clear Zip URL?')) {
      return;
    }
    self.data.zipUrl = '';
    self.data.zipDirectory = '';
    self.zipUrlChanged();
    if (input) {
      input.focus();
    }
  };
  self.mounted = function () {};
  self.created = function () {
    setTimeout(function () {
      self.data.initialized = true;
    }, 1000);
  };
  self.bindCordovaEvents = function () {
    // alert('babul 1');
    if (self.kioskMode) {
      try {
        window.AndroidFullScreen.immersiveMode(function () {
          //
        }, function () {
          //
        });
      } catch (e) {
        // alert('HA: ' + e);
      }
    }
    // window.askAndAutoUpdate();
    if (self.urlEditable) {
      document.addEventListener('backbutton', function (event) {
        event.preventDefault();
        event.stopPropagation();
        self.onInterruptKeyPressed();
        return false;
      }, false);
    }
  };
  self.deviceReady = function () {
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
    self.isDeviceReady = true;
    self.bindCordovaEvents();
    if (self.pendingOpen) {
      self.pendingOpen = false;
      self.doGoToUrl();
    }
  };
  self.ensureDeviceReady = function (callback) {
    if (self.isDeviceReady) {
      callback();
      return;
    }
    console.log('will ensure..');
    setTimeout(function () {
      self.ensureDeviceReady(callback);
    }, 500);
  };
  self.init = function (callback) {
    self.initStorage(function () {
      if (!self.data.zipFirst && self.data.url == '' || self.data.zipFirst && self.data.zipUrl == '') {
        self.data.editMode = true;
      } else {
        self.data.editMode = false;
      }
      self.ensureDeviceReady(function () {
        self.initializeApp();
      });
      if (callback) {
        callback();
      }
      self.initShortcuts();
    });
  };
}