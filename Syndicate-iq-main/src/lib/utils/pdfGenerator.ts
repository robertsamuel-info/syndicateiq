/**
 * Professional PDF Report Generator
 * Generates formatted PDF reports using browser print functionality
 */

export interface PDFReportData {
  title: string;
  generatedAt: string;
  esgMetrics: Array<{ name: string; value: number }>;
  riskScore: number;
  complianceStatus: string;
  borrower: {
    name: string;
    creditScore: number;
    annualRevenue: number;
    debt: number;
  };
  approvalStatus: string;
  auditLog: Array<{ time: string; message: string }>;
}

/**
 * Generates a professional PDF report using HTML and browser print
 */
export function generatePDFReport(data: PDFReportData): void {
  // Calculate additional metrics
  const debtToIncomeRatio = data.borrower.annualRevenue > 0 
    ? ((data.borrower.debt / data.borrower.annualRevenue) * 100).toFixed(2)
    : '0';
  
  const creditRiskLevel = data.borrower.creditScore > 700 
    ? 'Low Risk' 
    : data.borrower.creditScore > 600 
    ? 'Medium Risk' 
    : 'High Risk';
  
  // Create HTML content
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 1.5cm;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      background: #ffffff;
      padding: 40px;
      max-width: 210mm;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      padding: 40px;
      margin: -40px -40px 40px -40px;
      border-radius: 0;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 500;
    }
    .report-title {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
      padding-top: 20px;
    }
    .report-date {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 30px;
    }
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #10b981;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .metric-item {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    .metric-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      font-weight: 600;
    }
    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
    }
    .risk-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
      margin-top: 12px;
    }
    .badge-green {
      background: #d1fae5;
      color: #065f46;
    }
    .badge-yellow {
      background: #fef3c7;
      color: #92400e;
    }
    .badge-red {
      background: #fee2e2;
      color: #991b1b;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    .info-table tr {
      border-bottom: 1px solid #e2e8f0;
    }
    .info-table tr:last-child {
      border-bottom: none;
    }
    .info-table td {
      padding: 12px 0;
      font-size: 14px;
    }
    .info-table td:first-child {
      color: #64748b;
      font-weight: 600;
      width: 200px;
    }
    .info-table td:last-child {
      color: #0f172a;
      font-weight: 600;
    }
    .status-box {
      background: #f1f5f9;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .status-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .status-value {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
    }
    .audit-log {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      max-height: 400px;
      overflow-y: auto;
    }
    .audit-item {
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    .audit-item:last-child {
      border-bottom: none;
    }
    .audit-time {
      color: #64748b;
      font-weight: 600;
      margin-right: 12px;
    }
    .audit-message {
      color: #0f172a;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }
    .print-button:hover {
      background: #059669;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>
  
  <div class="header">
    <h1>SyndicateIQ</h1>
    <p>Due Diligence Report</p>
  </div>
  
  <h2 class="report-title">${data.title}</h2>
  <p class="report-date">Generated: ${data.generatedAt}</p>
  
  <div class="section">
    <h3 class="section-title">ESG Metrics</h3>
    <div class="metric-grid">
      ${data.esgMetrics.map(metric => `
        <div class="metric-item">
          <div class="metric-label">${metric.name}</div>
          <div class="metric-value">${metric.value}%</div>
        </div>
      `).join('')}
    </div>
  </div>
  
  <div class="section">
    <h3 class="section-title">ESG Risk Assessment</h3>
    <div class="info-table">
      <tr>
        <td>Overall ESG Risk Score</td>
        <td>${data.riskScore}</td>
      </tr>
      <tr>
        <td>Compliance Status</td>
        <td>
          <span class="risk-badge ${data.complianceStatus === 'GREEN' ? 'badge-green' : data.complianceStatus === 'AMBER' ? 'badge-yellow' : 'badge-red'}">
            ${data.complianceStatus}
          </span>
        </td>
      </tr>
    </div>
  </div>
  
  <div class="section">
    <h3 class="section-title">Credit Risk Assessment</h3>
    <table class="info-table">
      <tr>
        <td>Borrower Name</td>
        <td>${data.borrower.name || 'Not provided'}</td>
      </tr>
      <tr>
        <td>Credit Score</td>
        <td>${data.borrower.creditScore > 0 ? data.borrower.creditScore : 'Not provided'}</td>
      </tr>
      <tr>
        <td>Annual Revenue</td>
        <td>${data.borrower.annualRevenue > 0 ? '₹' + data.borrower.annualRevenue.toLocaleString() : 'Not provided'}</td>
      </tr>
      <tr>
        <td>Outstanding Debt</td>
        <td>${data.borrower.debt > 0 ? '₹' + data.borrower.debt.toLocaleString() : 'Not provided'}</td>
      </tr>
      <tr>
        <td>Debt-to-Income Ratio</td>
        <td>${debtToIncomeRatio}%</td>
      </tr>
      <tr>
        <td>Risk Level</td>
        <td>
          <span class="risk-badge ${creditRiskLevel === 'Low Risk' ? 'badge-green' : creditRiskLevel === 'Medium Risk' ? 'badge-yellow' : 'badge-red'}">
            ${creditRiskLevel}
          </span>
        </td>
      </tr>
    </table>
  </div>
  
  <div class="section">
    <h3 class="section-title">Approval Status</h3>
    <div class="status-box">
      <div class="status-label">Current Status</div>
      <div class="status-value">${data.approvalStatus}</div>
    </div>
  </div>
  
  <div class="section">
    <h3 class="section-title">Audit Trail</h3>
    <div class="audit-log">
      ${data.auditLog.length === 0 ? '<p>No events logged</p>' : data.auditLog.map(log => `
        <div class="audit-item">
          <span class="audit-time">[${log.time}]</span>
          <span class="audit-message">${log.message}</span>
        </div>
      `).join('')}
    </div>
  </div>
  
  <div class="footer">
    <p>Confidential - SyndicateIQ Due Diligence Report</p>
    <p>This report was generated on ${data.generatedAt}</p>
  </div>
</body>
</html>
  `;
  
  // Create a new window with the HTML content
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  } else {
    // Fallback: create downloadable HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Due_Diligence_Report_${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
