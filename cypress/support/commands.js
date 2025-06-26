// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom commands for authentication
Cypress.Commands.add('loginAsTeacher', (email, password) => {
  const teacherEmail = email || Cypress.env('TEACHER_EMAIL');
  const teacherPassword = password || Cypress.env('TEACHER_PASSWORD');
  
  cy.visit('/teacher-login');
  cy.get('[data-cy="email-input"]').type(teacherEmail);
  cy.get('[data-cy="password-input"]').type(teacherPassword);
  cy.get('[data-cy="login-button"]').click();
  
  // Wait for successful login
  cy.url().should('include', '/teacher-dashboard');
  cy.window().its('localStorage').invoke('getItem', 'accessToken').should('exist');
});

Cypress.Commands.add('loginAsParent', (email, password) => {
  const parentEmail = email || Cypress.env('PARENT_EMAIL');
  const parentPassword = password || Cypress.env('PARENT_PASSWORD');
  
  cy.visit('/login');
  cy.get('[data-cy="email-input"]').type(parentEmail);
  cy.get('[data-cy="password-input"]').type(parentPassword);
  cy.get('[data-cy="login-button"]').click();
  
  // Wait for successful login
  cy.url().should('include', '/parent-dashboard');
  cy.window().its('localStorage').invoke('getItem', 'accessToken').should('exist');
});

Cypress.Commands.add('loginAsAdmin', (email, password) => {
  const adminEmail = email || Cypress.env('ADMIN_EMAIL');
  const adminPassword = password || Cypress.env('ADMIN_PASSWORD');
  
  cy.visit('/admin-login');
  cy.get('[data-cy="email-input"]').type(adminEmail);
  cy.get('[data-cy="password-input"]').type(adminPassword);
  cy.get('[data-cy="login-button"]').click();
  
  // Wait for successful login
  cy.url().should('include', '/admin-dashboard');
  cy.window().its('localStorage').invoke('getItem', 'accessToken').should('exist');
});

// Custom command to create homework assignment via API
Cypress.Commands.add('createHomeworkAssignment', (assignmentData) => {
  return cy.window().then((window) => {
    const token = window.localStorage.getItem('accessToken');
    
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('API_BASE_URL')}/homework/create`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        title: assignmentData.title || 'Test Homework Assignment',
        description: assignmentData.description || 'Test assignment for Cypress E2E testing',
        instructions: assignmentData.instructions || 'Complete the assigned work and submit before due date.',
        class_name: assignmentData.class_name || 'Panda Class',
        due_date: assignmentData.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        child_ids: assignmentData.child_ids || [1, 2],
        grade: assignmentData.grade || 'Grade 3'
      }
    });
  });
});

// Custom command to check database for assignment creation
Cypress.Commands.add('verifyAssignmentInDatabase', (assignmentId) => {
  return cy.window().then((window) => {
    const token = window.localStorage.getItem('accessToken');
    
    return cy.request({
      method: 'GET',
      url: `${Cypress.env('API_BASE_URL')}/homework/${assignmentId}`,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
      return response.body;
    });
  });
});

// Custom command to submit homework assignment
Cypress.Commands.add('submitHomeworkAssignment', (homeworkId, submissionData) => {
  return cy.window().then((window) => {
    const token = window.localStorage.getItem('accessToken');
    
    const formData = new FormData();
    formData.append('homework_id', homeworkId);
    formData.append('submission_text', submissionData.submission_text || 'Test submission for homework');
    formData.append('notes', submissionData.notes || 'Submitted via Cypress E2E test');
    
    // Mock file upload if file is provided
    if (submissionData.file) {
      formData.append('file', submissionData.file);
    }
    
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('API_BASE_URL')}/homework/submit/${homeworkId}`,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
  });
});

// Custom command to wait for real-time updates
Cypress.Commands.add('waitForDashboardUpdate', (expectedCount, timeout = 10000) => {
  cy.get('[data-cy="homework-total-count"]', { timeout }).should('contain', expectedCount);
});

// Custom command to check progress bar updates
Cypress.Commands.add('verifyProgressBarUpdate', (expectedPercentage) => {
  cy.get('[data-cy="progress-bar"]')
    .should('have.attr', 'style')
    .and('include', `width: ${expectedPercentage}%`);
});

// Custom command to check submission count increment
Cypress.Commands.add('verifySubmissionCountIncrement', (previousCount) => {
  cy.get('[data-cy="submission-count"]')
    .should('not.contain', previousCount)
    .invoke('text')
    .then((newCountText) => {
      const newCount = parseInt(newCountText);
      expect(newCount).to.be.greaterThan(previousCount);
    });
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.window().then((window) => {
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('selectedChild');
    window.localStorage.removeItem('teacherId');
    window.localStorage.removeItem('parent_id');
  });
  cy.visit('/');
});

// Custom command to clear all data
Cypress.Commands.add('clearAllData', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.window().then((window) => {
    window.sessionStorage.clear();
  });
});

// Mock WebSocket connections for real-time testing
Cypress.Commands.add('mockWebSocket', () => {
  cy.window().then((window) => {
    // Mock socket.io for real-time updates testing
    window.mockSocket = {
      emit: cy.stub(),
      on: cy.stub(),
      disconnect: cy.stub()
    };
  });
});
