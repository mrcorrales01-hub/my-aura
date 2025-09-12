import jsPDF from 'jspdf';
import { Handout } from './types';

export function exportHandoutPDF(handout: Handout) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(handout.title, 20, 30);
  
  let y = 50;
  
  // Sections
  handout.sections.forEach((section, sectionIndex) => {
    if (y > 250) {
      doc.addPage();
      y = 30;
    }
    
    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, 20, y);
    y += 10;
    
    // Section bullets with checkboxes
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    section.bullets.forEach((bullet, bulletIndex) => {
      if (y > 270) {
        doc.addPage();
        y = 30;
      }
      
      // Checkbox
      doc.rect(25, y - 3, 3, 3);
      
      // Bullet text
      const splitText = doc.splitTextToSize(bullet, 160);
      doc.text(splitText, 32, y);
      y += Math.max(6, splitText.length * 4);
    });
    
    y += 5; // Space between sections
  });
  
  // Notes section
  if (handout.notes) {
    if (y > 220) {
      doc.addPage();
      y = 30;
    }
    
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Anteckningar:', 20, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const notesText = doc.splitTextToSize(handout.notes, 170);
    doc.text(notesText, 20, y);
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Sida ${i} av ${pageCount} | Genererad: ${new Date().toLocaleDateString()}`, 20, 285);
  }
  
  // Generate filename
  const date = new Date().toISOString().slice(0, 10);
  const filename = `handout-${handout.slug}-${date}.pdf`;
  
  doc.save(filename);
}