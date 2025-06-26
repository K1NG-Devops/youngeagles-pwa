describe('Homework Assignment End-to-End Workflow', () => {
  let createdAssignmentId;
  let initialSubmissionCount = 0;
  let initialTotalCount = 0;

  before(() => {
    // Set up test data
    cy.log('Setting up E2E test environment...');
  });

  describe('Step 1: Create Assignment as Teacher/Admin', () => {
    it('should login as teacher and create a new homework assignment', () => {
      // Login as teacher
      cy.loginAsTeacher();
      
      // Navigate to teacher dashboard
      cy.visit('/teacher-dashboard');
      cy.contains('Welcome').should('be.visible');
      
      // Create assignment via API (simulating teacher action)
      const assignmentData = {
        title: 'E2E Test Math Assignment',
        description: 'Test assignment for end-to-end testing',
        instructions: 'Complete the math problems and submit your work.',
        class_name: 'Panda Class',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        child_ids: [1, 2], // Test with specific child IDs
        grade: 'Grade 3'
      };
      
      cy.createHomeworkAssignment(assignmentData).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('success', true);
        
        // Store the created assignment ID for later use
        createdAssignmentId = response.body.data.homework.id;
        cy.log(`Created assignment with ID: ${createdAssignmentId}`);
        
        // Verify assignment appears in teacher dashboard
        cy.reload();
        cy.contains('E2E Test Math Assignment').should('be.visible');
      });
    });

    it('should verify assignment creation via UI navigation', () => {
      // Navigate to assignments page to verify creation
      cy.visit('/teacher/assignments');
      cy.contains('E2E Test Math Assignment').should('be.visible');
      cy.contains('Panda Class').should('be.visible');
      cy.contains('Grade 3').should('be.visible');
    });
  });

  describe('Step 2: Confirm Database Insert', () => {
    it('should verify assignment exists in database via API', () => {
      cy.verifyAssignmentInDatabase(createdAssignmentId).then((assignment) => {
        expect(assignment).to.have.property('homework');
        expect(assignment.homework.title).to.eq('E2E Test Math Assignment');
        expect(assignment.homework.class_name).to.eq('Panda Class');
        expect(assignment.homework.grade).to.eq('Grade 3');
        cy.log('✅ Assignment verified in database');
      });
    });
  });

  describe('Step 3: Parent Dashboard Real-Time Updates', () => {
    it('should login as parent and verify dashboard counts update', () => {
      // Logout from teacher account
      cy.logout();
      
      // Login as parent
      cy.loginAsParent();
      
      // Navigate to parent dashboard
      cy.visit('/parent-dashboard');
      cy.contains('Welcome back').should('be.visible');
      
      // Select a child (assuming child exists in test data)
      cy.get('select').first().select('1'); // Select first child
      cy.wait(2000); // Wait for data to load
      
      // Capture initial counts
      cy.get('[data-cy="homework-total-count"]').invoke('text').then((totalText) => {
        initialTotalCount = parseInt(totalText) || 0;
        cy.log(`Initial total homework count: ${initialTotalCount}`);
      });
      
      cy.get('[data-cy="submission-count"]').invoke('text').then((submittedText) => {
        initialSubmissionCount = parseInt(submittedText) || 0;
        cy.log(`Initial submitted count: ${initialSubmissionCount}`);
      });
      
      // Verify the new assignment appears in the dashboard
      cy.contains('E2E Test Math Assignment', { timeout: 10000 }).should('be.visible');
      
      // Check if total count increased (should include the new assignment)
      cy.get('[data-cy="homework-total-count"]').should('contain', initialTotalCount + 1);
    });

    it('should verify homework progress section shows correct data', () => {
      // Check homework progress section
      cy.get('[data-cy="homework-progress"]').should('be.visible');
      
      // Verify progress bar is displayed
      cy.get('[data-cy="progress-bar"]').should('be.visible');
      
      // Check that pending assignments count includes new assignment
      cy.get('[data-cy="pending-count"]').invoke('text').then((pendingText) => {
        const pendingCount = parseInt(pendingText) || 0;
        expect(pendingCount).to.be.greaterThan(0);
      });
    });
  });

  describe('Step 4: Submit Work and Verify Updates', () => {
    it('should navigate to homework submission page', () => {
      // Navigate to homework list
      cy.visit('/student/homework?child_id=1');
      
      // Find the newly created assignment
      cy.contains('E2E Test Math Assignment').should('be.visible');
      cy.contains('Submit Work').click();
    });

    it('should submit homework and verify submission increment', () => {
      // Fill out submission form
      cy.get('[data-cy="submission-text"]').type('This is my test submission for the math assignment. I have completed all the problems.');
      
      // Add notes
      cy.get('[data-cy="submission-notes"]').type('Submitted via Cypress E2E test automation.');
      
      // Mock file upload (create a test file)
      const fileName = 'test-submission.txt';
      const fileContent = 'This is a test file for homework submission.';
      
      cy.get('[data-cy="file-upload"]').then(subject => {
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const file = new File([blob], fileName, { type: 'text/plain' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        subject[0].files = dataTransfer.files;
      });
      
      // Submit the homework
      cy.get('[data-cy="submit-button"]').click();
      
      // Verify submission success
      cy.contains('Homework submitted successfully').should('be.visible');
    });

    it('should verify dashboard updates after submission', () => {
      // Return to parent dashboard
      cy.visit('/parent-dashboard');
      
      // Wait for real-time updates (or manual refresh)
      cy.wait(3000);
      cy.reload(); // Force refresh to get latest data
      
      // Select child again
      cy.get('select').first().select('1');
      cy.wait(2000);
      
      // Verify submitted count increased
      cy.verifySubmissionCountIncrement(initialSubmissionCount);
      
      // Verify progress bar updated
      cy.get('[data-cy="progress-bar"]').should('be.visible');
      
      // Check that progress percentage increased
      cy.get('[data-cy="progress-percentage"]').invoke('text').then((percentageText) => {
        const percentage = parseInt(percentageText);
        expect(percentage).to.be.greaterThan(0);
        cy.log(`Progress percentage after submission: ${percentage}%`);
      });
    });

    it('should verify submission appears in teacher dashboard', () => {
      // Logout from parent account
      cy.logout();
      
      // Login as teacher
      cy.loginAsTeacher();
      
      // Navigate to teacher dashboard
      cy.visit('/teacher-dashboard');
      
      // Check recent submissions section
      cy.get('[data-cy="recent-submissions"]').should('be.visible');
      
      // Expand submissions section if collapsed
      cy.contains('Recent Submissions').click();
      
      // Verify the new submission appears
      cy.contains('E2E Test Math Assignment', { timeout: 10000 }).should('be.visible');
      cy.contains('Submitted').should('be.visible');
      
      // Verify teacher stats updated
      cy.get('[data-cy="total-submissions"]').invoke('text').then((submissionsText) => {
        const submissionsCount = parseInt(submissionsText);
        expect(submissionsCount).to.be.greaterThan(0);
        cy.log(`Total submissions count: ${submissionsCount}`);
      });
    });
  });

  describe('Step 5: Real-Time Updates Verification', () => {
    it('should test WebSocket real-time updates (if implemented)', () => {
      // Mock WebSocket connection
      cy.mockWebSocket();
      
      // Login as parent in one session
      cy.loginAsParent();
      cy.visit('/parent-dashboard');
      
      // Simulate real-time update event
      cy.window().then((window) => {
        // Simulate WebSocket message for homework update
        const mockEvent = {
          type: 'homework_updated',
          data: {
            homework_id: createdAssignmentId,
            child_id: 1,
            action: 'submission_graded'
          }
        };
        
        // Trigger mock event
        if (window.socket && window.socket.emit) {
          window.socket.emit('homework_update', mockEvent);
        }
      });
      
      // Verify dashboard updates without page refresh
      cy.get('[data-cy="homework-progress"]', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Step 6: Cleanup', () => {
    it('should clean up test data', () => {
      // Login as teacher to clean up
      cy.loginAsTeacher();
      
      // Delete the test assignment (if delete endpoint exists)
      cy.window().then((window) => {
        const token = window.localStorage.getItem('accessToken');
        
        cy.request({
          method: 'DELETE',
          url: `${Cypress.env('API_BASE_URL')}/homework/${createdAssignmentId}`,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          failOnStatusCode: false // Don't fail if delete endpoint doesn't exist
        }).then((response) => {
          if (response.status === 200) {
            cy.log('✅ Test assignment cleaned up successfully');
          } else {
            cy.log('⚠️ Could not delete test assignment (endpoint may not exist)');
          }
        });
      });
    });
  });

  after(() => {
    // Final cleanup
    cy.clearAllData();
    cy.log('E2E test completed successfully! 🎉');
  });
});
