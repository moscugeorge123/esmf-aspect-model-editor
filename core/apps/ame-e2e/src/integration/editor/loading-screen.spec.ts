/* eslint-disable cypress/no-unnecessary-waiting */
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

/// <reference types="Cypress" />

import {
  GENERATION_tbOpenDoc,
  SELECTOR_dialogStartButton,
  SELECTOR_loadingCloseButton,
  SELECTOR_tbGenerateDocumentButton,
  SELECTOR_tbPrintButton,
  SELECTOR_tbValidateButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test loading screen', () => {
  it('can cancel loading model', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {
      fixture: 'model-validation-response.json',
      delay: 5000,
    });
    cy.visitDefault();
    cy.fixture('all-characteristic')
      .as('rdfString')
      .then(rdfString => cyHelp.loadCustomModel(rdfString))
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}))
      .then(() => cy.get(SELECTOR_loadingCloseButton).click({force: true}))
      .then(() => cy.get('.cdk-overlay-container').should('not.be.visible', 8000));
  });

  it('can cancel validation', () => {
    cy.startModelling()
      .then(() => cy.get(SELECTOR_tbValidateButton).click({force: true}))
      .then(() => cy.get(SELECTOR_loadingCloseButton).click({force: true}))
      .then(() => cy.get('.cdk-overlay-container').should('not.be.visible', 8000));
  });

  it('can cancel generate html documentation', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.get(SELECTOR_tbGenerateDocumentButton)
      .click({force: true})
      .then(() => cy.get(SELECTOR_tbPrintButton).click({force: true}))
      .then(() => cy.get(GENERATION_tbOpenDoc).click({force: true}))
      .then(() => cy.get(SELECTOR_loadingCloseButton).click({force: true}))
      .then(() => cy.get('.cdk-overlay-container').should('not.be.visible', 8000));
  });
});
