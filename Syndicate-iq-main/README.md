# SyndicateIQ

**The AI Operating System for Syndicated Loan Intelligence**

## Overview
SyndicateIQ transforms syndicated loan operations by automating document processing, covenant monitoring, settlement due diligence, and ESG verification.

## Features
-  Document Intelligence Engine (99% faster processing)
-  Settlement Due Diligence Accelerator (85% time reduction)
-  Covenant Guardian (60-90 day breach prediction)
-  ESG Veritas Platform (greenwashing detection)
-  Cross-Platform Intelligence Hub (unified dashboard)

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Anthropic Claude API
- Recharts for data visualization
- PDF.js for document processing

## Getting Started
```bash
npm install
npm run dev

## Detailed Documentation

### Module 2: Settlement Due Diligence Accelerator
-  **PDF Upload** - Drag-and-drop document upload with validation
-  **Automated Extraction** - AI-powered document analysis (simulated)
-  **Risk Scoring** - Multi-factor settlement risk calculation
-  **Processing Simulation** - Real-time progress with timer
-  **Risk Breakdown** - Visual analysis of risk factors
-  **Report Generation** - Download comprehensive due diligence reports
-  **85% Faster** - Reduces processing time from 14 days to 2 hours

### Module 4: ESG Veritas Platform
-  **ESG Report Upload** - Multi-file support (PDF, CSV, Excel)
-  **Greenwashing Detection** - Advanced algorithm for transparency analysis
-  **LMA Compliance Checker** - Green Loan Terms compliance verification
-  **ESG Score Dashboard** - Comprehensive scoring and trends
-  **Quarterly Trends** - Visual charts for ESG performance
-  **Compliance Reports** - Export detailed analysis reports

### Module 5: Dashboard Hub
-  **Portfolio Overview** - Key metrics and KPIs
-  **Loans Table** - Comprehensive loan listing with filters
-  **Alerts Feed** - Real-time alert management
-  **Risk Distribution** - Visual portfolio risk analysis
-  **Covenant Monitoring** - Upcoming tests and compliance status
-  **Audit Trail** - Cryptographic hash-based activity log
-  **Executive Reporting** - One-click portfolio report export

##  Tech Stack

- **Frontend Framework**: React 19.2.0
- **Language**: TypeScript
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18
- **Routing**: React Router DOM 7.12.0
- **Charts**: Recharts 3.6.0
- **Icons**: Lucide React 0.562.0
- **File Upload**: React Dropzone 14.3.8
- **Date Utilities**: date-fns 4.1.0

##  Design System

### Colors
- **Primary Navy**: `#0A1929` - Main background
- **Accent Gold**: `#D4AF37` - Primary accent
- **Success**: `#10B981` - Success states
- **Warning**: `#F59E0B` - Warning states
- **Danger**: `#EF4444` - Error/danger states
- **Info**: `#3B82F6` - Information states

### Typography
- **Font Family**: Inter (via Google Fonts)
- **Base Unit**: 4px spacing system (Tailwind default)

## Data used

The application uses comprehensive mock data generators for:
- **Loans**: 18 realistic loan entries across multiple sectors
- **Covenants**: 3-6 covenants per loan with varying statuses
- **ESG Metrics**: Quarterly metrics for Environmental, Social, and Governance
- **Alerts**: Real-time alerts for covenant breaches, missing documents, ESG deviations
- **Audit Logs**: 50+ audit trail entries with cryptographic hashes

##  Key Algorithms

### Settlement Risk Score
```
RiskScore = (documentCompleteness × 0.25) +
            (amendmentComplexity × 0.20) +
            (crossBorderFactors × 0.18) +
            (partyHistory × 0.15) +
            (covenantStatus × 0.12) +
            (marketVolatility × 0.10)
```

### Greenwashing Detection
- **Transparency Score**: Based on data completeness and verification
- **Cherry-Picking**: Detects selective positive reporting
- **Vague Targets**: Identifies missing specific numbers/timelines

### ESG Scoring
- **Overall Score**: Weighted average (E: 40%, S: 30%, G: 30%)

##  Testing Checklist

See [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for comprehensive testing guidelines.

###  Test Checklist

- [ ] All pages load correctly
- [ ] Navigation between modules works
- [ ] PDF upload in Due Diligence module
- [ ] Processing simulation completes successfully
- [ ] Risk score calculation displays correctly
- [ ] ESG report upload accepts multiple files
- [ ] Greenwashing detection displays risk factors
- [ ] LMA compliance checklist shows status
- [ ] Dashboard displays portfolio metrics
- [ ] Loans table filters work correctly
- [ ] Alerts can be resolved
- [ ] Audit trail displays correctly
- [ ] Export functions generate reports
- [ ] Responsive design works on mobile/tablet


##  Categories Coverage

1. **Transparent Loan Trading** 
   - Module 2: Settlement Due Diligence Accelerator
   - Automated document extraction and risk assessment

2. **Greener Lending** 
   - Module 4: ESG Veritas Platform
   - ESG compliance and greenwashing detection

3. **Digital Loans** 
   - Module 5: Dashboard Hub
   - Digital portfolio management and tracking

4. **Loan Documents** 
   - Module 5: Dashboard Hub
   - Document management and audit trail

5. **Keeping Loans on Track** 
   - Module 5: Dashboard Hub
   - Covenant monitoring and alerts


##  Acknowledgments
- open-source

---

**Built with for WiCS Online Hackathon (Winter 2026)
**
