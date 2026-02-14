/**
 * ESG Historical Data Service
 * Manages monthly ESG metrics storage and retrieval for trend analysis
 */

export interface ESGMetricSnapshot {
  id: string;
  loanId: string;
  loanName: string;
  month: string; // Format: "YYYY-MM"
  reportedReduction: number | null;
  verifiedReduction: number | null;
  transparencyScore: number;
  complianceScore: number;
  riskScore: number;
  verifiedBy: string[];
  timestamp: Date;
  dataQuality: 'verified' | 'unverified' | 'flagged';
  completeness: number;
}

export interface MonthlyAggregatedMetrics {
  month: string;
  reportedReduction: number | null;
  verifiedReduction: number | null;
  transparencyScore: number;
  complianceScore: number;
  riskScore: number;
  dataPoints: number;
}

/**
 * Store monthly ESG metrics (in production, this would be a database)
 * Using localStorage for demo, but structured for easy backend migration
 */
export class ESGHistoricalDataService {
  private static STORAGE_KEY = 'esg_historical_metrics';
  
  /**
   * Save a monthly ESG metric snapshot
   */
  static saveMonthlySnapshot(snapshot: Omit<ESGMetricSnapshot, 'id' | 'timestamp'>): ESGMetricSnapshot {
    const fullSnapshot: ESGMetricSnapshot = {
      ...snapshot,
      id: `snapshot-${snapshot.loanId}-${snapshot.month}-${Date.now()}`,
      timestamp: new Date(),
    };
    
    // Get existing data
    const existing = this.getAllSnapshots();
    
    // Remove duplicate for same loan/month (update scenario)
    const filtered = existing.filter(
      s => !(s.loanId === snapshot.loanId && s.month === snapshot.month)
    );
    
    // Add new snapshot
    const updated = [...filtered, fullSnapshot];
    
    // Save to storage (in production, this would be API call)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    
    return fullSnapshot;
  }
  
  /**
   * Get all snapshots for a specific loan
   */
  static getLoanSnapshots(loanId: string, months?: number): ESGMetricSnapshot[] {
    const all = this.getAllSnapshots();
    const loanSnapshots = all
      .filter(s => s.loanId === loanId)
      .sort((a, b) => a.month.localeCompare(b.month));
    
    if (months) {
      return loanSnapshots.slice(-months);
    }
    
    return loanSnapshots;
  }
  
  /**
   * Get aggregated monthly metrics for trend charts
   */
  static getMonthlyAggregated(loanId: string, months: number = 6): MonthlyAggregatedMetrics[] {
    const snapshots = this.getLoanSnapshots(loanId, months);
    
    // Group by month and aggregate
    const monthMap = new Map<string, ESGMetricSnapshot[]>();
    
    snapshots.forEach(snapshot => {
      if (!monthMap.has(snapshot.month)) {
        monthMap.set(snapshot.month, []);
      }
      monthMap.get(snapshot.month)!.push(snapshot);
    });
    
    // Aggregate data for each month
    const aggregated: MonthlyAggregatedMetrics[] = [];
    
    monthMap.forEach((snapshots, month) => {
      const validReductions = snapshots.filter(s => s.reportedReduction !== null && s.verifiedReduction !== null);
      const avgReported = validReductions.length > 0
        ? validReductions.reduce((sum, s) => sum + (s.reportedReduction || 0), 0) / validReductions.length
        : null;
      const avgVerified = validReductions.length > 0
        ? validReductions.reduce((sum, s) => sum + (s.verifiedReduction || 0), 0) / validReductions.length
        : null;
      
      const avgTransparency = snapshots.reduce((sum, s) => sum + s.transparencyScore, 0) / snapshots.length;
      const avgCompliance = snapshots.reduce((sum, s) => sum + s.complianceScore, 0) / snapshots.length;
      const avgRisk = snapshots.reduce((sum, s) => sum + s.riskScore, 0) / snapshots.length;
      
      aggregated.push({
        month,
        reportedReduction: avgReported,
        verifiedReduction: avgVerified,
        transparencyScore: Math.round(avgTransparency),
        complianceScore: Math.round(avgCompliance),
        riskScore: Math.round(avgRisk),
        dataPoints: snapshots.length,
      });
    });
    
    // Sort by month
    return aggregated.sort((a, b) => a.month.localeCompare(b.month));
  }
  
  /**
   * Get all snapshots (internal method)
   */
  private static getAllSnapshots(): ESGMetricSnapshot[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const data = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return data.map((item: ESGMetricSnapshot) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    } catch {
      return [];
    }
  }
  
  /**
   * Get current month string in YYYY-MM format
   */
  static getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  
  /**
   * Get last N months as strings
   */
  static getLastNMonths(n: number): string[] {
    const months: string[] = [];
    const now = new Date();
    
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthStr);
    }
    
    return months;
  }
  
  /**
   * Check if snapshot exists for current month
   */
  static hasCurrentMonthSnapshot(loanId: string): boolean {
    const currentMonth = this.getCurrentMonth();
    const snapshots = this.getLoanSnapshots(loanId);
    return snapshots.some(s => s.month === currentMonth);
  }
  
  /**
   * Validate and clean metric data before saving
   */
  static validateMetricData(data: Partial<ESGMetricSnapshot>): {
    valid: boolean;
    errors: string[];
    cleaned: Partial<ESGMetricSnapshot>;
  } {
    const errors: string[] = [];
    const cleaned: Partial<ESGMetricSnapshot> = { ...data };
    
    // Validate month format
    if (data.month && !/^\d{4}-\d{2}$/.test(data.month)) {
      errors.push('Invalid month format. Expected YYYY-MM');
    }
    
    // Validate percentages
    if (data.reportedReduction !== null && data.reportedReduction !== undefined) {
      if (data.reportedReduction < -100 || data.reportedReduction > 1000) {
        errors.push('Reported reduction out of valid range (-100 to 1000)');
      }
    }
    
    if (data.verifiedReduction !== null && data.verifiedReduction !== undefined) {
      if (data.verifiedReduction < -100 || data.verifiedReduction > 1000) {
        errors.push('Verified reduction out of valid range (-100 to 1000)');
      }
    }
    
    // Validate scores (0-100)
    if (data.transparencyScore !== undefined) {
      if (data.transparencyScore < 0 || data.transparencyScore > 100) {
        errors.push('Transparency score must be between 0 and 100');
        cleaned.transparencyScore = Math.max(0, Math.min(100, data.transparencyScore));
      }
    }
    
    if (data.complianceScore !== undefined) {
      if (data.complianceScore < 0 || data.complianceScore > 100) {
        errors.push('Compliance score must be between 0 and 100');
        cleaned.complianceScore = Math.max(0, Math.min(100, data.complianceScore));
      }
    }
    
    if (data.riskScore !== undefined) {
      if (data.riskScore < 0 || data.riskScore > 100) {
        errors.push('Risk score must be between 0 and 100');
        cleaned.riskScore = Math.max(0, Math.min(100, data.riskScore));
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      cleaned,
    };
  }
  
  /**
   * Initialize with seed data for demo purposes
   */
  static initializeSeedData(loanId: string, loanName: string): void {
    // Only initialize if no data exists
    if (this.hasCurrentMonthSnapshot(loanId)) {
      return;
    }
    
    const months = this.getLastNMonths(6);
    const now = new Date();
    
    // Generate historical data with realistic trends
    months.forEach((month, index) => {
      const monthIndex = index - (months.length - 1);
      const baseReported = 35 + (monthIndex * 2); // Slight improvement trend
      const baseVerified = 5 + (monthIndex * 1.5);
      const baseTransparency = 32 + (monthIndex * 3);
      
      this.saveMonthlySnapshot({
        loanId,
        loanName,
        month,
        reportedReduction: baseReported,
        verifiedReduction: baseVerified,
        transparencyScore: Math.max(0, Math.min(100, baseTransparency)),
        complianceScore: 45 + (monthIndex * 2),
        riskScore: 80 - (monthIndex * 2),
        verifiedBy: ['CDP', 'GRI'],
        dataQuality: 'verified',
        completeness: 60 + (monthIndex * 2),
      });
    });
  }
}
