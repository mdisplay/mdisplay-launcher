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
      zipUrl: 'https://github.com/mdisplay/live/archive/refs/heads/master.zip',
      zipDirectory: 'live-master',
      // url: 'http://192.168.1.11/mdisplay/live/',
      zipFirst: true,
      zipCheckInternet: false,
      exitCount: 0,
      version: '1.4.4', // patch
      hello: 'World',
      initialized: false,
      editMode: false,
      waitingCount: 0,
      debug: {
        active: false,
        // active: true,
        editMode: true,
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
        status: 'Unknown',
      },
      network: {
        status: 'Unknown',
        checking: false,
        internetChecking: false,
        internetCheckingMessage: {
          color: '',
          text: '',
        },
      },
    };
    this.SETTINGS_STORAGE_KEY = 'mdisplay-launcher.settings';
  }

  getSizeFormatted(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return '0 B';
    }
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    i = parseInt('' + i, 10);
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  }

  checkNetworkStatus() {
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
      WifiWizard2.getConnectedSSID().then(
        (ssid) => {
          this.data.network.status = states[Connection.WIFI] + ' (' + ssid + ')';
        },
        (err) => {
          this.data.network.status = states[Connection.WIFI] + ' (SSID: ' + err + ')';
        }
      );
    }

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
      zipUrl: this.data.zipUrl,
      zipDirectory: this.data.zipDirectory,
      zipFirst: this.data.zipFirst,
      zipCheckInternet: this.data.zipCheckInternet,
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
  }

  readSettings(initial) {
    if (!initial) {
      return;
    }
    let settings = {
      url: this.data.url,
      zipUrl: this.data.zipUrl,
      zipDirectory: this.data.zipDirectory,
      zipFirst: this.data.zipFirst,
      zipCheckInternet: this.data.zipCheckInternet,
      // exitCount: 0,
    };
    let settingsAlready;
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
      localInit: '#eeff43',
      local: '#17abff',
    };
    setTimeout(
      () => {
        this.data.network.internetCheckingMessage.text = message;
        this.data.network.internetCheckingMessage.color = colors[mode];
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
      this.data.network.internetChecking = false;
      return;
    }
    this.checkNetworkStatus();
    this.data.network.internetChecking = true;
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
              // this.data.network.checking = false;
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
          // this.data.network.internetChecking = false;
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

  doGoToUrl(url, checkInternet) {
    if (this.data.editMode) {
      return;
    }
    if (typeof cordova === 'undefined') {
      if (confirm('Redirect to this URL in Cordova environment: \n"' + this.data.url + '" Simulate this behaviour?')) {
        window.location = this.data.url;
      }
      return;
    }
    var checkInternetAvailability = (callback) => {
      if (checkInternet === false) {
        callback();
        return;
      }
      this.checkInternetAvailability(callback);
    };
    checkInternetAvailability(() => {
      // finally!
      cordova.InAppBrowser.open(
        url || this.data.url,
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

  getZipDirectoryEntry(callback, errCallback) {
    if (this.data.zipDirectory && this.data.zipDirectory != '') {
      this.getAppDirectoryEntry((dirEntry) => {
        dirEntry.getDirectory(
          this.data.zipDirectory,
          { create: false },
          (dirEntry) => {
            callback(dirEntry);
          },
          (err) => {
            errCallback('Could not get zipDirectory: ' + this.data.zipDirectory);
          }
        );
      }, errCallback);
      return;
    }
    return this.getAppDirectoryEntry(callback, errCallback);
  }

  getAppDirectoryEntry(callback, errCallback) {
    // if (true) {
    //   return this.getDirectoryEntry('app', callback, errCallback, false, cordova.file.applicationDirectory + '/www');
    // }

    this.getDirectoryEntry('app', callback, errCallback);
  }

  getDirectoryEntry(dirName, callback, errCallback, doCreate, base) {
    resolveLocalFileSystemURL(
      base || cordova.file.dataDirectory,
      (dataDir) => {
        dataDir.getDirectory(
          dirName,
          { create: doCreate !== false, exclusive: false },
          (dirEntry) => {
            callback(dirEntry);
          },
          (err) => {
            errCallback('Could not get/create directory: ' + dirName);
          }
        );
      },
      (err) => {
        errCallback('Could not resolve data directory for:' + dirName);
      }
    );
  }

  deleteExisting(okCallback, errCallback) {
    this.getAppDirectoryEntry(
      (dirEntry) => {
        dirEntry.removeRecursively(
          () => {
            okCallback();
          },
          (err) => {
            errCallback(err);
          }
        );
      },
      (err) => {
        errCallback(err);
      }
    );
  }

  extractZipEntry(fileEntry) {
    this.data.zipStatus.status = 'Extracting zip...';
    this.getAppDirectoryEntry(
      (dirEntry) => {
        zip.unzip(
          fileEntry.toURL(),
          dirEntry.toURL(),
          (err) => {
            if (err) {
              alert('Failed to extract zip');
              return;
            }
            setTimeout(() => {
              this.data.zipStatus.isDownloading = false;
              this.data.zipStatus.isDownloaded = false;
              this.data.zipStatus.isError = false;
              this.initializeApp();
            }, 1000);
            //
          },
          (progressEvent) => {
            var progressPercentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            this.data.zipStatus.status = 'Extracting zip... (' + progressPercentage + '%)';
            //
          }
        );
      },
      (err) => {
        alert('Could not extract zip (ERROR:44:App Directory Entry Failed)');
      }
    );
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
  }

  doDownloadZipFile(fileEntry) {
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

    fileTransfer.onprogress = (progressEvent) => {
      this.data.zipStatus.progressComputable = progressEvent.lengthComputable;
      this.data.zipStatus.progressCurrentSize = this.getSizeFormatted(progressEvent.loaded);
      if (progressEvent.lengthComputable) {
        // Calculate the percentage
        const percentCompleted = (progressEvent.loaded * 100) / progressEvent.total;
        this.data.zipStatus.progressPercentage = Math.round(percentCompleted);
        this.data.zipStatus.progressTotalSize = this.getSizeFormatted(progressEvent.total);
      } else {
        var sizeEstimated = 1 * 1024 * 1024; // 1 MB
        if (progressEvent.loaded < sizeEstimated) {
          const percentCompleted = (progressEvent.loaded * 100) / sizeEstimated;
          this.data.zipStatus.progressPercentage = Math.round(percentCompleted / 2);
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
    };

    fileTransfer.download(
      uri,
      fileURL,
      (entry) => {
        console.log('download complete: ' + entry.toURL());
        this.data.zipStatus.isDownloading = false;
        this.data.zipStatus.isDownloaded = true;
        this.data.zipStatus.progressPercentage = 100;
        this.data.zipStatus.status = 'Zip file downloaded';
        setTimeout(() => {
          this.data.zipStatus.status = 'Deleting existing files...';
          setTimeout(() => {
            this.deleteExisting(
              () => {
                console.log('deleteExisting successfull!');
                this.extractZipEntry(entry);
              },
              (err) => {
                console.log('deleteExisting failed. Extracting anyway!', err);
                this.extractZipEntry(entry);
              }
            );
          }, 1000);
        }, 1000);
      },
      (error) => {
        console.log('download error source ' + error.source);
        console.log('download error target ' + error.target);
        console.log('download error code' + error.code);
        console.log('download error', error);
        this.data.zipStatus.isDownloading = false;
        this.data.zipStatus.isError = true;
        this.data.zipStatus.status =
          error.exception + '. (Check the device time and internet connectivity) Retrying...';
        setTimeout(() => {
          this.doDownloadZipFile(fileEntry);
        }, 3000);
      },
      false,
      {
        headers: {
          // Authorization: 'Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA==',
        },
      }
    );
  }

  downloadZipUrl(initial) {
    this.data.exitCount = 0;
    this.data.waitingCount = 0;
    this.data.editMode = false;

    this.checkInternetAvailability(() => {
      window.requestFileSystem(
        window.TEMPORARY,
        5 * 1024 * 1024,
        (fs) => {
          console.log('file system open: ' + fs.name);

          var dirEntry = fs.root;

          dirEntry.getFile(
            'app.zip',
            { create: true, exclusive: false },
            (fileEntry) => {
              // download(fileEntry, url, true);
              this.doDownloadZipFile(fileEntry);
            },
            (err) => {
              alert('Temporary file could not be created: ' + err);
              console.log(err);
            }
          );
        },
        (err) => {
          alert('Temporary File System could not be loaded: ' + err);
          console.log(err);
        }
      );
    });
  }

  urlChanged() {
    this.writeSettings();
  }

  zipUrlChanged() {
    this.writeSettings();
  }

  zipFirstChanged() {
    this.writeSettings();
  }

  zipCheckInternetChanged() {
    this.writeSettings();
  }

  initializeZipFirst() {
    this.data.network.internetChecking = true;
    this.setNetworkCheckingStatus('Checking Local Availability...', 'localInit', true);
    var localCopyNotAvailable = () => {
      this.setNetworkCheckingStatus('Local copy unavailable.', 'error', true, 999);
      setTimeout(() => {
        this.downloadZipUrl();
      }, 1500);
    };
    this.getZipDirectoryEntry(
      (dirEntry) => {
        dirEntry.getFile(
          'index.html',
          { create: false },
          (entry) => {
            // temp
            // this.data.url = entry.toURL();
            this.setNetworkCheckingStatus('OK. Local copy available.', 'local', true, 999);
            setTimeout(() => {
              this.doGoToUrl(entry.toURL(), this.data.zipCheckInternet);
            }, 1500);
            console.log('success what?', entry.toURL(), entry);
          },
          (err) => {
            localCopyNotAvailable();
            console.log('error yes?', err);
          }
        );
        console.log('getAppDirectoryEntry', dirEntry);
      },
      (err) => {
        localCopyNotAvailable();
        // alert('Unexpected IO Error:34:getAppDirectoryEntry failed');
        console.log('NOOOOOO getAppDirectoryEntry', err);
      }
    );
  }

  initializeApp() {
    setTimeout(() => {
      this.data.network.checking = true;
      this.checkNetworkStatus();
    }, 1500);

    setTimeout(() => {
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
    }, 2000);
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

  clearZipUrl(input) {
    if (!confirm('Are you sure to clear Zip URL?')) {
      return;
    }
    this.data.zipUrl = '';
    this.data.zipDirectory = '';
    this.zipUrlChanged();
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
          () => {
            //
          },
          () => {
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
  }

  ensureDeviceReady(callback) {
    if (this.isDeviceReady) {
      callback();
      return;
    }
    console.log('will ensure..');
    setTimeout(() => {
      this.ensureDeviceReady(callback);
    }, 500);
  }

  init(callback) {
    this.initStorage(() => {
      if ((!this.data.zipFirst && this.data.url == '') || (this.data.zipFirst && this.data.zipUrl == '')) {
        this.data.editMode = true;
      } else {
        this.data.editMode = false;
      }
      this.ensureDeviceReady(() => {
        this.initializeApp();
      });
      if (callback) {
        callback();
      }
      this.initShortcuts();
    });
  }
}
