/**
 * Generate realistic demo data with small fluctuations
 * Maintains logical consistency between related metrics
 */

// Default base data - will be overridden by Dashboard initialization
const BASE_DATA = {
  totalPII: 1247,
  highRisk: 89,
  mediumSeverity: 542,
  loss: 127450,
  riskScore: 7,
};

/**
 * Generate slightly fluctuating demo data
 * @param {Object} baseData - Base data to fluctuate from
 * @param {number} fluctuationPercent - How much to fluctuate (default: 5%)
 * @returns {Object} Updated data with realistic fluctuations
 */
export function generateDemoDashboardData(
  baseData = BASE_DATA,
  fluctuationPercent = 5,
) {
  // Helper function to add realistic fluctuation
  const fluctuate = (value, percentage = fluctuationPercent) => {
    const maxChange = Math.floor(value * (percentage / 100));
    const change = Math.floor(Math.random() * maxChange * 2) - maxChange;
    return Math.max(1, value + change);
  };

  // Generate fluctuated values
  let totalPII = fluctuate(baseData.totalPII, fluctuationPercent);
  let highRisk = fluctuate(baseData.highRisk, fluctuationPercent);
  let mediumSeverity = fluctuate(baseData.mediumSeverity, fluctuationPercent);
  let loss = fluctuate(baseData.loss, fluctuationPercent);

  // Ensure logical consistency: high risk + medium severity <= total PII
  const totalRisk = highRisk + mediumSeverity;
  if (totalRisk > totalPII) {
    const scaleFactor = totalPII / totalRisk;
    highRisk = Math.floor(highRisk * scaleFactor);
    mediumSeverity = Math.floor(mediumSeverity * scaleFactor);
  }

  // Ensure high risk is never 0
  highRisk = Math.max(1, highRisk);
  mediumSeverity = Math.max(1, mediumSeverity);
  totalPII = Math.max(highRisk + mediumSeverity + 10, totalPII);

  // Loss should correlate with high risk (more high-risk PII = higher potential loss)
  const lossFromRisk = Math.floor(highRisk * 50 + mediumSeverity * 10);
  loss = Math.floor((loss + lossFromRisk) / 2);

  // Calculate risk score
  const riskScore = Math.round((highRisk / totalPII) * 100);

  return {
    totalPII,
    highRisk,
    mediumSeverity,
    loss,
    riskScore,
  };
}

/**
 * Generate trend data for the chart
 * @param {number} days - Number of days to generate data for
 * @returns {Array} Array of data points with fluctuation
 */
export function generateTrendData(days = 7) {
  const data = [];
  let baseValue = 50;

  for (let i = 0; i < days; i++) {
    const fluctuation = Math.floor(Math.random() * 30) - 15; // -15 to +15
    baseValue = Math.max(10, Math.min(90, baseValue + fluctuation));
    data.push({
      day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      value: baseValue,
      dataPoints: `${i * 50},${180 - baseValue * 2}`,
    });
  }

  return data;
}

/**
 * Format chart points string for SVG polyline
 * @param {Array} data - Trend data array
 * @returns {string} Points string for SVG polyline
 */
export function generateChartPoints(data) {
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 400;
    const y = 200 - d.value * 2;
    return `${x},${y}`;
  });
  return points.join(" ");
}
