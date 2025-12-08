import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TotalCostPDFData {
  propertyDetails: {
    purchasePrice: number;
    propertySize: number;
    area: string;
    isOffPlan: boolean;
  };
  financing: {
    useMortgage: boolean;
    downPayment?: number;
    interestRate?: number;
    loanTerm?: number;
    loanAmount?: number;
    monthlyPayment?: number;
  };
  strategy: {
    usageType: string;
    annualRent?: number;
    dailyRate?: number;
    occupancyRate?: number;
  };
  timeline: {
    holdingPeriod: number;
    appreciationRate: number;
  };
  costs: {
    acquisition: { label: string; value: number }[];
    acquisitionTotal: number;
    ongoing: { label: string; value: number }[];
    ongoingTotal: number;
    exit: { label: string; value: number }[];
    exitTotal: number;
  };
  results: {
    totalCostOfOwnership: number;
    netProfit: number;
    roi: number;
    annualizedRoi: number;
    initialInvestment: number;
    exitPropertyValue: number;
    capitalAppreciation: number;
    totalRentalIncome: number;
    totalInterest: number;
    breakEvenYear: number;
  };
  formatValue: (value: number) => string;
}

export function generateTotalCostPDF(data: TotalCostPDFData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Helper functions
  const addTitle = (text: string, size: number = 16) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 37, 41);
    doc.text(text, 14, yPos);
    yPos += size * 0.5 + 4;
  };

  const addSubtitle = (text: string) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(text, 14, yPos);
    yPos += 8;
  };

  const addText = (label: string, value: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(label, 14, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 100, yPos);
    yPos += 6;
  };

  const addSection = () => {
    yPos += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 8;
  };

  const checkPageBreak = (requiredSpace: number = 40) => {
    if (yPos > doc.internal.pageSize.getHeight() - requiredSpace) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Header
  doc.setFillColor(10, 15, 29); // Deep navy
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Total Cost of Ownership Report', 14, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 180, 160); // Gold-ish
  doc.text('Dubai Real Estate Investment Analysis', 14, 35);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - 80, 35);

  yPos = 60;

  // Property Details Section
  addTitle('Property Details');
  addText('Purchase Price:', data.formatValue(data.propertyDetails.purchasePrice));
  addText('Property Size:', `${data.propertyDetails.propertySize.toLocaleString()} sqft`);
  addText('Location:', data.propertyDetails.area);
  addText('Property Type:', data.propertyDetails.isOffPlan ? 'Off-Plan' : 'Ready');
  
  addSection();

  // Financing Section
  addTitle('Financing');
  addText('Payment Method:', data.financing.useMortgage ? 'Mortgage' : 'Cash Purchase');
  if (data.financing.useMortgage) {
    addText('Down Payment:', `${data.financing.downPayment}%`);
    addText('Interest Rate:', `${data.financing.interestRate}%`);
    addText('Loan Term:', `${data.financing.loanTerm} years`);
    addText('Loan Amount:', data.formatValue(data.financing.loanAmount || 0));
    addText('Monthly Payment:', data.formatValue(data.financing.monthlyPayment || 0));
  }

  addSection();

  // Investment Strategy Section
  addTitle('Investment Strategy');
  const usageTypeLabels: Record<string, string> = {
    personal: 'Personal Use',
    'long-term': 'Long-Term Rental',
    'short-term': 'Short-Term (Airbnb)',
  };
  addText('Usage Type:', usageTypeLabels[data.strategy.usageType] || data.strategy.usageType);
  if (data.strategy.usageType === 'long-term') {
    addText('Expected Annual Rent:', data.formatValue(data.strategy.annualRent || 0));
  } else if (data.strategy.usageType === 'short-term') {
    addText('Daily Rate:', data.formatValue(data.strategy.dailyRate || 0));
    addText('Occupancy Rate:', `${data.strategy.occupancyRate}%`);
  }
  addText('Holding Period:', `${data.timeline.holdingPeriod} years`);
  addText('Expected Appreciation:', `${data.timeline.appreciationRate}% per year`);

  addSection();
  checkPageBreak(80);

  // Acquisition Costs Table
  addTitle('Acquisition Costs (Year 0)');
  
  const acquisitionTableData = data.costs.acquisition
    .filter(item => item.value > 0)
    .map(item => [item.label, data.formatValue(item.value)]);
  acquisitionTableData.push(['Total Acquisition Costs', data.formatValue(data.costs.acquisitionTotal)]);

  autoTable(doc, {
    startY: yPos,
    head: [['Fee', 'Amount']],
    body: acquisitionTableData,
    theme: 'striped',
    headStyles: { fillColor: [10, 15, 29], textColor: [255, 255, 255] },
    footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
    didDrawPage: () => {
      yPos = (doc as any).lastAutoTable.finalY + 10;
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;
  checkPageBreak(80);

  // Ongoing Costs Table
  addTitle('Annual Ongoing Costs');
  
  const ongoingTableData = data.costs.ongoing
    .filter(item => item.value > 0)
    .map(item => [item.label, data.formatValue(item.value)]);
  ongoingTableData.push(['Total Annual Costs', data.formatValue(data.costs.ongoingTotal)]);
  ongoingTableData.push([`Total Over ${data.timeline.holdingPeriod} Years`, data.formatValue(data.costs.ongoingTotal * data.timeline.holdingPeriod)]);

  autoTable(doc, {
    startY: yPos,
    head: [['Cost Item', 'Annual Amount']],
    body: ongoingTableData,
    theme: 'striped',
    headStyles: { fillColor: [10, 15, 29], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;
  checkPageBreak(80);

  // Exit Costs Table
  addTitle(`Exit Costs (Year ${data.timeline.holdingPeriod})`);
  
  const exitTableData = data.costs.exit
    .filter(item => item.value > 0)
    .map(item => [item.label, data.formatValue(item.value)]);
  exitTableData.push(['Total Exit Costs', data.formatValue(data.costs.exitTotal)]);

  autoTable(doc, {
    startY: yPos,
    head: [['Fee', 'Amount']],
    body: exitTableData,
    theme: 'striped',
    headStyles: { fillColor: [10, 15, 29], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;
  checkPageBreak(100);

  // Investment Summary
  doc.addPage();
  yPos = 20;

  // Summary Header
  doc.setFillColor(10, 15, 29);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Investment Summary', 14, 25);

  yPos = 50;

  // Key Metrics Box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, yPos, pageWidth - 28, 70, 3, 3, 'F');
  
  yPos += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 37, 41);

  // Row 1
  doc.text('Total Cost of Ownership:', 24, yPos);
  doc.setTextColor(0, 128, 128); // Teal
  doc.text(data.formatValue(data.results.totalCostOfOwnership), 100, yPos);
  
  doc.setTextColor(33, 37, 41);
  doc.text('Net Profit:', pageWidth / 2 + 10, yPos);
  doc.setTextColor(data.results.netProfit >= 0 ? 34 : 220, data.results.netProfit >= 0 ? 139 : 53, data.results.netProfit >= 0 ? 34 : 69);
  doc.text(data.formatValue(data.results.netProfit), pageWidth / 2 + 60, yPos);

  yPos += 15;

  // Row 2
  doc.setTextColor(33, 37, 41);
  doc.text('Total ROI:', 24, yPos);
  doc.setTextColor(100, 100, 200);
  doc.text(`${data.results.roi.toFixed(1)}%`, 100, yPos);

  doc.setTextColor(33, 37, 41);
  doc.text('Annualized ROI:', pageWidth / 2 + 10, yPos);
  doc.setTextColor(100, 100, 200);
  doc.text(`${data.results.annualizedRoi.toFixed(2)}%`, pageWidth / 2 + 60, yPos);

  yPos += 15;

  // Row 3
  doc.setTextColor(33, 37, 41);
  doc.text('Initial Investment:', 24, yPos);
  doc.text(data.formatValue(data.results.initialInvestment), 100, yPos);

  doc.text('Exit Property Value:', pageWidth / 2 + 10, yPos);
  doc.text(data.formatValue(data.results.exitPropertyValue), pageWidth / 2 + 60, yPos);

  yPos += 15;

  // Row 4
  doc.text('Capital Appreciation:', 24, yPos);
  doc.setTextColor(34, 139, 34);
  doc.text(`+${data.formatValue(data.results.capitalAppreciation)}`, 100, yPos);

  if (data.strategy.usageType !== 'personal') {
    doc.setTextColor(33, 37, 41);
    doc.text('Total Rental Income:', pageWidth / 2 + 10, yPos);
    doc.setTextColor(34, 139, 34);
    doc.text(`+${data.formatValue(data.results.totalRentalIncome)}`, pageWidth / 2 + 60, yPos);
  }

  yPos += 30;

  // Additional Details
  if (data.financing.useMortgage || data.results.breakEvenYear > 0) {
    addSubtitle('Additional Details');
    yPos += 5;
    
    if (data.financing.useMortgage) {
      addText('Total Interest Paid:', `-${data.formatValue(data.results.totalInterest)}`);
    }
    if (data.results.breakEvenYear > 0) {
      addText('Break-Even Year:', `Year ${data.results.breakEvenYear}`);
    }
  }

  yPos += 20;

  // Disclaimer
  doc.setFillColor(255, 248, 220);
  doc.roundedRect(14, yPos, pageWidth - 28, 30, 3, 3, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Disclaimer: This report is for informational purposes only and should not be considered financial advice.', 20, yPos + 10);
  doc.text('Actual costs may vary based on market conditions, specific property details, and other factors.', 20, yPos + 18);
  doc.text('Please consult with qualified professionals before making investment decisions.', 20, yPos + 26);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Dubai Wealth Hub - Investment Tools', 14, footerY);
  doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - 30, footerY);

  // Save the PDF
  const fileName = `TCO_Report_${data.propertyDetails.area.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
