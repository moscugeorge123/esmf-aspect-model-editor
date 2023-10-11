import {EditorService} from '@ame/editor';
import {MigratorService} from '@ame/migrator';
import {ElectronTunnelService, SidebarService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Observable, filter, of, switchMap, take} from 'rxjs';

@Injectable({providedIn: 'root'})
export class StartupService {
  constructor(
    private migratorService: MigratorService,
    private sidebarService: SidebarService,
    private electronTunnel: ElectronTunnelService,
    private router: Router,
    private editorService: EditorService
  ) {}

  listenForLoading() {
    this.router.events
      .pipe(
        filter(ev => ev instanceof NavigationEnd && ev.url.includes('/editor')),
        take(1),
        switchMap(() => {
          return this.electronTunnel.tmpData?.isFirstWindow ? this.migratorService.startMigrating() : of();
        }),
        switchMap(() => this.loadModel())
      )
      .subscribe(e => {
        console.log(e);
        this.sidebarService.refreshSidebarNamespaces();
        this.router.navigate([{outlets: {migrator: null, 'export-namespaces': null, 'import-namespaces': null}}]);
      });
  }

  loadModel(): Observable<any> {
    const model: string = this.electronTunnel.tmpData?.model;
    return this.editorService.loadNewAspectModel(model, '');
  }
}
