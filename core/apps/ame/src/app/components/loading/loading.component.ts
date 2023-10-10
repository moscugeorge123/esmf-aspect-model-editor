import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  templateUrl: 'loading.component.html',
  styleUrls: ['loading.component.scss'],
})
export class LoadingComponent {
  constructor(private router: Router) {
    window['router'] = this.router;
  }
}
