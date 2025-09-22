export async function exportAssessPdf(payload: {
  name?: string;
  phq?: { score: number; severity: string }[];
  gad?: { score: number; severity: string }[];
}) {
  const { jsPDF } = await import('jspdf'); // dynamic import
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString();
  
  doc.setFontSize(14);
  doc.text('My Aura – Självskattningar', 14, 16);
  
  doc.setFontSize(10);
  if (payload.name) doc.text(`Namn: ${payload.name}`, 14, 24);
  doc.text(`Datum: ${now}`, 14, 30);
  
  doc.text('PHQ-9 (senaste 5):', 14, 40);
  (payload.phq || []).slice(0, 5).forEach((x, i) => 
    doc.text(`• ${x.score} (${x.severity})`, 20, 48 + i * 6)
  );
  
  doc.text('GAD-7 (senaste 5):', 14, 48 + 5 * 6 + 6);
  (payload.gad || []).slice(0, 5).forEach((x, i) => 
    doc.text(`• ${x.score} (${x.severity})`, 20, 48 + 5 * 6 + 12 + i * 6)
  );
  
  doc.save('MyAura-assessment.pdf');
}