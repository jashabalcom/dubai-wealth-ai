import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Type for accessing lastAutoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

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
  sensitivityAnalysis?: {
    scenarios: {
      name: string;
      roi: number;
      annualizedRoi: number;
      netProfit: number;
      breakEvenYear: number;
    }[];
    roiByAppreciation: { rate: number; roi: number }[];
    roiByYield: { yield: number; roi: number }[];
    breakEvenByAppreciation: { rate: number; years: number }[];
  };
  cashOnCash?: {
    annualCashFlow: number;
    cashOnCashReturn: number;
    grossRentalYield: number;
    netRentalYield: number;
    totalCashInvested: number;
    cocByDownPayment: { downPayment: number; coc: number }[];
    incomeAttribution: { cashFlow: number; appreciation: number };
  };
  formatValue: (value: number) => string;
}

// Helper function to calculate scenarios for PDF
function calculateScenarioForPDF(params: {
  purchasePrice: number;
  appreciationRate: number;
  annualRent: number;
  holdingPeriod: number;
  useMortgage: boolean;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
}): { roi: number; netProfit: number; annualizedRoi: number; breakEvenYear: number } {
  const {
    purchasePrice,
    appreciationRate,
    annualRent,
    holdingPeriod,
    useMortgage,
    downPayment,
    interestRate,
    loanTerm,
  } = params;

  const loanAmount = useMortgage ? purchasePrice * (1 - downPayment / 100) : 0;
  const acquisitionCosts = purchasePrice * 0.07;
  const annualOngoing = purchasePrice * 0.02;
  
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = useMortgage && loanAmount > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;
  const annualMortgagePayment = monthlyPayment * 12;

  const exitPropertyValue = purchasePrice * Math.pow(1 + appreciationRate / 100, holdingPeriod);
  const exitCosts = exitPropertyValue * 0.025;
  const totalOngoingCosts = annualOngoing * holdingPeriod;
  const mortgageYears = Math.min(holdingPeriod, loanTerm);
  const totalFinancingCosts = useMortgage ? annualMortgagePayment * mortgageYears : 0;
  const totalRentalIncome = annualRent * holdingPeriod;
  const capitalAppreciation = exitPropertyValue - purchasePrice;
  const totalMortgagePayments = monthlyPayment * numPayments;
  const totalInterest = useMortgage ? totalMortgagePayments - loanAmount : 0;
  const netProfit = capitalAppreciation + totalRentalIncome - totalOngoingCosts - totalFinancingCosts - exitCosts - (useMortgage ? totalInterest : 0);
  const initialInvestment = useMortgage 
    ? (purchasePrice * downPayment / 100) + acquisitionCosts 
    : purchasePrice + acquisitionCosts;
  const roi = (netProfit / initialInvestment) * 100;
  const annualizedRoi = (Math.pow(1 + roi / 100, 1 / holdingPeriod) - 1) * 100;

  // Break-even calculation
  let breakEvenYear = -1;
  for (let year = 1; year <= 30; year++) {
    const propertyValue = purchasePrice * Math.pow(1 + appreciationRate / 100, year);
    const appreciation = propertyValue - purchasePrice;
    const yearExitCosts = propertyValue * 0.025;
    const yearMortgageYears = Math.min(year, loanTerm);
    const yearFinancingCosts = useMortgage ? annualMortgagePayment * yearMortgageYears : 0;
    const yearOngoingCosts = annualOngoing * year;
    const yearRentalIncome = annualRent * year;
    
    let remainingBalance = 0;
    if (useMortgage && year < loanTerm) {
      const paymentsRemaining = (loanTerm - year) * 12;
      remainingBalance = monthlyPayment * (1 - Math.pow(1 + monthlyRate, -paymentsRemaining)) / monthlyRate;
    }
    const yearNetProfit = appreciation + yearRentalIncome - yearOngoingCosts - yearFinancingCosts - yearExitCosts - initialInvestment + (useMortgage ? loanAmount - remainingBalance : 0);
    
    if (breakEvenYear === -1 && yearNetProfit >= 0) {
      breakEvenYear = year;
      break;
    }
  }

  return { roi, netProfit, annualizedRoi, breakEvenYear: breakEvenYear === -1 ? 31 : breakEvenYear };
}

// Helper for cash-on-cash calculation
function calculateCoCForPDF(params: {
  purchasePrice: number;
  annualRent: number;
  useMortgage: boolean;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
}): { annualCashFlow: number; cashOnCashReturn: number; grossRentalYield: number; netRentalYield: number; totalCashInvested: number } {
  const { purchasePrice, annualRent, useMortgage, downPayment, interestRate, loanTerm } = params;

  const loanAmount = useMortgage ? purchasePrice * (1 - downPayment / 100) : 0;
  const acquisitionCosts = purchasePrice * 0.07;
  const annualExpenses = purchasePrice * 0.02;
  
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = useMortgage && loanAmount > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;
  const annualMortgagePayment = monthlyPayment * 12;

  const totalCashInvested = useMortgage 
    ? (purchasePrice * downPayment / 100) + acquisitionCosts 
    : purchasePrice + acquisitionCosts;
  const annualCashFlow = annualRent - annualExpenses - annualMortgagePayment;
  const cashOnCashReturn = (annualCashFlow / totalCashInvested) * 100;
  const grossRentalYield = (annualRent / purchasePrice) * 100;
  const netRentalYield = ((annualRent - annualExpenses) / purchasePrice) * 100;

  return { annualCashFlow, cashOnCashReturn, grossRentalYield, netRentalYield, totalCashInvested };
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

  const addPageFooter = () => {
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('Dubai Wealth Hub - Investment Tools', 14, footerY);
    doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - 30, footerY);
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
      yPos = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 10;
    },
  });

  yPos = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 15;
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

  yPos = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 15;
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

  yPos = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 15;
  checkPageBreak(100);

  // Investment Summary Page
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

  // Generate and add Sensitivity Analysis
  if (data.strategy.usageType !== 'personal') {
    doc.addPage();
    yPos = 20;

    // Sensitivity Analysis Header
    doc.setFillColor(10, 15, 29);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Sensitivity & Scenario Analysis', 14, 25);

    yPos = 50;

    // Generate scenario data
    const baseScenario = calculateScenarioForPDF({
      purchasePrice: data.propertyDetails.purchasePrice,
      appreciationRate: data.timeline.appreciationRate,
      annualRent: data.strategy.annualRent || 0,
      holdingPeriod: data.timeline.holdingPeriod,
      useMortgage: data.financing.useMortgage || false,
      downPayment: data.financing.downPayment || 25,
      interestRate: data.financing.interestRate || 4.5,
      loanTerm: data.financing.loanTerm || 25,
    });

    const conservativeScenario = calculateScenarioForPDF({
      purchasePrice: data.propertyDetails.purchasePrice,
      appreciationRate: Math.max(0, data.timeline.appreciationRate - 3),
      annualRent: (data.strategy.annualRent || 0) * 0.85,
      holdingPeriod: data.timeline.holdingPeriod,
      useMortgage: data.financing.useMortgage || false,
      downPayment: data.financing.downPayment || 25,
      interestRate: data.financing.interestRate || 4.5,
      loanTerm: data.financing.loanTerm || 25,
    });

    const optimisticScenario = calculateScenarioForPDF({
      purchasePrice: data.propertyDetails.purchasePrice,
      appreciationRate: data.timeline.appreciationRate + 3,
      annualRent: (data.strategy.annualRent || 0) * 1.15,
      holdingPeriod: data.timeline.holdingPeriod,
      useMortgage: data.financing.useMortgage || false,
      downPayment: data.financing.downPayment || 25,
      interestRate: data.financing.interestRate || 4.5,
      loanTerm: data.financing.loanTerm || 25,
    });

    // Scenario Comparison Table
    addTitle('Scenario Comparison');
    
    const scenarioTableData = [
      ['Conservative', `${Math.max(0, data.timeline.appreciationRate - 3)}%`, '15% lower', 
        `${conservativeScenario.roi.toFixed(1)}%`, `${conservativeScenario.annualizedRoi.toFixed(2)}%`, 
        conservativeScenario.breakEvenYear > 30 ? '30+' : `${conservativeScenario.breakEvenYear}`],
      ['Base Case', `${data.timeline.appreciationRate}%`, 'Current', 
        `${baseScenario.roi.toFixed(1)}%`, `${baseScenario.annualizedRoi.toFixed(2)}%`,
        baseScenario.breakEvenYear > 30 ? '30+' : `${baseScenario.breakEvenYear}`],
      ['Optimistic', `${data.timeline.appreciationRate + 3}%`, '15% higher', 
        `${optimisticScenario.roi.toFixed(1)}%`, `${optimisticScenario.annualizedRoi.toFixed(2)}%`,
        optimisticScenario.breakEvenYear > 30 ? '30+' : `${optimisticScenario.breakEvenYear}`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Scenario', 'Appreciation', 'Rent Adj.', 'Total ROI', 'Annualized', 'Break-Even (yrs)']],
      body: scenarioTableData,
      theme: 'striped',
      headStyles: { fillColor: [10, 15, 29], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 20;

    // ROI by Appreciation Rate
    addTitle('ROI by Appreciation Rate');
    
    const appreciationRates = [0, 2, 4, 6, 8, 10];
    const roiByAppreciationData = appreciationRates.map(rate => {
      const result = calculateScenarioForPDF({
        purchasePrice: data.propertyDetails.purchasePrice,
        appreciationRate: rate,
        annualRent: data.strategy.annualRent || 0,
        holdingPeriod: data.timeline.holdingPeriod,
        useMortgage: data.financing.useMortgage || false,
        downPayment: data.financing.downPayment || 25,
        interestRate: data.financing.interestRate || 4.5,
        loanTerm: data.financing.loanTerm || 25,
      });
      return [`${rate}%`, `${result.roi.toFixed(1)}%`, `${result.annualizedRoi.toFixed(2)}%`, result.breakEvenYear > 30 ? '30+' : `${result.breakEvenYear} yrs`];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Appreciation Rate', 'Total ROI', 'Annualized ROI', 'Break-Even']],
      body: roiByAppreciationData,
      theme: 'striped',
      headStyles: { fillColor: [10, 15, 29], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 20;
    checkPageBreak(80);

    // ROI by Rental Yield
    addTitle('ROI by Rental Yield');
    
    const rentalYields = [4, 5, 6, 7, 8];
    const roiByYieldData = rentalYields.map(yieldRate => {
      const simulatedRent = data.propertyDetails.purchasePrice * (yieldRate / 100);
      const result = calculateScenarioForPDF({
        purchasePrice: data.propertyDetails.purchasePrice,
        appreciationRate: data.timeline.appreciationRate,
        annualRent: simulatedRent,
        holdingPeriod: data.timeline.holdingPeriod,
        useMortgage: data.financing.useMortgage || false,
        downPayment: data.financing.downPayment || 25,
        interestRate: data.financing.interestRate || 4.5,
        loanTerm: data.financing.loanTerm || 25,
      });
      return [`${yieldRate}%`, data.formatValue(simulatedRent), `${result.roi.toFixed(1)}%`, `${result.annualizedRoi.toFixed(2)}%`];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Rental Yield', 'Annual Rent', 'Total ROI', 'Annualized ROI']],
      body: roiByYieldData,
      theme: 'striped',
      headStyles: { fillColor: [10, 15, 29], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 20;

    // Cash-on-Cash Analysis Page
    doc.addPage();
    yPos = 20;

    // Cash-on-Cash Header
    doc.setFillColor(10, 15, 29);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Cash-on-Cash Return Analysis', 14, 25);

    yPos = 50;

    // Calculate base cash-on-cash
    const baseCoc = calculateCoCForPDF({
      purchasePrice: data.propertyDetails.purchasePrice,
      annualRent: data.strategy.annualRent || 0,
      useMortgage: data.financing.useMortgage || false,
      downPayment: data.financing.downPayment || 25,
      interestRate: data.financing.interestRate || 4.5,
      loanTerm: data.financing.loanTerm || 25,
    });

    // Cash Flow Summary Box
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, yPos, pageWidth - 28, 55, 3, 3, 'F');
    
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 37, 41);

    doc.text('Annual Cash Flow:', 24, yPos);
    doc.setTextColor(baseCoc.annualCashFlow >= 0 ? 34 : 220, baseCoc.annualCashFlow >= 0 ? 139 : 53, baseCoc.annualCashFlow >= 0 ? 34 : 69);
    doc.text(data.formatValue(baseCoc.annualCashFlow), 80, yPos);

    doc.setTextColor(33, 37, 41);
    doc.text('Cash-on-Cash Return:', pageWidth / 2, yPos);
    doc.setTextColor(100, 100, 200);
    doc.text(`${baseCoc.cashOnCashReturn.toFixed(2)}%`, pageWidth / 2 + 55, yPos);

    yPos += 15;

    doc.setTextColor(33, 37, 41);
    doc.text('Gross Rental Yield:', 24, yPos);
    doc.text(`${baseCoc.grossRentalYield.toFixed(2)}%`, 80, yPos);

    doc.text('Net Rental Yield:', pageWidth / 2, yPos);
    doc.text(`${baseCoc.netRentalYield.toFixed(2)}%`, pageWidth / 2 + 55, yPos);

    yPos += 15;

    doc.text('Total Cash Invested:', 24, yPos);
    doc.text(data.formatValue(baseCoc.totalCashInvested), 80, yPos);

    yPos += 30;

    // Cash-on-Cash by Down Payment
    if (data.financing.useMortgage) {
      addTitle('Cash-on-Cash by Down Payment');
      
      const downPayments = [20, 25, 30, 40, 50, 75, 100];
      const cocByDpData = downPayments.map(dp => {
        const result = calculateCoCForPDF({
          purchasePrice: data.propertyDetails.purchasePrice,
          annualRent: data.strategy.annualRent || 0,
          useMortgage: dp < 100,
          downPayment: dp,
          interestRate: data.financing.interestRate || 4.5,
          loanTerm: data.financing.loanTerm || 25,
        });
        return [`${dp}%`, data.formatValue(result.annualCashFlow), `${result.cashOnCashReturn.toFixed(2)}%`];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Down Payment', 'Annual Cash Flow', 'Cash-on-Cash Return']],
        body: cocByDpData,
        theme: 'striped',
        headStyles: { fillColor: [10, 15, 29], textColor: [255, 255, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 20;
    }

    // Return Attribution
    addTitle('Return Attribution');
    
    const totalAppreciation = data.propertyDetails.purchasePrice * Math.pow(1 + data.timeline.appreciationRate / 100, data.timeline.holdingPeriod) - data.propertyDetails.purchasePrice;
    const totalCashFlow = baseCoc.annualCashFlow * data.timeline.holdingPeriod;
    const totalReturns = Math.abs(totalAppreciation) + Math.abs(totalCashFlow);
    
    const attributionData = [
      ['Cash Flow (Income)', data.formatValue(totalCashFlow), totalReturns > 0 ? `${((totalCashFlow / totalReturns) * 100).toFixed(1)}%` : '0%'],
      ['Appreciation (Capital Gains)', data.formatValue(totalAppreciation), totalReturns > 0 ? `${((totalAppreciation / totalReturns) * 100).toFixed(1)}%` : '0%'],
      ['Total Returns', data.formatValue(totalAppreciation + totalCashFlow), '100%'],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Return Type', `Amount (${data.timeline.holdingPeriod} years)`, '% of Total']],
      body: attributionData,
      theme: 'striped',
      headStyles: { fillColor: [10, 15, 29], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
  }

  // Final Page - Disclaimer
  doc.addPage();
  yPos = 20;

  doc.setFillColor(10, 15, 29);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Important Disclaimers', 14, 25);

  yPos = 55;

  // Disclaimer
  doc.setFillColor(255, 248, 220);
  doc.roundedRect(14, yPos, pageWidth - 28, 60, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  
  const disclaimerLines = [
    '• This report is for informational purposes only and should not be considered financial advice.',
    '• Actual costs may vary based on market conditions, specific property details, and other factors.',
    '• Past performance does not guarantee future results. Property values can go up or down.',
    '• Rental income projections are estimates and actual rental yields may vary significantly.',
    '• Please consult with qualified professionals before making investment decisions.',
    '• Exchange rates are subject to fluctuation and may affect actual returns.',
  ];
  
  let lineY = yPos + 12;
  disclaimerLines.forEach(line => {
    doc.text(line, 20, lineY);
    lineY += 8;
  });

  yPos = lineY + 20;

  // Assumptions note
  addSubtitle('Assumptions Used in This Report');
  yPos += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  const assumptionLines = [
    `• Acquisition costs calculated at approximately 7% of purchase price`,
    `• Annual ongoing costs estimated at 2% of property value`,
    `• Exit costs estimated at 2.5% of sale price`,
    `• Sensitivity analysis uses ±3% appreciation rate variance`,
    `• Conservative/Optimistic scenarios use 15% rental adjustment`,
  ];
  
  assumptionLines.forEach(line => {
    doc.text(line, 14, yPos);
    yPos += 7;
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addPageFooter();
  }

  // Save the PDF
  const fileName = `TCO_Report_${data.propertyDetails.area.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
