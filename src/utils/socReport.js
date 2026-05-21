import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to convert logo URL to Base64
async function getLogoBase64() {
  try {
    const response = await fetch('/logo.png');
    if (!response.ok) throw new Error('Logo fetch failed');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Could not fetch real logo, using SVG fallback drawing:', err);
    return null;
  }
}

function drawFallbackLogo(doc, x, y, size = 28) {
  doc.setFillColor(13, 13, 13);
  doc.rect(x, y, size, size, 'F');
  doc.setFont('courier', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 255, 65); // Accent green
  doc.text('C', x + size / 2, y + size / 2 + 5, { align: 'center' });
}

function addFooter(doc, pageCount) {
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(136, 136, 136);
    doc.text(
      'CLARA SOC INCIDENT REPORT — CONFIDENTIAL',
      14,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }
}

export async function exportSOCReport(analysis, chatHistory) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top header area (Dark Red/Crimson themed for security incident)
  doc.setFillColor(128, 0, 0); // Dark Red
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Draw Logo (fetched or fallback)
  const logoData = await getLogoBase64();
  if (logoData) {
    doc.addImage(logoData, 'PNG', 14, 6, 28, 28);
  } else {
    drawFallbackLogo(doc, 14, 6, 28);
  }

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('SOC INCIDENT REPORT', 48, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 220);
  doc.text('CLARA Security Operations Center — Incident Response Division', 48, 27);

  // Metadata Fields
  doc.setDrawColor(128, 0, 0);
  doc.setLineWidth(1);
  doc.line(14, 45, pageWidth - 14, 45);

  let currentY = 55;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  // Irst column metadata
  doc.text('INCIDENT ID:', 14, currentY);
  doc.text('GENERATED ON:', 14, currentY + 7);
  doc.text('SEVERITY LEVEL:', 14, currentY + 14);

  // Values
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`INC-${Date.now().toString().slice(-6)}`, 50, currentY);
  doc.text(new Date().toLocaleString(), 50, currentY + 7);

  const score = analysis.riskScore || 0;
  let severityLabel = 'LOW';
  if (score >= 70) severityLabel = 'CRITICAL';
  else if (score >= 30) severityLabel = 'MEDIUM-HIGH';
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(score >= 70 ? 255 : score >= 30 ? 255 : 59, score >= 70 ? 68 : score >= 30 ? 140 : 130, score >= 70 ? 68 : 0);
  doc.text(`${severityLabel} (Risk Score: ${score}/100)`, 50, currentY + 14);

  // 1. Incident Overview Section
  currentY += 25;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(128, 0, 0);
  doc.text('1. INCIDENT OVERVIEW', 14, currentY);
  doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);

  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(40, 40, 40);
  const overviewText = doc.splitTextToSize(
    analysis.summary || 'No overview summary available for this incident.',
    pageWidth - 28
  );
  doc.text(overviewText, 14, currentY);
  currentY += overviewText.length * 5 + 10;

  // 2. Affected Assets & IOCs Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(128, 0, 0);
  doc.text('2. AFFECTED ASSETS & SUSPICIOUS IPS', 14, currentY);
  doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);

  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  
  const suspiciousIPs = analysis.stats?.suspiciousIPs || [];
  if (suspiciousIPs.length === 0) {
    doc.text('No specific suspicious external IP addresses were flag-marked in the logs.', 14, currentY);
    currentY += 8;
  } else {
    doc.setFont('helvetica', 'bold');
    doc.text('Flagged Suspect IPs (Indicator of Compromise):', 14, currentY);
    currentY += 6;
    doc.setFont('courier', 'normal');
    suspiciousIPs.forEach(ip => {
      doc.text(` - IP: ${ip} (Origin of malicious traffic / scan source)`, 18, currentY);
      currentY += 5;
    });
    currentY += 5;
  }

  // 3. Timeline of Events Section (Requires AutoTable)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(128, 0, 0);
  doc.text('3. TIMELINE OF EVENTS', 14, currentY);
  doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
  currentY += 8;

  const timelineRows = (analysis.timeline || []).map(t => [
    t.bucket || 'N/A',
    t.count || 0,
    t.highestSeverity || 'Low'
  ]);

  if (timelineRows.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No event timeline data is available.', 14, currentY);
    currentY += 8;
  } else {
    autoTable(doc, {
      startY: currentY,
      head: [['Time Bucket', 'Activity Count', 'Peak Severity']],
      body: timelineRows,
      theme: 'grid',
      styles: { fontSize: 9.5, cellPadding: 3.5 },
      headStyles: { fillColor: [128, 0, 0], textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 }
    });
    currentY = doc.lastAutoTable.finalY + 12;
  }

  // Check page boundaries before starting next section
  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = 25;
  }

  // 4. Recommended Response Actions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(128, 0, 0);
  doc.text('4. RECOMMENDED IR ACTIONS', 14, currentY);
  doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
  currentY += 8;

  const findings = analysis.findings || [];
  if (findings.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No mitigation actions required based on findings.', 14, currentY);
    currentY += 8;
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    findings.slice(0, 5).forEach((f, idx) => {
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = 25;
      }
      doc.setTextColor(50, 50, 50);
      doc.text(`${idx + 1}. [${f.severity}] ${f.title}`, 14, currentY);
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const remText = doc.splitTextToSize(`Action: ${f.remediation}`, pageWidth - 20);
      doc.text(remText, 18, currentY);
      currentY += remText.length * 5 + 3;
      doc.setFont('helvetica', 'bold');
    });
    currentY += 5;
  }

  // 5. Analyst Notes (from Chat history)
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = 25;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(128, 0, 0);
  doc.text('5. ANALYST INVESTIGATION NOTES', 14, currentY);
  doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
  currentY += 8;

  const notes = chatHistory.filter(msg => msg.role === 'assistant');
  if (notes.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('No active investigator notes have been logged for this incident.', 14, currentY);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);
    notes.slice(-3).forEach((n, idx) => {
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = 25;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`Note #${idx + 1} (${n.timestamp || 'Recent'}):`, 14, currentY);
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(n.content, pageWidth - 24);
      doc.text(noteLines, 16, currentY);
      currentY += noteLines.length * 4.5 + 6;
    });
  }

  const pageCount = doc.internal.getNumberOfPages();
  addFooter(doc, pageCount);

  doc.save(`clara_soc_incident_report_${Date.now()}.pdf`);
}
