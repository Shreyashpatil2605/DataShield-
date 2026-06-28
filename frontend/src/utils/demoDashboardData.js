/**
 * Realistic demo data for PII Detection Dashboard
 * Generated with realistic values and proper data relationships
 */

export const dashboardDemoData = {
  // Summary Metrics
  summary: {
    total_pii: 1247,
    high_risk: 89,
    medium_severity: 542,
    loss: 127450,
    low_risk: 616,
  },

  // PII Breakdown (percentages)
  pii_breakdown: {
    SSN: 32,
    Email: 28,
    Phone: 22,
    CreditCard: 12,
    Password: 4,
    APIKey: 2,
  },

  // Risk Levels Over 7 Days
  risk_levels_by_day: [
    {
      day: "Monday",
      risk_score: 45,
      detected_count: 156,
      high_risk_count: 12,
    },
    {
      day: "Tuesday",
      risk_score: 52,
      detected_count: 168,
      high_risk_count: 14,
    },
    {
      day: "Wednesday",
      risk_score: 48,
      detected_count: 142,
      high_risk_count: 11,
    },
    {
      day: "Thursday",
      risk_score: 61,
      detected_count: 189,
      high_risk_count: 18,
    },
    {
      day: "Friday",
      risk_score: 58,
      detected_count: 176,
      high_risk_count: 16,
    },
    {
      day: "Saturday",
      risk_score: 42,
      detected_count: 123,
      high_risk_count: 8,
    },
    {
      day: "Sunday",
      risk_score: 38,
      detected_count: 95,
      high_risk_count: 6,
    },
  ],

  // Masked Records
  masked_records: {
    total_masked: 1247,
    by_method: {
      replace: 421,
      hash: 312,
      mask: 389,
      synthetic: 125,
    },
    success_rate: 99.8,
  },

  // Activity Logs
  activity_logs: {
    total_logs: 287,
    by_type: {
      detection: 145,
      redaction: 89,
      analysis: 42,
      export: 11,
    },
    last_24_hours: 47,
    last_7_days: 287,
  },

  // Recent Detections
  recent_detections: [
    {
      id: 1,
      timestamp: "2 hours ago",
      file: "customer_list.csv",
      entities_found: 45,
      high_risk: 3,
      status: "Redacted",
    },
    {
      id: 2,
      timestamp: "5 hours ago",
      file: "employee_data.xlsx",
      entities_found: 32,
      high_risk: 2,
      status: "Redacted",
    },
    {
      id: 3,
      timestamp: "1 day ago",
      file: "legacy_database.sql",
      entities_found: 156,
      high_risk: 12,
      status: "Redacted",
    },
    {
      id: 4,
      timestamp: "2 days ago",
      file: "user_profile_backup.json",
      entities_found: 78,
      high_risk: 5,
      status: "Redacted",
    },
    {
      id: 5,
      timestamp: "3 days ago",
      file: "transaction_logs.txt",
      entities_found: 203,
      high_risk: 18,
      status: "Redacted",
    },
  ],

  // Risk Distribution
  risk_distribution: {
    safe: 616,
    low: 285,
    medium: 542,
    high: 89,
    critical: 12,
  },

  // Entity Type Statistics
  entity_statistics: {
    SSN: {
      count: 398,
      average_risk: 85,
      masked: 398,
    },
    Email: {
      count: 349,
      average_risk: 42,
      masked: 349,
    },
    Phone: {
      count: 274,
      average_risk: 55,
      masked: 274,
    },
    CreditCard: {
      count: 149,
      average_risk: 92,
      masked: 149,
    },
    Password: {
      count: 50,
      average_risk: 95,
      masked: 50,
    },
    APIKey: {
      count: 27,
      average_risk: 88,
      masked: 27,
    },
  },

  // System Health
  system_health: {
    uptime: "99.9%",
    avg_processing_time: "2.3s",
    successful_detections: 1247,
    failed_detections: 3,
    success_rate: 99.8,
  },

  // Top Risk Sources
  top_risk_sources: [
    {
      source: "customer_database",
      risk_score: 87,
      entity_count: 234,
      sensitivity: "Critical",
    },
    {
      source: "employee_records",
      risk_score: 79,
      entity_count: 156,
      sensitivity: "High",
    },
    {
      source: "transaction_logs",
      risk_score: 68,
      entity_count: 203,
      sensitivity: "High",
    },
    {
      source: "backup_files",
      risk_score: 45,
      entity_count: 89,
      sensitivity: "Medium",
    },
    {
      source: "email_archives",
      risk_score: 32,
      entity_count: 123,
      sensitivity: "Medium",
    },
  ],

  // Export Statistics
  export_statistics: {
    total_exports: 47,
    formats: {
      csv: 23,
      json: 12,
      pdf: 8,
      xlsx: 4,
    },
    total_records_exported: 2847,
  },

  // Compliance Status
  compliance: {
    gdpr_compliance: 95,
    ccpa_compliance: 92,
    hipaa_compliance: 88,
    pci_dss_compliance: 97,
  },
};

/**
 * Generate a single random PII record for demo purposes
 */
export function generateRandomPIIRecord() {
  const piiTypes = [
    "SSN",
    "Email",
    "Phone",
    "CreditCard",
    "Password",
    "APIKey",
  ];
  const statuses = ["Detected", "Redacted", "Masked", "Encrypted"];

  return {
    id: Math.floor(Math.random() * 100000),
    type: piiTypes[Math.floor(Math.random() * piiTypes.length)],
    risk_level: ["safe", "low", "medium", "high", "critical"][
      Math.floor(Math.random() * 5)
    ],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    source_file: `file_${Math.floor(Math.random() * 1000)}.txt`,
  };
}

/**
 * Generate multiple random PII records
 */
export function generateRandomPIIRecords(count = 10) {
  return Array.from({ length: count }, () => generateRandomPIIRecord());
}

/**
 * Get summary statistics
 */
export function getSummaryStats() {
  return dashboardDemoData.summary;
}

/**
 * Get risk breakdown
 */
export function getRiskBreakdown() {
  return dashboardDemoData.pii_breakdown;
}

/**
 * Get weekly trend data
 */
export function getWeeklyTrends() {
  return dashboardDemoData.risk_levels_by_day;
}

/**
 * Get all demo data
 */
export function getAllDemoData() {
  return dashboardDemoData;
}

export default dashboardDemoData;
