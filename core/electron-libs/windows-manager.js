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

  listenForOpeningWindow() {
    ipcMain.on('create-window', (e, argument) => {
      this.createWindow();
      console.log(argument);
    });
  }

  createWindow() {
    const newWindow = new BrowserWindow(this.#windowConfig);

    this.#configureWindow(newWindow);

    electronRemote.enable(newWindow.webContents);

    if (process.argv.includes('--dev')) {
      newWindow.loadURL('http://localhost:4200/').then(() => console.log(`DEV: Window ${this.activeWindows.length + 1} created!`));
    } else {
      newWindow.loadFile('./dist/apps/ame/index.html').then(() => console.log(`Window ${this.activeWindows.length + 1} created!`));
    }

    electronLocalShortcut.register(newWindow, 'CommandOrControl+F12', () => {
      mainWindow.webContents.openDevTools();
    });

    newWindow.webContents.setWindowOpenHandler(() => {
      return {action: 'allow', overrideBrowserWindowOptions: {width: 1280, height: 720}};
    });

    this.activeWindows.push(newWindow);
    return newWindow;
  }

  #configureWindow(win) {
    win.maximize();
    win.show();
    win.removeMenu();
    win.on('closed', () => {
      const windowIndex = this.activeWindows.findIndex(item => item === win);
      if (windowIndex >= 0) {
        this.activeWindows.splice(windowIndex, 1);
        console.log('Window closed');
      }
    });
  }

  #getIcon() {
    const iconPathArray = ['..', 'apps', 'ame', 'src', 'assets', 'img', 'png', 'aspect-model-editor-targetsize-192.png'];
    return path.join(__dirname, ...iconPathArray);
  }
}

exports.WindowsManager = WindowsManager;
