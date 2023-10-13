import {EditorService} from '@ame/editor';
import {MigratorService} from '@ame/migrator';
import {ElectronTunnelService, ModelSavingTrackerService, SidebarService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Observable, filter, of, switchMap, take, tap} from 'rxjs';

@Injectable({providedIn: 'root'})
export class StartupService {
  constructor(
    private migratorService: MigratorService,
    private sidebarService: SidebarService,
    private router: Router,
    private editorService: EditorService,
    private modelSaveTracker: ModelSavingTrackerService,
    private electronTunnelService: ElectronTunnelService
  ) {}

  listenForLoading() {
    this.router.events
      .pipe(
        filter(ev => ev instanceof NavigationEnd && ev.url.includes('/editor')),
        switchMap(() => this.electronTunnelService.startUpData$.asObservable()),
        filter(Boolean),
        take(1),
        switchMap(({isFirstWindow, model}) =>
          (isFirstWindow ? this.migratorService.startMigrating() : of()).pipe(switchMap(() => this.loadModel(model)))
        )
      )
      .subscribe(() => {
        this.sidebarService.refreshSidebarNamespaces();
        this.router.navigate([{outlets: {migrator: null, 'export-namespaces': null, 'import-namespaces': null}}]);
      });
  }

  loadModel(model: string): Observable<any> {
    return this.editorService.loadNewAspectModel(model, '').pipe(tap(() => this.modelSaveTracker.updateSavedModel()));
  }
}
