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

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ElementModel} from '@ame/shared';
import {FiltersService} from '@ame/loader-filters';
import {ModelService} from '@ame/rdf/services';
import {
  DefaultAspect,
  DefaultAbstractProperty,
  DefaultProperty,
  DefaultCharacteristic,
  DefaultAbstractEntity,
  DefaultEntity,
  DefaultUnit,
  DefaultConstraint,
  DefaultTrait,
  DefaultOperation,
  DefaultEvent,
} from '@ame/meta-model';

const elementMap = {
  aspect: DefaultAspect,
  abstractProperty: DefaultAbstractProperty,
  property: DefaultProperty,
  characteristic: DefaultCharacteristic,
  abstractEntity: DefaultAbstractEntity,
  entity: DefaultEntity,
  unit: DefaultUnit,
  constraint: DefaultConstraint,
  trait: DefaultTrait,
  operation: DefaultOperation,
  event: DefaultEvent,
};

@Component({
  selector: 'ame-sidebar-new-element',
  templateUrl: './sidebar-new-element.component.html',
  styleUrls: ['./sidebar-new-element.component.scss'],
})
export class SidebarNewElementComponent implements OnInit {
  @Output()
  public openWorkspaces: EventEmitter<void> = new EventEmitter();
  public elements: ElementModel[];

  constructor(private filtersService: FiltersService, private modelService: ModelService) {}

  public ngOnInit() {
    this.elements = [
      new ElementModel(null, 'Aspect', 'aspect', 'The root element of each Aspect Model'),
      new ElementModel(null, 'AbstractProperty', 'abstractProperty', 'Abstract named value'),
      new ElementModel(null, 'Property', 'property', 'Named Value'),
      new ElementModel(null, 'Characteristic', 'characteristic', 'The meaning of a Property in the context of the Aspect'),
      new ElementModel(null, 'AbstractEntity', 'abstractEntity', 'The abstraction of a logical encapsulation of multiple values'),
      new ElementModel(null, 'Entity', 'entity', 'The logical encapsulation of multiple values'),
      new ElementModel(null, 'Unit', 'unit', 'A definition of a physical unit'),
      new ElementModel(null, 'Constraint', 'constraint', 'A limitation applied to a Characteristic'),
      new ElementModel(null, 'Trait', 'trait', 'Encapsulates multiple limitations to Characteristics'),
      new ElementModel(null, 'Operation', 'operation', 'An Operation represents an action that can be triggered on the Aspect'),
      new ElementModel(null, 'Event', 'event', 'A definition of an Event supported by the Aspect'),
    ];
  }

  public isVisible(element: ElementModel) {
    const visibleElements = this.filtersService.currentFilter.visibleElements;
    if (this.isAspectHidden(element)) {
      return false;
    }

    return visibleElements.some(c => elementMap[element.type] === c);
  }

  private isAspectHidden(element: ElementModel): boolean {
    return !!(element.type === 'aspect' && this.modelService.getLoadedAspectModel().aspect);
  }
}
