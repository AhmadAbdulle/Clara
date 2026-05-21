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

// Draw fallback logo onto canvas to convert to PNG
function drawFallbackLogo(doc, x, y, size = 28) {
  doc.setFillColor(13, 13, 13);
  doc.rect(x, y, size, size, 'F');
  doc.setDrawColor(42, 42, 42);
  doc.rect(x, y, size, size, 'S');
  doc.setFont('courier', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 255, 65); // Accent green
  doc.text('C', x + size / 2, y + size / 2 + 5, { align: 'center' });
}

// Add page footer helper
function addFooter(doc, pageCount) {
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(136, 136, 136); // var(--text-secondary)
    doc.text(
      'CLARA — Cyber Log Analysis and Response Assistant',
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

export async function exportFindingsReport(analysis) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- PAGE 1: COVER PAGE ---
  // Background styling (dark header strip)
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Draw Logo (fetched or fallback)
  const logoData = await getLogoBase64();
  if (logoData) {
    doc.addImage(logoData, 'PNG', 14, 11, 28, 28);
  } else {
    drawFallbackLogo(doc, 14, 11, 28);
  }

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(232, 232, 232); // var(--text-primary)
  doc.text('CLARA THREAT ANALYSIS REPORT', 48, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(136, 136, 136);
  doc.text('Cyber Log Analysis and Response Assistant', 48, 29);

  // Metadata block
  doc.setTextColor(85, 85, 85); // var(--text-muted)
  doc.line(14, 60, pageWidth - 14, 60);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('REPORT GENERATED ON:', 14, 70);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(new Date().toLocaleString(), 65, 70);

  // Risk Score Header Card
  const score = analysis.riskScore || 0;
  let severityColor;
  let severityText = 'LOW';
  if (score >= 70) {
    severityColor = [255, 68, 68]; // red
    severityText = 'CRITICAL';
  } else if (score >= 30) {
    severityColor = [255, 140, 0]; // amber/orange
    severityText = 'HIGH/MEDIUM';
  } else {
    severityColor = [0, 212, 255]; // cyan
  }

  // Draw Risk Badge
  doc.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
  doc.rect(14, 80, 182, 25, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`RISK SCORE: ${score}/100 - ${severityText}`, 20, 96);

  // Executive Summary Card
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(13, 13, 13);
  doc.text('EXECUTIVE SUMMARY', 14, 120);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  const summaryText = doc.splitTextToSize(analysis.summary || 'No summary available.', pageWidth - 28);
  doc.text(summaryText, 14, 128);

  // Threat Statistics block
  const stats = analysis.stats || {};
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(13, 13, 13);
  doc.text('THREAT METRICS SUMMARY', 14, 160);

  const statsData = [
    ['Total Log Events Analysed', stats.totalEvents || 'N/A'],
    ['Critical Severity Findings', stats.critical || 0],
    ['High Severity Findings', stats.high || 0],
    ['Medium Severity Findings', stats.medium || 0],
    ['Low Severity Findings', stats.low || 0],
    ['Identified Suspicious IPs', (stats.suspiciousIPs || []).join(', ') || 'None']
  ];

  autoTable(doc, {
    startY: 165,
    margin: { left: 14, right: 14 },
    body: statsData,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [245, 245, 245], width: 60 },
      1: { width: 122 }
    }
  });

  // --- PAGE 2+: FINDINGS TABLE ---
  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(13, 13, 13);
  doc.text('DETAILED FINDINGS REPORT', 14, 20);

  const columns = [
    { header: 'Sev / Conf', dataKey: 'sevConf' },
    { header: 'MITRE ATT&CK', dataKey: 'mitre' },
    { header: 'Attack / Title', dataKey: 'title' },
    { header: 'Evidence / Remediation', dataKey: 'evidence' }
  ];

  const findingsData = (analysis.findings || []).map(f => ({
    sevConf: `${f.severity.toUpperCase()}\n(${f.confidence} Conf)`,
    mitre: `${f.mitreTactic || 'N/A'}\nID: ${f.mitreTechniqueId || 'N/A'}`,
    title: `[${f.attackType || 'N/A'}]\n${f.title}\n\n${f.description}`,
    evidence: `Evidence:\n"${f.evidenceLine}"\n\nRemediation:\n${f.remediation}`
  }));

  autoTable(doc, {
    startY: 25,
    columns: columns,
    body: findingsData,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak' },
    columnStyles: {
      sevConf: { width: 30, fontStyle: 'bold' },
      mitre: { width: 40 },
      title: { width: 55 },
      evidence: { width: 57, fontName: 'courier' }
    },
    headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 14, right: 14 }
  });

  // Apply footers
  const pageCount = doc.internal.getNumberOfPages();
  addFooter(doc, pageCount);

  // Save report
  doc.save(`clara_findings_report_${Date.now()}.pdf`);
}

export async function exportChatTranscript(chatHistory, logExcerpt) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Cover details
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageWidth, 40, 'F');

  const logoData = await getLogoBase64();
  if (logoData) {
    doc.addImage(logoData, 'PNG', 14, 6, 28, 28);
  } else {
    drawFallbackLogo(doc, 14, 6, 28);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(232, 232, 232);
  doc.text('CLARA ANALYST CHAT TRANSCRIPT', 48, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(136, 136, 136);
  doc.text('Cyber Log Analysis and Response Assistant', 48, 27);

  doc.setDrawColor(42, 42, 42);
  doc.line(14, 45, pageWidth - 14, 45);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('INVESTIGATION DATE:', 14, 55);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(new Date().toLocaleString(), 60, 55);

  let currentY = 65;

  if (logExcerpt) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('INVESTIGATED LOG EXCERPT:', 14, currentY);
    currentY += 6;
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.setFillColor(245, 245, 245);
    const shortExcerpt = logExcerpt.length > 500 ? logExcerpt.substring(0, 500) + '\n... [TRUNCATED] ...' : logExcerpt;
    const splitExcerpt = doc.splitTextToSize(shortExcerpt, pageWidth - 28);
    const textHeight = splitExcerpt.length * 4;
    doc.rect(14, currentY, pageWidth - 28, textHeight + 6, 'F');
    doc.text(splitExcerpt, 18, currentY + 4);
    currentY += textHeight + 15;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text('CONVERSATION LOG:', 14, currentY);
  currentY += 8;

  // Render chat history
  chatHistory.forEach((msg) => {
    const isUser = msg.role === 'user';
    const roleLabel = isUser ? 'INVESTIGATOR' : 'CLARA ANALYST';
    const timestamp = msg.timestamp || new Date().toLocaleTimeString();

    // Check page boundaries
    if (currentY > pageHeight - 35) {
      doc.addPage();
      currentY = 25;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(isUser ? 59 : 0, isUser ? 130 : 143, isUser ? 246 : 17); // Colored markers
    doc.text(`${roleLabel} (${timestamp})`, 14, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(40, 40, 40);
    const msgText = doc.splitTextToSize(msg.content, pageWidth - 28);
    
    // Draw dialog box background
    doc.setFillColor(isUser ? 245 : 240, isUser ? 248 : 255, isUser ? 255 : 245);
    doc.rect(14, currentY - 2, pageWidth - 28, msgText.length * 5 + 4, 'F');

    doc.text(msgText, 17, currentY + 3);
    currentY += msgText.length * 5 + 12;
  });

  const pageCount = doc.internal.getNumberOfPages();
  addFooter(doc, pageCount);

  doc.save(`clara_chat_transcript_${Date.now()}.pdf`);
}
