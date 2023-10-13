import {Component, NgZone} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FileHandlingService} from '@ame/editor';

@Component({
  templateUrl: 'save-model-dialog.component.html',
})
export class SaveModelDialogComponent {
  public disabledButton = false;

  constructor(
    private fileHandlingService: FileHandlingService,
    private matDialogRef: MatDialogRef<SaveModelDialogComponent>,
    private zone: NgZone
  ) {}

  close(destroyWindow: boolean) {
    this.matDialogRef.close(destroyWindow);
  }

  saveModel() {
    this.disabledButton = true;
    this.zone.run(() => {
      this.fileHandlingService.saveAspectModelToWorkspace().subscribe(() => {
        this.disabledButton = false;
        this.matDialogRef.close(true);
      });
    });
  }
}
