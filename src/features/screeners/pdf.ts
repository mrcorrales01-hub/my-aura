import jsPDF from 'jspdf';
import { ScreenerId, PHQ9, GAD7 } from './items';

type PDFData = {
  id: ScreenerId;
  result: { score: number; severity: string };
  answers: number[];
  name: string;
  lang: 'sv' | 'en';
};

const choiceLabels = {
  sv: ['Inte alls', 'Flera dagar', 'Mer än halva dagar', 'Nästan varje dag'],
  en: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
};

export function createScreenerPdf(data: PDFData) {
  const doc = new jsPDF();
  const { id, result, answers, name, lang } = data;
  
  const items = id === 'phq9' ? PHQ9 : GAD7;
  const title = id === 'phq9' ? 'PHQ-9 (Depression)' : 'GAD-7 (Anxiety)';
  
  // Header
  doc.setFontSize(18);
  doc.text(title, 20, 20);
  
  doc.setFontSize(12);
  doc.text(`${lang === 'sv' ? 'Namn' : 'Name'}: ${name}`, 20, 35);
  doc.text(`${lang === 'sv' ? 'Datum' : 'Date'}: ${new Date().toLocaleDateString()}`, 20, 45);
  
  // Result
  doc.setFontSize(14);
  doc.text(`${lang === 'sv' ? 'Resultat' : 'Result'}:`, 20, 65);
  doc.setFontSize(12);
  doc.text(`${lang === 'sv' ? 'Poäng' : 'Score'}: ${result.score}`, 20, 75);
  doc.text(`${lang === 'sv' ? 'Svårighetsgrad' : 'Severity'}: ${result.severity}`, 20, 85);
  
  // Items and answers
  doc.setFontSize(10);
  let yPos = 105;
  
  items.forEach((item, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    const questionText = item[lang];
    const answer = answers[index] || 0;
    const answerText = choiceLabels[lang][answer];
    
    doc.text(`${index + 1}. ${questionText}`, 20, yPos);
    doc.text(`   ${lang === 'sv' ? 'Svar' : 'Answer'}: ${answer} - ${answerText}`, 20, yPos + 8);
    yPos += 16;
  });
  
  // Disclaimer
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos += 20;
  }
  
  doc.setFontSize(8);
  const disclaimer = lang === 'sv' 
    ? 'Detta ersätter inte medicinsk bedömning. Sök vård vid behov.'
    : 'This does not replace medical evaluation. Seek care when needed.';
  doc.text(disclaimer, 20, yPos, { maxWidth: 170 });
  
  // Download
  const filename = `${id}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}