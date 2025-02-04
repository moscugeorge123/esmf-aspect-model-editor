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

const {defineConfig} = require('cypress');

module.exports = defineConfig({
  fileServerFolder: '.',
  fixturesFolder: 'apps/ame-e2e/src/fixtures',
  modifyObstructiveCode: false,
  viewportWidth: 1920,
  viewportHeight: 1080,
  reporter: 'node_modules/mochawesome',
  video: false,
  videoUploadOnPasses: false,
  screenshotOnRunFailure: false,
  videosFolder: 'apps/ame-e2e/cypress/videos',
  screenshotsFolder: 'apps/ame-e2e/cypress/screenshots',
  chromeWebSecurity: false,
  defaultCommandTimeout: 20000,
  reporterOptions: {
    reportDir: 'apps/ame-e2e/cypress/reports',
    overwrite: false,
    html: true,
    saveHtml: true,
    reportPageTitle: 'Aspect Model Editor Tests',
    reportTitle: 'Aspect Model Editor Tests',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('apps/ame-e2e/src/plugins/index.js')(on, config);
    },
    testIsolation: false,
    specPattern: 'apps/ame-e2e/src/integration',
    supportFile: 'apps/ame-e2e/src/support/index.ts',
    baseUrl: 'http://localhost:4200/',
  },
});
