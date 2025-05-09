// Utility functions for cyber security metrics and calculations

/**
 * Calculate the overall security score based on different metrics
 */
export function calculateSecurityScore(metrics: {
  vulnerabilities: number;
  patchedSystems: number;
  totalSystems: number;
  mfaEnabled: number;
  totalUsers: number;
  backupSuccessRate: number;
}): number {
  const { vulnerabilities, patchedSystems, totalSystems, mfaEnabled, totalUsers, backupSuccessRate } = metrics;
  
  // Calculate scores for different categories
  const patchScore = (patchedSystems / totalSystems) * 100;
  const vulnScore = Math.max(0, 100 - (vulnerabilities * 2)); // Each vulnerability reduces score
  const mfaScore = (mfaEnabled / totalUsers) * 100;
  const backupScore = backupSuccessRate;
  
  // Calculate weighted average (could adjust weights based on importance)
  const weightedScore = (
    patchScore * 0.25 +
    vulnScore * 0.35 +
    mfaScore * 0.2 +
    backupScore * 0.2
  );
  
  return Math.round(weightedScore);
}

/**
 * Determine the severity level of a security incident
 */
export function determineSeverity(
  incident: {
    type: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    scope: 'isolated' | 'limited' | 'widespread' | 'complete';
    authenticated: boolean;
  }
): 'low' | 'medium' | 'high' | 'critical' {
  const { type, impact, scope, authenticated } = incident;
  
  // Critical severity conditions
  if (
    impact === 'critical' ||
    (impact === 'high' && scope === 'widespread') ||
    (type === 'ransomware' && scope !== 'isolated')
  ) {
    return 'critical';
  }
  
  // High severity conditions
  if (
    impact === 'high' ||
    (impact === 'medium' && scope === 'widespread') ||
    (type === 'data_breach' && authenticated)
  ) {
    return 'high';
  }
  
  // Medium severity conditions
  if (
    impact === 'medium' ||
    (impact === 'low' && scope === 'widespread')
  ) {
    return 'medium';
  }
  
  // Low severity for everything else
  return 'low';
}

/**
 * Calculate the risk score for a vulnerability
 */
export function calculateCVSSScore(
  base: number,
  temporalFactors: {
    exploitability: number;
    remediationLevel: number;
    reportConfidence: number;
  },
  environmentalFactors: {
    assetCriticality: number;
    mitigatingControls: number;
  }
): number {
  const { exploitability, remediationLevel, reportConfidence } = temporalFactors;
  const { assetCriticality, mitigatingControls } = environmentalFactors;
  
  // Apply temporal factors
  const temporalScore = base * exploitability * remediationLevel * reportConfidence;
  
  // Apply environmental factors
  const envScore = temporalScore * assetCriticality * (1 - mitigatingControls);
  
  return Math.min(10, Math.max(0, parseFloat(envScore.toFixed(1))));
}

/**
 * Calculate suggested priorities for remediation actions
 */
export function prioritizeRemediation(
  vulnerabilities: Array<{
    id: string;
    cvssScore: number;
    exploitAvailable: boolean;
    assetCriticality: number;
    patchAvailable: boolean;
  }>
): Array<{ id: string; priority: number }> {
  return vulnerabilities
    .map(vuln => {
      // Calculate priority score based on multiple factors
      let priority = vuln.cvssScore * 10; // Base on CVSS score (0-100 scale)
      
      // Increase priority if exploit is available
      if (vuln.exploitAvailable) {
        priority += 20;
      }
      
      // Increase based on asset criticality (0-5 scale)
      priority += vuln.assetCriticality * 10;
      
      // Slightly increase priority if patch is available (easier to fix)
      if (vuln.patchAvailable) {
        priority += 5;
      }
      
      return { id: vuln.id, priority: Math.min(100, priority) };
    })
    .sort((a, b) => b.priority - a.priority); // Sort by priority (descending)
}
