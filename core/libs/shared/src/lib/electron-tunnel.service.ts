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

import {Injectable} from '@angular/core';
import {IpcRenderer} from 'electron';
import {BehaviorSubject, Observable, catchError, of, switchMap} from 'rxjs';
import {StartupData, StartupPayload} from './model';
import {NotificationsService} from './notifications.service';
import {ModelSavingTrackerService} from './model-saving-tracker.service';
import {SaveModelDialogService} from '@ame/editor';

export enum ElectronEvents {
  REQUEST_CREATE_WINDOW = 'REQUEST_CREATE_WINDOW',
  RESPONSE_CREATE_WINDOW = 'RESPONSE_CREATE_WINDOW',

  // Is first window events
  REQUEST_IS_FIRST_WINDOW = 'REQUEST_IS_FIRST_WINDOW',
  RESPONSE_IS_FIRST_WINDOW = 'RESPONSE_IS_FIRST_WINDOW',

  // Has backend error events
  REQUEST_BACKEND_STARTUP_ERROR = 'REQUEST_BACKEND_STARTUP_ERROR',
  RESPONSE_BACKEND_STARTUP_ERROR = 'RESPONSE_BACKEND_STARTUP_ERROR',

  // Startup data events
  REQUEST_STARTUP_DATA = 'REQUEST_STARTUP_DATA',
  RESPONSE_STARTUP_DATA = 'RESPONSE_STARTUP_DATA',

  // Maximize window events
  REQUEST_MAXIMIZE_WINDOW = 'REQUEST_MAXIMIZE_WINDOW',
  RESPONSE_MAXIMIZE_WINDOW = 'RESPONSE_MAXIMIZE_WINDOW',

  // On window close events
  REQUEST_IS_FILE_SAVED = 'REQUEST_IS_FILE_SAVED',
  REQUEST_CLOSE_WINDOW = 'REQUEST_CLOSE_WINDOW',
}

@Injectable({
  providedIn: 'root',
})
export class ElectronTunnelService {
  public windowInfo: StartupData;
  public ipcRenderer: IpcRenderer = window.require?.('electron').ipcRenderer;
  public startUpData$ = new BehaviorSubject<{isFirstWindow: boolean; model: string}>(null);

  constructor(
    private notificationsService: NotificationsService,
    private modelSavingTracker: ModelSavingTrackerService,
    private saveModelDialogService: SaveModelDialogService
  ) {}

  public subscribeMessages() {
    if (!this.ipcRenderer) {
      return;
    }

    this.onServiceNotStarted();
  }

  public setWindowInfo(id: string, options: StartupPayload) {
    this.windowInfo = {id, options};
  }

  public openWindow(config?: StartupPayload) {
    if (!this.ipcRenderer) {
      return;
    }

    if (!this.ipcRenderer) {
      this.notificationsService.error({
        title: 'Application not opened in electron',
        message: 'To open a new window, please open the application through electron',
      });
      return;
    }

    this.ipcRenderer.send(ElectronEvents.REQUEST_CREATE_WINDOW, config);
  }

  public onWindowClose() {
    if (!this.ipcRenderer) {
      return;
    }

    this.ipcRenderer.on(ElectronEvents.REQUEST_IS_FILE_SAVED, (_: unknown, windowId: string) => {
      this.modelSavingTracker.isSaved$
        .pipe(
          switchMap(isSaved => (isSaved ? of(true) : this.saveModelDialogService.openDialog())),
          catchError(() => of(true))
        )
        .subscribe((close: boolean) => {
          close && this.ipcRenderer.send(ElectronEvents.REQUEST_CLOSE_WINDOW, windowId);
        });
    });
  }

  public isFirstWindow(): Observable<boolean> {
    if (!this.ipcRenderer) {
      return of(true);
    }

    this.ipcRenderer.send(ElectronEvents.REQUEST_IS_FIRST_WINDOW);
    return new Observable(observer => {
      const executorFn = (_: unknown, result: boolean) => {
        observer.next(result);
        this.ipcRenderer.removeListener(ElectronEvents.RESPONSE_IS_FIRST_WINDOW, executorFn);
        observer.complete();
      };
      this.ipcRenderer.on(ElectronEvents.RESPONSE_IS_FIRST_WINDOW, executorFn);
    });
  }

  public requestStartupData(): Observable<StartupData> {
    if (!this.ipcRenderer) {
      return of(null);
    }

    this.ipcRenderer.send(ElectronEvents.REQUEST_STARTUP_DATA);
    return new Observable(observer => {
      this.ipcRenderer.on(ElectronEvents.RESPONSE_STARTUP_DATA, (_: unknown, data: StartupData) => {
        this.ipcRenderer.send(ElectronEvents.REQUEST_MAXIMIZE_WINDOW, data.id);
        observer.next(data);
        observer.complete();
      });
    });
  }

  private onServiceNotStarted() {
    this.ipcRenderer.on(ElectronEvents.RESPONSE_BACKEND_STARTUP_ERROR, () => {
      this.notificationsService.error({title: 'Backend not started. Try to reopen the application'});
    });
  }
}
