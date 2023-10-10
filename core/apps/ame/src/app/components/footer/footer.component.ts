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

import {Component, inject} from '@angular/core';
import {EditorService} from '@ame/editor';
import {Router} from '@angular/router';

@Component({
  selector: 'ame-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  private editorService = inject(EditorService);
  private router = inject(Router);
  public savedModel$ = this.editorService.savedRdf$;

  toLoading() {
    console.log('CLicked loading');
    this.router.navigate(['loading']);
  }
}
