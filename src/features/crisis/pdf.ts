import jsPDF from 'jspdf';
import { SafetyPlan } from './types';

export function createSafetyPlanPdf(plan: SafetyPlan): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;
  
  // Title
  doc.setFontSize(16);
  doc.text('Säkerhetsplan', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;
  
  // Basic info
  doc.setFontSize(10);
  doc.text(`Namn: ${plan.name || 'Ej angivet'}`, 20, yPos);
  yPos += 5;
  doc.text(`Skapad: ${new Date(plan.createdAt).toLocaleDateString('sv-SE')}`, 20, yPos);
  yPos += 5;
  doc.text(`Uppdaterad: ${new Date(plan.updatedAt).toLocaleDateString('sv-SE')}`, 20, yPos);
  yPos += 15;

  // Helper function to add section
  const addSection = (title: string, items: (string | any)[]) => {
    if (!items || items.length === 0) return;
    
    doc.setFontSize(12);
    doc.text(title.toUpperCase(), 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    items.forEach((item) => {
      let text = typeof item === 'string' ? item : (item?.name || 'Unknown');
      if (typeof item === 'object' && item && (item?.phone || item?.email)) {
        if (item?.phone) text += ` (tel: ${item.phone})`;
        if (item?.email) text += ` (${item.email})`;
      }
      
      const lines = doc.splitTextToSize(`• ${text}`, pageWidth - 30);
      lines.forEach((line: string) => {
        doc.text(line, 25, yPos);
        yPos += 4;
      });
    });
    yPos += 5;
  };

  // Add all sections
  addSection('Varningssignaler', plan.signals);
  addSection('Copingstrategier (2-3 min)', plan.coping);
  addSection('Stödpersoner', plan.people);
  addSection('Trygga platser', plan.places);
  addSection('Viktiga skäl', plan.reasons);
  addSection('Ta bort/minska tillgång till medel', plan.removeMeans);
  addSection('Professionella kontakter', plan.professionals);

  // Check-in settings
  if (plan.remindersOn) {
    doc.setFontSize(12);
    doc.text('CHECK-IN INSTÄLLNINGAR', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.text(`• Påminnelser: var ${plan.checkinEveryMin} minut`, 25, yPos);
    yPos += 10;
  }

  // Emergency contacts section
  doc.setFontSize(12);
  doc.text('AKUTA KONTAKTER', 20, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.text('• 112 - Akuta situationer', 25, yPos);
  yPos += 4;
  doc.text('• 1177 - Sjukvårdsrådgivning', 25, yPos);
  yPos += 4;
  doc.text('• Mind Självmordslinjen: 90101', 25, yPos);
  yPos += 10;

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.text('My Aura - Detta ersätter inte akutsjukvård. Sök vård vid behov.', pageWidth / 2, footerY, { align: 'center' });
  
  // Generate filename
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const filename = `safety-plan-${timestamp}.pdf`;
  
  doc.save(filename);
}