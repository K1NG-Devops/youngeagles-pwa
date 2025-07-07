import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

class PDFGenerator {
  constructor() {
    this.doc = null;
    this.pageWidth = 210; // A4 width in mm
    this.pageHeight = 297; // A4 height in mm
    this.margin = 20;
    this.contentWidth = this.pageWidth - (this.margin * 2);
    this.yPosition = this.margin;
    this.lineHeight = 7;
    this.fontSize = {
      title: 16,
      subtitle: 14,
      heading: 12,
      normal: 10,
      small: 8
    };
  }

  // Initialize new PDF document
  initDocument(orientation = 'portrait') {
    this.doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });
    this.yPosition = this.margin;
    return this;
  }

  // Add header with logo and title
  addHeader(title, subtitle = '') {
    if (!this.doc) this.initDocument();
    
    // Add Young Eagles header
    this.doc.setFontSize(this.fontSize.title);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(51, 122, 183); // Blue color
    this.doc.text('Young Eagles Learning Platform', this.margin, this.yPosition);
    
    this.yPosition += 10;
    
    // Add title
    this.doc.setFontSize(this.fontSize.subtitle);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.margin, this.yPosition);
    
    this.yPosition += 8;
    
    // Add subtitle if provided
    if (subtitle) {
      this.doc.setFontSize(this.fontSize.normal);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(subtitle, this.margin, this.yPosition);
      this.yPosition += 6;
    }
    
    // Add separator line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition);
    this.yPosition += 10;
    
    return this;
  }

  // Add footer with page number and date
  addFooter() {
    if (!this.doc) return this;
    
    const pageHeight = this.doc.internal.pageSize.height;
    const footerY = pageHeight - 15;
    
    // Add generation date
    const currentDate = new Date().toLocaleDateString();
    this.doc.setFontSize(this.fontSize.small);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text(`Generated: ${currentDate}`, this.margin, footerY);
    
    // Add page number
    const pageNumber = this.doc.internal.getNumberOfPages();
    this.doc.text(`Page ${pageNumber}`, this.pageWidth - 30, footerY);
    
    return this;
  }

  // Add section heading
  addSectionHeading(heading, icon = '') {
    this.checkPageBreak(15);
    
    this.doc.setFontSize(this.fontSize.heading);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    const text = icon ? `${icon} ${heading}` : heading;
    this.doc.text(text, this.margin, this.yPosition);
    this.yPosition += 8;
    
    return this;
  }

  // Add paragraph text with word wrapping
  addParagraph(text, fontSize = this.fontSize.normal, fontStyle = 'normal') {
    if (!text) return this;
    
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', fontStyle);
    this.doc.setTextColor(0, 0, 0);
    
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    
    for (const line of lines) {
      this.checkPageBreak(this.lineHeight);
      this.doc.text(line, this.margin, this.yPosition);
      this.yPosition += this.lineHeight;
    }
    
    this.yPosition += 3; // Add small gap after paragraph
    return this;
  }

  // Add bulleted list
  addBulletList(items, bulletChar = '•') {
    if (!items || !Array.isArray(items)) return this;
    
    this.doc.setFontSize(this.fontSize.normal);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    for (const item of items) {
      this.checkPageBreak(this.lineHeight);
      
      // Add bullet
      this.doc.text(bulletChar, this.margin, this.yPosition);
      
      // Add item text with proper indentation
      const itemLines = this.doc.splitTextToSize(item, this.contentWidth - 10);
      for (let i = 0; i < itemLines.length; i++) {
        if (i > 0) this.checkPageBreak(this.lineHeight);
        this.doc.text(itemLines[i], this.margin + 8, this.yPosition);
        this.yPosition += this.lineHeight;
      }
    }
    
    this.yPosition += 3;
    return this;
  }

  // Add numbered list
  addNumberedList(items) {
    if (!items || !Array.isArray(items)) return this;
    
    this.doc.setFontSize(this.fontSize.normal);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    for (let i = 0; i < items.length; i++) {
      this.checkPageBreak(this.lineHeight);
      
      // Add number
      this.doc.text(`${i + 1}.`, this.margin, this.yPosition);
      
      // Add item text with proper indentation
      const itemLines = this.doc.splitTextToSize(items[i], this.contentWidth - 15);
      for (let j = 0; j < itemLines.length; j++) {
        if (j > 0) this.checkPageBreak(this.lineHeight);
        this.doc.text(itemLines[j], this.margin + 12, this.yPosition);
        this.yPosition += this.lineHeight;
      }
    }
    
    this.yPosition += 3;
    return this;
  }

  // Add checklist
  addChecklist(items) {
    if (!items || !Array.isArray(items)) return this;
    
    this.doc.setFontSize(this.fontSize.normal);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    for (const item of items) {
      this.checkPageBreak(this.lineHeight);
      
      // Add checkbox
      this.doc.rect(this.margin, this.yPosition - 3, 3, 3);
      
      // Add item text
      const itemLines = this.doc.splitTextToSize(item, this.contentWidth - 10);
      for (let i = 0; i < itemLines.length; i++) {
        if (i > 0) this.checkPageBreak(this.lineHeight);
        this.doc.text(itemLines[i], this.margin + 8, this.yPosition);
        this.yPosition += this.lineHeight;
      }
    }
    
    this.yPosition += 3;
    return this;
  }

  // Add table
  addTable(headers, rows, columnWidths = null) {
    if (!headers || !rows) return this;
    
    const numColumns = headers.length;
    const tableWidth = this.contentWidth;
    const colWidth = columnWidths || Array(numColumns).fill(tableWidth / numColumns);
    const rowHeight = 8;
    
    // Check if table fits on current page
    const tableHeight = (rows.length + 1) * rowHeight;
    this.checkPageBreak(tableHeight);
    
    // Draw header
    this.doc.setFontSize(this.fontSize.normal);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFillColor(240, 240, 240);
    
    let xPos = this.margin;
    for (let i = 0; i < headers.length; i++) {
      this.doc.rect(xPos, this.yPosition - 5, colWidth[i], rowHeight, 'FD');
      this.doc.text(headers[i], xPos + 2, this.yPosition);
      xPos += colWidth[i];
    }
    
    this.yPosition += rowHeight;
    
    // Draw rows
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFillColor(255, 255, 255);
    
    for (const row of rows) {
      this.checkPageBreak(rowHeight);
      
      xPos = this.margin;
      for (let i = 0; i < row.length; i++) {
        this.doc.rect(xPos, this.yPosition - 5, colWidth[i], rowHeight, 'S');
        this.doc.text(String(row[i]), xPos + 2, this.yPosition);
        xPos += colWidth[i];
      }
      this.yPosition += rowHeight;
    }
    
    this.yPosition += 5;
    return this;
  }

  // Add spacing
  addSpacing(height = 10) {
    this.yPosition += height;
    return this;
  }

  // Add page break
  addPageBreak() {
    if (!this.doc) return this;
    
    this.addFooter();
    this.doc.addPage();
    this.yPosition = this.margin;
    return this;
  }

  // Check if page break is needed
  checkPageBreak(requiredHeight = 20) {
    if (this.yPosition + requiredHeight > this.pageHeight - 30) {
      this.addPageBreak();
    }
  }

  // Add image from canvas element
  async addImageFromCanvas(canvas, width = null, height = null) {
    if (!canvas || !this.doc) return this;
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = width || this.contentWidth;
    const imgHeight = height || (canvas.height * imgWidth) / canvas.width;
    
    this.checkPageBreak(imgHeight);
    
    this.doc.addImage(imgData, 'PNG', this.margin, this.yPosition, imgWidth, imgHeight);
    this.yPosition += imgHeight + 10;
    
    return this;
  }

  // Convert HTML element to PDF
  async addHtmlElement(element, options = {}) {
    if (!element || !this.doc) return this;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        ...options
      });
      
      await this.addImageFromCanvas(canvas);
    } catch (error) {
      console.error('Error converting HTML to PDF:', error);
    }
    
    return this;
  }

  // Generate worksheet content
  generateWorksheet(worksheetData) {
    this.initDocument();
    
    // Add header
    this.addHeader(worksheetData.title, worksheetData.subtitle);
    
    // Add metadata
    if (worksheetData.metadata) {
      this.addParagraph(`Age Group: ${worksheetData.metadata.age || 'All ages'} | Duration: ${worksheetData.metadata.duration || 'Variable'}`);
      this.addSpacing(5);
    }
    
    // Add instructions
    if (worksheetData.instructions) {
      this.addSectionHeading('📝 Instructions');
      this.addParagraph(worksheetData.instructions);
    }
    
    // Add activities
    if (worksheetData.activities) {
      this.addSectionHeading('🎯 Activities');
      this.addNumberedList(worksheetData.activities);
    }
    
    // Add materials
    if (worksheetData.materials) {
      this.addSectionHeading('📋 Materials Needed');
      this.addBulletList(worksheetData.materials);
    }
    
    // Add assessment
    if (worksheetData.assessment) {
      this.addSectionHeading('✅ Assessment Checklist');
      this.addChecklist(worksheetData.assessment);
    }
    
    // Add notes
    if (worksheetData.notes) {
      this.addSectionHeading('📝 Notes');
      this.addParagraph(worksheetData.notes);
    }
    
    // Add footer
    this.addFooter();
    
    return this;
  }

  // Generate progress report
  generateProgressReport(studentData) {
    this.initDocument();
    
    // Add header
    this.addHeader('Student Progress Report', `${studentData.name} - ${studentData.class}`);
    
    // Add student info
    this.addSectionHeading('👤 Student Information');
    this.addTable(
      ['Field', 'Value'],
      [
        ['Name', studentData.name],
        ['Class', studentData.class],
        ['Age', studentData.age],
        ['Report Period', studentData.reportPeriod]
      ]
    );
    
    // Add progress summary
    if (studentData.subjects) {
      this.addSectionHeading('📊 Academic Progress');
      const subjectHeaders = ['Subject', 'Score', 'Grade', 'Progress'];
      const subjectRows = studentData.subjects.map(subject => [
        subject.name,
        `${subject.score}%`,
        subject.grade,
        subject.progress
      ]);
      this.addTable(subjectHeaders, subjectRows);
    }
    
    // Add achievements
    if (studentData.achievements) {
      this.addSectionHeading('🏆 Achievements');
      this.addBulletList(studentData.achievements);
    }
    
    // Add areas for improvement
    if (studentData.improvements) {
      this.addSectionHeading('💡 Areas for Improvement');
      this.addBulletList(studentData.improvements);
    }
    
    // Add teacher comments
    if (studentData.comments) {
      this.addSectionHeading('💬 Teacher Comments');
      this.addParagraph(studentData.comments);
    }
    
    this.addFooter();
    return this;
  }

  // Save PDF
  save(filename = 'document.pdf') {
    if (!this.doc) return false;
    
    try {
      this.doc.save(filename);
      return true;
    } catch (error) {
      console.error('Error saving PDF:', error);
      return false;
    }
  }

  // Get PDF as blob
  getBlob() {
    if (!this.doc) return null;
    
    try {
      return this.doc.output('blob');
    } catch (error) {
      console.error('Error generating PDF blob:', error);
      return null;
    }
  }

  // Get PDF as base64 string
  getBase64() {
    if (!this.doc) return null;
    
    try {
      return this.doc.output('datauristring');
    } catch (error) {
      console.error('Error generating PDF base64:', error);
      return null;
    }
  }
}

// Export utility functions
export const generateWorksheetPDF = (worksheetData, filename = 'worksheet.pdf') => {
  const generator = new PDFGenerator();
  generator.generateWorksheet(worksheetData);
  return generator.save(filename);
};

export const generateProgressReportPDF = (studentData, filename = 'progress_report.pdf') => {
  const generator = new PDFGenerator();
  generator.generateProgressReport(studentData);
  return generator.save(filename);
};

export const generateCustomPDF = (content, filename = 'document.pdf') => {
  const generator = new PDFGenerator();
  generator.initDocument();
  
  // Add content based on type
  if (content.title) {
    generator.addHeader(content.title, content.subtitle);
  }
  
  if (content.sections) {
    content.sections.forEach(section => {
      if (section.heading) {
        generator.addSectionHeading(section.heading, section.icon);
      }
      
      if (section.text) {
        generator.addParagraph(section.text);
      }
      
      if (section.list) {
        if (section.listType === 'numbered') {
          generator.addNumberedList(section.list);
        } else if (section.listType === 'checklist') {
          generator.addChecklist(section.list);
        } else {
          generator.addBulletList(section.list);
        }
      }
      
      if (section.table) {
        generator.addTable(section.table.headers, section.table.rows, section.table.columnWidths);
      }
      
      if (section.spacing) {
        generator.addSpacing(section.spacing);
      }
    });
  }
  
  generator.addFooter();
  return generator.save(filename);
};

export default PDFGenerator;
