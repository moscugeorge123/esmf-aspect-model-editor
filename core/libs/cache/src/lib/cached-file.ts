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

import {
  Aspect,
  BaseMetaModelElement,
  Characteristic,
  DefaultAbstractEntity,
  DefaultAbstractProperty,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEvent,
  DefaultProperty,
  DefaultUnit,
  Entity,
  IsNamed,
  Property,
} from '@ame/meta-model';

export class CachedFile {
  private anonymousElements: {element: BaseMetaModelElement; name: string}[] = [];
  private cachedElements: Map<string, any> = new Map<string, BaseMetaModelElement>();
  private _aspect: Aspect;

  get aspect(): Aspect {
    return this._aspect;
  }

  set aspect(value: Aspect) {
    if (value instanceof DefaultAspect) {
      this._aspect = value;
    }
  }

  constructor(public fileName: string, public namespace: string) {}

  resolveElement<T>(instance: T & IsNamed): T {
    const aspectModelUrn = instance.aspectModelUrn;
    const resolvedInstance: T = this.getElement(aspectModelUrn);
    if (resolvedInstance) {
      return resolvedInstance;
    }

    this.cachedElements.set(aspectModelUrn, instance);
    return instance;
  }

  removeElement(key: string): void {
    this.cachedElements.delete(key);
  }

  removeAspect() {
    this._aspect = null;
  }

  reset() {
    this.cachedElements = new Map<string, BaseMetaModelElement>();
    this._aspect = null;
    this.anonymousElements = [];
  }

  getElement<T>(key: string): T {
    return this.cachedElements.get(key);
  }

  getEitherElement<T>(key: string): T {
    return this.cachedElements.get(key);
  }

  getAllElements<T extends BaseMetaModelElement>(): Array<T> {
    return [...this.cachedElements.values()];
  }

  updateCachedElementKey(oldKey: string, newKey: string) {
    const resolvedEntry = this.cachedElements.get(oldKey);
    if (resolvedEntry) {
      this.cachedElements.delete(oldKey);
      this.cachedElements.set(newKey, resolvedEntry);
    }
  }

  getCachedEntities(): Array<Entity> {
    const entities: Array<Entity> = [];
    this.cachedElements.forEach(modelElement => {
      if (modelElement instanceof DefaultEntity) {
        entities.push(modelElement);
      }
    });
    return entities;
  }

  getCachedAbstractEntities(): Array<DefaultAbstractEntity> {
    const entities: Array<DefaultAbstractEntity> = [];
    this.cachedElements.forEach(modelElement => {
      if (modelElement instanceof DefaultAbstractEntity) {
        entities.push(modelElement);
      }
    });
    return entities;
  }

  getCachedAbstractProperties(): Array<DefaultAbstractProperty> {
    const abstractProperties: Array<DefaultAbstractProperty> = [];
    this.cachedElements.forEach(modelElement => {
      if (modelElement instanceof DefaultAbstractProperty) {
        abstractProperties.push(modelElement);
      }
    });
    return abstractProperties;
  }

  getCachedProperties(): Array<Property> {
    const properties: Array<Property> = [];
    this.cachedElements.forEach(modelElement => {
      if (modelElement instanceof DefaultProperty) {
        properties.push(modelElement);
      }
    });
    return properties;
  }

  getCachedEntityValues(): Array<DefaultEntityValue> {
    return Array.from(this.cachedElements.values()).reduce(
      (acc: DefaultEntityValue[], item: any) => (item instanceof DefaultEntityValue ? [...acc, item] : acc),
      []
    );
  }

  getCachedCharacteristics(): Array<Characteristic> {
    const characteristics: Array<Characteristic> = [];
    this.cachedElements.forEach(modelElement => {
      if (modelElement instanceof DefaultCharacteristic) {
        characteristics.push(modelElement);
      }
    });
    return characteristics;
  }

  getCachedUnits(): Array<DefaultUnit> {
    return Array.from(this.cachedElements.values()).reduce(
      (acc: DefaultUnit[], item: any) => (item instanceof DefaultUnit && !item.isPredefined() ? [...acc, item] : acc),
      []
    );
  }

  getCachedEvents(): Array<DefaultEvent> {
    return Array.from(this.cachedElements.values()).reduce(
      (acc: DefaultEvent[], item: any) => (item instanceof DefaultEvent && !item.isPredefined() ? [...acc, item] : acc),
      []
    );
  }

  updateCachedElementsNamespace(oldValue: string, newValue: string) {
    const newCachedElements = new Map<string, BaseMetaModelElement>();

    this.cachedElements.forEach((element: BaseMetaModelElement, key: string) => {
      const newAspectModelUrn = element.aspectModelUrn.replace(oldValue, newValue);
      const newKey = key.replace(oldValue, newValue);

      element.aspectModelUrn = newAspectModelUrn;
      newCachedElements.set(newKey, element);
    });
    this.cachedElements = newCachedElements;
    this.namespace = this.namespace.replace(oldValue, newValue);
  }

  addAnonymousElement(modelElement: BaseMetaModelElement, name?: string) {
    this.anonymousElements.push({element: modelElement, name: name});
  }

  getAnonymousElements(): {element: BaseMetaModelElement; name: string}[] {
    return [...this.anonymousElements];
  }

  clearAnonymousElements() {
    this.anonymousElements = [];
  }
}
