import { test, expect } from '@playwright/test';

// Test data
const TEST_DATA = {
  teacher: {
    email: 'teacher@test.com',
    password: 'password123'
  },
  parent: {
    email: 'parent@test.com',
    password: 'password123'
  },
  assignment: {
    title: 'E2E Playwright Math Assignment',
    description: 'Test assignment for Playwright E2E testing',
    instructions: 'Complete the math problems and submit your work.',
    className: 'Panda Class',
    grade: 'Grade 3'
  }
};

test.describe('Homework Assignment E2E Workflow - Playwright', () => {
  let assignmentId;

  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/');
  });

  test.describe('Teacher Creates Assignment', () => {
    test('should login as teacher and create homework assignment', async ({ page }) => {
      // Login as teacher
      await page.goto('/teacher-login');
      await page.fill('[data-cy="email-input"]', TEST_DATA.teacher.email);
      await page.fill('[data-cy="password-input"]', TEST_DATA.teacher.password);
      await page.click('[data-cy="login-button"]');
      
      // Wait for successful login
      await expect(page).toHaveURL(/teacher-dashboard/);
      
      // Navigate to assignment creation
      await page.goto('/teacher/assignments/create');
      
      // Fill out assignment form
      await page.fill('input[name="title"]', TEST_DATA.assignment.title);
      await page.fill('textarea[name="description"]', TEST_DATA.assignment.description);
      await page.fill('textarea[name="instructions"]', TEST_DATA.assignment.instructions);
      
      // Set due date (7 days from now)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateString = futureDate.toISOString().split('T')[0];
      await page.fill('input[type="date"]', dateString);
      
      // Select children (assuming test data exists)
      await page.check('input[type="checkbox"][value="1"]'); // Select first child
      await page.check('input[type="checkbox"][value="2"]'); // Select second child
      
      // Submit the assignment
      await page.click('button[type="submit"]');
      
      // Verify success
      await expect(page.locator('.toast-success, .success-message')).toBeVisible();
      
      // Capture assignment ID from the response or URL
      const currentUrl = page.url();
      const urlMatch = currentUrl.match(/assignment\/(\d+)/);
      if (urlMatch) {
        assignmentId = urlMatch[1];
      }
    });

    test('should verify assignment in teacher dashboard', async ({ page }) => {
      // Login as teacher
      await page.goto('/teacher-login');
      await page.fill('[data-cy="email-input"]', TEST_DATA.teacher.email);
      await page.fill('[data-cy="password-input"]', TEST_DATA.teacher.password);
      await page.click('[data-cy="login-button"]');
      
      await expect(page).toHaveURL(/teacher-dashboard/);
      
      // Check if assignment appears in dashboard
      await expect(page.locator('text=' + TEST_DATA.assignment.title)).toBeVisible();
      
      // Verify stats are updated
      const totalHomeworksElement = page.locator('[data-cy="total-homeworks"]');
      await expect(totalHomeworksElement).toBeVisible();
    });
  });

  test.describe('Parent Views Assignment', () => {
    test('should login as parent and see new assignment', async ({ page }) => {
      // Login as parent
      await page.goto('/login');
      await page.fill('[data-cy="email-input"]', TEST_DATA.parent.email);
      await page.fill('[data-cy="password-input"]', TEST_DATA.parent.password);
      await page.click('[data-cy="login-button"]');
      
      await expect(page).toHaveURL(/parent-dashboard/);
      
      // Select a child
      await page.selectOption('select', '1');
      
      // Wait for data to load
      await page.waitForTimeout(2000);
      
      // Verify the new assignment appears
      await expect(page.locator('text=' + TEST_DATA.assignment.title)).toBeVisible({ timeout: 10000 });
      
      // Check homework progress section
      const progressSection = page.locator('[data-cy="homework-progress"]');
      await expect(progressSection).toBeVisible();
      
      // Verify counts
      const totalCount = page.locator('[data-cy="homework-total-count"]');
      await expect(totalCount).toBeVisible();
      
      const submissionCount = page.locator('[data-cy="submission-count"]');
      await expect(submissionCount).toBeVisible();
      
      const progressBar = page.locator('[data-cy="progress-bar"]');
      await expect(progressBar).toBeVisible();
    });
  });

  test.describe('Student Submits Work', () => {
    test('should navigate to homework and submit work', async ({ page }) => {
      // Login as parent
      await page.goto('/login');
      await page.fill('[data-cy="email-input"]', TEST_DATA.parent.email);
      await page.fill('[data-cy="password-input"]', TEST_DATA.parent.password);
      await page.click('[data-cy="login-button"]');
      
      await expect(page).toHaveURL(/parent-dashboard/);
      
      // Navigate to homework list
      await page.goto('/student/homework?child_id=1');
      
      // Find and click on the assignment
      await page.click(`text=${TEST_DATA.assignment.title}`);
      
      // Fill out submission form
      const submissionText = 'This is my test submission for the Playwright math assignment. I have completed all the problems using various methods.';
      await page.fill('[data-cy="submission-text"]', submissionText);
      
      const submissionNotes = 'Submitted via Playwright E2E test automation. All calculations verified.';
      await page.fill('[data-cy="submission-notes"]', submissionNotes);
      
      // Mock file upload
      const fileInput = page.locator('[data-cy="file-upload"]');
      if (await fileInput.isVisible()) {
        // Create a test file
        await fileInput.setInputFiles({
          name: 'playwright-test-submission.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('This is a test file created by Playwright for homework submission testing.')
        });
      }
      
      // Submit the homework
      await page.click('[data-cy="submit-button"]');
      
      // Verify submission success
      await expect(page.locator('text=Homework submitted successfully')).toBeVisible();
    });

    test('should verify submission appears in parent dashboard', async ({ page }) => {
      // Login as parent
      await page.goto('/login');
      await page.fill('[data-cy="email-input"]', TEST_DATA.parent.email);
      await page.fill('[data-cy="password-input"]', TEST_DATA.parent.password);
      await page.click('[data-cy="login-button"]');
      
      await expect(page).toHaveURL(/parent-dashboard/);
      
      // Select child
      await page.selectOption('select', '1');
      await page.waitForTimeout(2000);
      
      // Force refresh to get latest data
      await page.reload();
      await page.selectOption('select', '1');
      await page.waitForTimeout(2000);
      
      // Verify submission count increased
      const submissionCount = page.locator('[data-cy="submission-count"]');
      await expect(submissionCount).toBeVisible();
      
      // Check that submission count is greater than 0
      const submissionText = await submissionCount.textContent();
      const submissionNumber = parseInt(submissionText);
      expect(submissionNumber).toBeGreaterThan(0);
      
      // Verify progress bar updated
      const progressBar = page.locator('[data-cy="progress-bar"]');
      await expect(progressBar).toBeVisible();
      
      // Check progress percentage
      const progressPercentage = page.locator('[data-cy="progress-percentage"]');
      await expect(progressPercentage).toBeVisible();
      const percentageText = await progressPercentage.textContent();
      const percentage = parseInt(percentageText);
      expect(percentage).toBeGreaterThan(0);
    });
  });

  test.describe('Teacher Views Submission', () => {
    test('should verify submission appears in teacher dashboard', async ({ page }) => {
      // Login as teacher
      await page.goto('/teacher-login');
      await page.fill('[data-cy="email-input"]', TEST_DATA.teacher.email);
      await page.fill('[data-cy="password-input"]', TEST_DATA.teacher.password);
      await page.click('[data-cy="login-button"]');
      
      await expect(page).toHaveURL(/teacher-dashboard/);
      
      // Check recent submissions section
      const recentSubmissions = page.locator('[data-cy="recent-submissions"]');
      
      // Expand submissions section if it's collapsed
      const submissionsToggle = page.locator('text=Recent Submissions');
      await submissionsToggle.click();
      
      // Wait for submissions to load
      await page.waitForTimeout(2000);
      
      // Verify the submission appears
      await expect(page.locator(`text=${TEST_DATA.assignment.title}`)).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Submitted')).toBeVisible();
      
      // Verify teacher stats updated
      const totalSubmissions = page.locator('[data-cy="total-submissions"]');
      await expect(totalSubmissions).toBeVisible();
      const submissionsText = await totalSubmissions.textContent();
      const submissionsCount = parseInt(submissionsText);
      expect(submissionsCount).toBeGreaterThan(0);
    });
  });

  test.describe('Real-time Updates', () => {
    test('should test dashboard real-time updates', async ({ page, context }) => {
      // This test simulates real-time updates by using two browser contexts
      
      // Parent context
      const parentPage = await context.newPage();
      await parentPage.goto('/login');
      await parentPage.fill('[data-cy="email-input"]', TEST_DATA.parent.email);
      await parentPage.fill('[data-cy="password-input"]', TEST_DATA.parent.password);
      await parentPage.click('[data-cy="login-button"]');
      await expect(parentPage).toHaveURL(/parent-dashboard/);
      
      // Teacher context
      const teacherPage = page;
      await teacherPage.goto('/teacher-login');
      await teacherPage.fill('[data-cy="email-input"]', TEST_DATA.teacher.email);
      await teacherPage.fill('[data-cy="password-input"]', TEST_DATA.teacher.password);
      await teacherPage.click('[data-cy="login-button"]');
      await expect(teacherPage).toHaveURL(/teacher-dashboard/);
      
      // Verify both dashboards are responsive
      await expect(parentPage.locator('[data-cy="homework-progress"]')).toBeVisible();
      await expect(teacherPage.locator('[data-cy="total-submissions"]')).toBeVisible();
      
      // Close parent page
      await parentPage.close();
    });
  });

  test.afterAll(async ({ page }) => {
    // Cleanup: Delete test assignment if possible
    try {
      if (assignmentId) {
        // Login as teacher
        await page.goto('/teacher-login');
        await page.fill('[data-cy="email-input"]', TEST_DATA.teacher.email);
        await page.fill('[data-cy="password-input"]', TEST_DATA.teacher.password);
        await page.click('[data-cy="login-button"]');
        
        // Navigate to assignments and delete
        await page.goto('/teacher/assignments');
        const deleteButton = page.locator(`[data-assignment-id="${assignmentId}"] .delete-button`);
        if (await deleteButton.isVisible()) {
          await deleteButton.click();
          await page.click('button:has-text("Confirm")'); // Confirm deletion
        }
      }
    } catch (error) {
      console.log('Cleanup failed (assignment may not exist):', error.message);
    }
  });
});
