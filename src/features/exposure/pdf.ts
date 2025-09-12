import jsPDF from 'jspdf';
import { ExposurePlan, ExposureStep, ExposureSession } from './types';

export function exportExposurePDF(data: {
  plan: ExposurePlan;
  step: ExposureStep;
  session: ExposureSession;
}) {
  const { plan, step, session } = data;
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Exposure Session', 20, 30);
  
  // Plan info
  doc.setFontSize(14);
  doc.text(`Plan: ${plan.name}`, 20, 50);
  doc.text(`Situation: ${plan.situation}`, 20, 65);
  
  // Step info
  doc.text(`Step: ${step.label}`, 20, 85);
  doc.text(`Difficulty: ${step.difficulty}/10`, 20, 100);
  
  // Session data
  doc.text(`Before SUDS: ${session.before}/10`, 20, 120);
  doc.text(`After SUDS: ${session.after || 'N/A'}/10`, 20, 135);
  doc.text(`Duration: ${session.minutes || 'N/A'} minutes`, 20, 150);
  
  // Notes
  if (session.notes) {
    doc.text('Notes:', 20, 170);
    const splitNotes = doc.splitTextToSize(session.notes, 170);
    doc.text(splitNotes, 20, 185);
  }
  
  // Timestamp
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 280);
  
  // Simple curve representation
  if (session.after !== undefined) {
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(2);
    
    const startY = 220 - (session.before / 10) * 20;
    const endY = 220 - (session.after / 10) * 20;
    
    // Draw curve line (simplified)
    doc.line(50, startY, 150, endY);
    
    // Points
    doc.circle(50, startY, 2, 'F');
    doc.circle(150, endY, 2, 'F');
    
    // Labels
    doc.setFontSize(8);
    doc.text(`${session.before}`, 45, startY - 5);
    doc.text(`${session.after}`, 145, endY - 5);
  }
  
  // Generate filename
  const date = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
  const filename = `exposure-${plan.name.replace(/\s+/g, '-')}-${step.difficulty}-${date}.pdf`;
  
  doc.save(filename);
}