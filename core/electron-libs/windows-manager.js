/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

const {BrowserWindow, ipcMain} = require('electron');
const electronRemote = require('@electron/remote/main');
const path = require('path');
const electronLocalShortcut = require('electron-localshortcut');
const {
  REQUEST_MAXIMIZE_WINDOW,
  REQUEST_CREATE_WINDOW,
  REQUEST_IS_FIRST_WINDOW,
  RESPONSE_IS_FIRST_WINDOW,
  REQUEST_STARTUP_DATA,
  RESPONSE_STARTUP_DATA,
} = require('./events');

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class WindowsManager {
  #windowConfig = {
    show: false,
    icon: this.#getIcon(),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  };

  activeWindows = [];

  activateListeners() {
    ipcMain.on(REQUEST_CREATE_WINDOW, (e, options) => {
      this.createWindow(options);
    });

    ipcMain.on(REQUEST_MAXIMIZE_WINDOW, (event, windowId) => {
      const window = this.activeWindows.find(windowInfo => windowInfo.id === windowId)?.window;
      if (window) {
        window.maximize();
      }
    });

    ipcMain.on(REQUEST_IS_FIRST_WINDOW, event => {
      event.sender.send(RESPONSE_IS_FIRST_WINDOW, true);
    });
  }

  createWindow(options) {
    const newWindow = new BrowserWindow(this.#windowConfig);
    const windowInfo = {
      id: uuid(),
      window: newWindow,
      options,
    };

    this.#configureWindow(windowInfo);
    if (!this.activeWindows.length) {
      electronRemote.initialize();
    }

    this.activeWindows.push(windowInfo);
    electronRemote.enable(newWindow.webContents);
    this.#onWindowStartUp(windowInfo);
    this.#loadApplication(windowInfo);

    return newWindow;
  }

  #configureWindow(windowInfo) {
    const win = windowInfo.window;

    win.show();
    win.removeMenu();
    win.on('closed', () => {
      const windowIndex = this.activeWindows.findIndex(({id}) => windowInfo.id === id);
      if (windowIndex >= 0) {
        this.activeWindows.splice(windowIndex, 1);
        console.log(`Window closed: ${windowInfo.id} `);
      }
    });

    win.webContents.setWindowOpenHandler(() => {
      return {action: 'allow', overrideBrowserWindowOptions: {width: 1280, height: 720}};
    });
  }

  #getIcon() {
    const iconPathArray = ['..', 'apps', 'ame', 'src', 'assets', 'img', 'png', 'aspect-model-editor-targetsize-192.png'];
    return path.join(__dirname, ...iconPathArray);
  }

  #onWindowStartUp({id, options}) {
    const executeFn = event => {
      console.log('RECEIVED REQUEST STARTUP DATA');
      event.sender.send(RESPONSE_STARTUP_DATA, {id, options});
      ipcMain.removeListener(REQUEST_STARTUP_DATA, executeFn);
    };

    ipcMain.on(REQUEST_STARTUP_DATA, executeFn);
  }

  #enableDevtools(window) {
    window.webContents.openDevTools();
    electronLocalShortcut.register(window, 'CommandOrControl+F12', () => {
      window.webContents.openDevTools();
    });
  }

  #loadApplication({window, id}) {
    if (process.argv.includes('--dev')) {
      return window.loadURL('http://localhost:4200').then(() => {
        this.#enableDevtools(window);
        console.log(`DEV: Window ${id} created!`);
      });
    }
    return window.loadFile('./dist/apps/ame/index.html').then(() => console.log(`Window ${id} created!`));
  }
}

exports.windowsManager = new WindowsManager();
