# End-to-End Testing Guide

This document describes the comprehensive end-to-end testing setup for the Young Eagles PWA homework assignment workflow.

## Overview

The E2E tests cover the complete homework assignment lifecycle:

1. **Teacher/Admin creates assignment** → Database insert
2. **Parent views dashboard** → Real-time updates
3. **Student submits work** → Progress tracking
4. **Teacher views submission** → Completion verification

## Test Frameworks

### Cypress (Development)
- **Purpose**: Development and debugging
- **Features**: Interactive test runner, time travel debugging
- **Location**: `cypress/e2e/`

### Playwright (CI/Production)
- **Purpose**: CI/CD pipeline and cross-browser testing
- **Features**: Multi-browser support, mobile testing, parallel execution
- **Location**: `playwright-tests/`

## Prerequisites

1. **Backend Server**: Ensure the API server is running on `http://localhost:3001`
2. **Frontend Server**: PWA should be running on `http://localhost:3002`
3. **Test Data**: Test users must exist in the database:
   - Teacher: `teacher@test.com` / `password123`
   - Parent: `parent@test.com` / `password123`
   - Children: Associated with parent account

## Installation

```bash
# Install all dependencies including test frameworks
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Development with Cypress

```bash
# Open Cypress Test Runner (Interactive)
npm run test:e2e:open

# Run Cypress tests in headless mode
npm run test:e2e
```

### Production with Playwright

```bash
# Run all Playwright tests
npm run test:playwright

# Run with UI mode (interactive)
npm run test:playwright:ui

# View test report
npm run test:playwright:report

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run mobile tests
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### All Tests

```bash
# Run all test suites
npm run test:all
```

## Test Structure

### Cypress Test (`cypress/e2e/homework-workflow.cy.js`)

```javascript
describe('Homework Assignment End-to-End Workflow', () => {
  // Step 1: Teacher creates assignment
  it('should create assignment as teacher', () => {
    cy.loginAsTeacher();
    cy.createHomeworkAssignment(assignmentData);
    cy.verifyAssignmentInDatabase(assignmentId);
  });

  // Step 2: Parent views dashboard
  it('should show assignment in parent dashboard', () => {
    cy.loginAsParent();
    cy.waitForDashboardUpdate();
    cy.verifyProgressBarUpdate();
  });

  // Step 3: Student submits work
  it('should submit homework and update counters', () => {
    cy.submitHomeworkAssignment(homeworkId, submissionData);
    cy.verifySubmissionCountIncrement();
  });

  // Step 4: Teacher views submission
  it('should display submission in teacher dashboard', () => {
    cy.loginAsTeacher();
    cy.verifySubmissionInTeacherDashboard();
  });
});
```

### Custom Commands

Located in `cypress/support/commands.js`:

- `cy.loginAsTeacher()` - Authenticate as teacher
- `cy.loginAsParent()` - Authenticate as parent
- `cy.createHomeworkAssignment()` - Create assignment via API
- `cy.verifyAssignmentInDatabase()` - Confirm DB insert
- `cy.submitHomeworkAssignment()` - Submit homework
- `cy.waitForDashboardUpdate()` - Wait for real-time updates
- `cy.verifyProgressBarUpdate()` - Check progress bar changes

## Test Data

### Fixtures (`cypress/fixtures/test-data.json`)

```json
{
  "teachers": [
    {
      "email": "teacher@test.com",
      "password": "password123",
      "className": "Panda Class"
    }
  ],
  "parents": [
    {
      "email": "parent@test.com", 
      "password": "password123"
    }
  ],
  "assignments": [
    {
      "title": "Math Worksheet - Addition",
      "description": "Complete pages 12-15",
      "class_name": "Panda Class",
      "due_date_days_from_now": 7
    }
  ]
}
```

## Data-Cy Attributes

The following test selectors are used:

### Parent Dashboard
- `[data-cy="homework-total-count"]` - Total assignments count
- `[data-cy="submission-count"]` - Submitted assignments count
- `[data-cy="progress-percentage"]` - Completion percentage
- `[data-cy="progress-bar"]` - Progress bar element
- `[data-cy="homework-progress"]` - Progress section container

### Teacher Dashboard
- `[data-cy="total-submissions"]` - Total submissions count
- `[data-cy="recent-submissions"]` - Recent submissions section

### Forms
- `[data-cy="email-input"]` - Login email field
- `[data-cy="password-input"]` - Login password field
- `[data-cy="login-button"]` - Login submit button
- `[data-cy="submission-text"]` - Homework submission text
- `[data-cy="submission-notes"]` - Submission notes
- `[data-cy="file-upload"]` - File upload input
- `[data-cy="submit-button"]` - Submit button

## CI/CD Pipeline

### GitHub Actions (`.github/workflows/e2e-tests.yml`)

The workflow includes:

1. **Cypress Tests**: Development-focused with Chrome browser
2. **Playwright Tests**: Cross-browser testing (Chrome, Firefox, Safari)
3. **Mobile Tests**: Mobile Chrome and Safari
4. **Artifact Upload**: Screenshots, videos, and reports

### Workflow Triggers
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

## Environment Configuration

### Cypress (`cypress.config.js`)
```javascript
{
  baseUrl: 'http://localhost:3002',
  env: {
    API_BASE_URL: 'http://localhost:3001',
    TEACHER_EMAIL: 'teacher@test.com',
    PARENT_EMAIL: 'parent@test.com'
  }
}
```

### Playwright (`playwright.config.js`)
```javascript
{
  baseURL: 'http://localhost:3002',
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
    { name: 'Mobile Chrome' },
    { name: 'Mobile Safari' }
  ]
}
```

## Real-Time Testing

### WebSocket Testing
Tests include mock WebSocket connections to verify real-time updates:

```javascript
cy.mockWebSocket();
cy.window().then((window) => {
  window.socket.emit('homework_update', mockEvent);
});
cy.waitForDashboardUpdate(expectedCount);
```

## Database Verification

Tests verify database operations through API calls:

```javascript
cy.verifyAssignmentInDatabase(assignmentId).then((assignment) => {
  expect(assignment.homework.title).to.eq('Test Assignment');
  expect(assignment.homework.class_name).to.eq('Panda Class');
});
```

## Debugging

### Cypress Debugging
- Use `cy.pause()` to pause test execution
- Enable video recording for failed tests
- Screenshot on failure automatically captured

### Playwright Debugging
```bash
# Debug mode
npx playwright test --debug

# Headed mode
npx playwright test --headed

# Specific test with debug
npx playwright test homework-workflow.spec.js --debug
```

## Test Reports

### Cypress
- Screenshots: `cypress/screenshots/`
- Videos: `cypress/videos/`

### Playwright
- HTML Report: `playwright-report/`
- JSON Results: `playwright-report/results.json`
- JUnit XML: `playwright-report/results.xml`

## Troubleshooting

### Common Issues

1. **Server not running**: Ensure both frontend (3002) and backend (3001) are running
2. **Test data missing**: Verify test users exist in database
3. **WebSocket errors**: Check real-time connection configuration
4. **File upload issues**: Ensure file upload endpoints are configured

### Test Timeouts
- Default timeout: 10 seconds
- Network requests: 10 seconds
- File uploads: 30 seconds

### Browser Issues
- Clear browser cache between test runs
- Check browser versions compatibility
- Verify headless mode configuration

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Remove test data after test completion
3. **Stable Selectors**: Use data-cy attributes over CSS selectors
4. **Assertions**: Verify state changes at each step
5. **Timeouts**: Use appropriate waits for async operations

## Future Enhancements

1. **Performance Testing**: Add load testing with multiple concurrent users
2. **API Testing**: Separate API endpoint testing
3. **Visual Testing**: Screenshot comparison testing
4. **Accessibility Testing**: A11y compliance verification
5. **Security Testing**: XSS and CSRF protection verification

## Support

For issues with E2E testing:
1. Check console logs for detailed error information
2. Review test artifacts (screenshots/videos)
3. Verify environment configuration
4. Ensure test data setup is correct
