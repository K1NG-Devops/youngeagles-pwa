// Test file to verify PDF generation functionality
// This can be run in the browser console or as a module

import { 
  generateWorksheetPDF, 
  generateProgressReportPDF, 
  generateCustomPDF 
} from '../utils/pdfGenerator.js';

// Test data for worksheet generation
const testWorksheetData = {
  title: 'Test Worksheet - ABC Practice',
  subtitle: 'CAPS-Aligned Foundation Phase Activity',
  metadata: {
    age: '4-5 years',
    duration: '15 minutes'
  },
  instructions: [
    'Look at each letter carefully',
    'Trace the dotted lines with your finger first',
    'Use a pencil to trace over the letters',
    'Practice writing the letters in the empty boxes'
  ],
  activities: [
    'Letter A practice: Trace A A A A A',
    'Letter B practice: Trace B B B B B', 
    'Letter C practice: Trace C C C C C',
    'Sound practice: Say /a/, /b/, /c/ sounds',
    'Word matching: Match letters to pictures'
  ],
  materials: [
    'Pencils or crayons',
    'Letter cards (provided)',
    'Picture cards for matching'
  ],
  assessment: [
    'Can identify letters A, B, C',
    'Makes correct letter sounds',
    'Traces letters with proper formation',
    'Matches letters to beginning sounds'
  ],
  notes: 'Encourage students to say the letter sounds while tracing. Provide positive feedback for effort. This test worksheet demonstrates the PDF generation capabilities.'
};

// Test data for progress report generation
const testStudentData = {
  name: 'Test Student',
  class: 'Grade R - Test Class',
  age: '5 years',
  reportPeriod: 'Test Period - 2024',
  subjects: [
    { name: 'Literacy', score: 88, grade: 'B+', progress: 'Excellent' },
    { name: 'Mathematics', score: 82, grade: 'B', progress: 'Good' },
    { name: 'Science', score: 90, grade: 'A-', progress: 'Outstanding' },
    { name: 'Creative Arts', score: 85, grade: 'B+', progress: 'Very Good' },
    { name: 'Physical Education', score: 87, grade: 'B+', progress: 'Excellent' }
  ],
  achievements: [
    'Shows excellent letter recognition skills',
    'Demonstrates strong problem-solving abilities',
    'Participates actively in group activities',
    'Shows creativity in art projects',
    'Follows instructions well'
  ],
  improvements: [
    'Continue practicing number formation',
    'Work on listening skills during story time',
    'Develop confidence in speaking activities'
  ],
  comments: 'This is a test progress report to verify PDF generation functionality. The student shows consistent progress across all learning areas and demonstrates enthusiasm for learning. With continued support, they will excel in all subjects.'
};

// Test data for custom document generation
const testCustomContent = {
  title: 'Test Custom Document',
  subtitle: 'PDF Generation Verification',
  sections: [
    {
      heading: 'Test Overview',
      icon: '🧪',
      text: 'This is a test document to verify that the PDF generation system is working correctly. It includes various content types and formatting options to ensure comprehensive functionality.'
    },
    {
      heading: 'Test Features',
      icon: '✨',
      list: [
        'Header and footer generation with branding',
        'Structured content with proper typography',
        'Bulleted lists like this one',
        'Tables for data presentation',
        'Automatic page breaks and pagination'
      ],
      listType: 'bullet'
    },
    {
      heading: 'Test Checklist',
      icon: '✅',
      list: [
        'PDF file downloads successfully',
        'Content is properly formatted',
        'Young Eagles branding appears correctly',
        'Text is readable and well-spaced',
        'All sections render as expected'
      ],
      listType: 'checklist'
    },
    {
      heading: 'Test Results Table',
      icon: '📊',
      table: {
        headers: ['Test Component', 'Status', 'Notes'],
        rows: [
          ['Header Generation', 'Pass', 'Branding visible'],
          ['Content Formatting', 'Pass', 'Clean layout'],
          ['List Generation', 'Pass', 'Multiple types work'],
          ['Table Creation', 'Pass', 'Data displays correctly'],
          ['Footer Generation', 'Pass', 'Date and page numbers']
        ]
      }
    },
    {
      heading: 'Test Steps',
      icon: '📋',
      list: [
        'Initialize PDF generator class',
        'Add header with title and subtitle',
        'Generate content sections in order',
        'Apply proper formatting and spacing',
        'Add footer with metadata',
        'Save PDF with specified filename'
      ],
      listType: 'numbered'
    }
  ]
};

// Test functions
export const runWorksheetTest = () => {
  console.log('🧪 Testing worksheet PDF generation...');
  try {
    const success = generateWorksheetPDF(testWorksheetData, 'test_worksheet.pdf');
    if (success) {
      console.log('✅ Worksheet PDF generation test PASSED');
      return true;
    } else {
      console.log('❌ Worksheet PDF generation test FAILED');
      return false;
    }
  } catch (error) {
    console.error('❌ Worksheet PDF generation test ERROR:', error);
    return false;
  }
};

export const runProgressReportTest = () => {
  console.log('🧪 Testing progress report PDF generation...');
  try {
    const success = generateProgressReportPDF(testStudentData, 'test_progress_report.pdf');
    if (success) {
      console.log('✅ Progress report PDF generation test PASSED');
      return true;
    } else {
      console.log('❌ Progress report PDF generation test FAILED');
      return false;
    }
  } catch (error) {
    console.error('❌ Progress report PDF generation test ERROR:', error);
    return false;
  }
};

export const runCustomDocumentTest = () => {
  console.log('🧪 Testing custom document PDF generation...');
  try {
    const success = generateCustomPDF(testCustomContent, 'test_custom_document.pdf');
    if (success) {
      console.log('✅ Custom document PDF generation test PASSED');
      return true;
    } else {
      console.log('❌ Custom document PDF generation test FAILED');
      return false;
    }
  } catch (error) {
    console.error('❌ Custom document PDF generation test ERROR:', error);
    return false;
  }
};

export const runAllTests = () => {
  console.log('🚀 Starting PDF generation tests...');
  console.log('==========================================');
  
  const worksheetResult = runWorksheetTest();
  const progressResult = runProgressReportTest();
  const customResult = runCustomDocumentTest();
  
  console.log('==========================================');
  console.log('📊 TEST SUMMARY:');
  console.log(`Worksheet Generation: ${worksheetResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Progress Report Generation: ${progressResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Custom Document Generation: ${customResult ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = worksheetResult && progressResult && customResult;
  console.log(`\n🎯 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 PDF generation implementation is working correctly!');
    console.log('📄 Check your downloads folder for the generated test PDFs.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the error messages above.');
  }
  
  return allPassed;
};

// Usage instructions for manual testing
export const testInstructions = `
📖 PDF Generation Test Instructions:

1. Open browser developer console
2. Import this test file or copy the functions
3. Run individual tests:
   - runWorksheetTest()
   - runProgressReportTest() 
   - runCustomDocumentTest()

4. Or run all tests at once:
   - runAllTests()

5. Check your downloads folder for generated PDFs:
   - test_worksheet.pdf
   - test_progress_report.pdf
   - test_custom_document.pdf

6. Verify each PDF contains:
   ✅ Young Eagles branding in header
   ✅ Properly formatted content
   ✅ Correct page numbering
   ✅ Clean typography and spacing
   ✅ All expected sections and data

Note: Tests can also be run through the PDFGenerator demo component
in the application interface.
`;

console.log(testInstructions);

// Export test data for use in other components
export { testWorksheetData, testStudentData, testCustomContent };
