// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing the test on uncaught exceptions
  // This is useful for React development mode warnings
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  // Continue with other exceptions
  return true;
});

// Set up before each test
beforeEach(() => {
  // Clear all data before each test
  cy.clearAllData();
  
  // Mock console errors if needed
  cy.window().then((win) => {
    cy.stub(win.console, 'error').as('consoleError');
  });
});

// Clean up after each test
afterEach(() => {
  // Take screenshot on failure
  cy.screenshot({ capture: 'fullPage' });
  
  // Clean up any open connections
  cy.window().then((win) => {
    if (win.socket) {
      win.socket.disconnect();
    }
  });
});
