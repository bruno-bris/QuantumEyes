/**
 * Types pour les données de rapport
 */

// Type pour une anomalie réseau
export interface Anomaly {
  connection_id: number;
  source_ip: string;
  destination_ip: string;
  protocol: string;
  port: number;
  anomaly_score: string | number;
  anomaly_type: string;
}

// Type pour les métriques réseau
export interface NetworkMetrics {
  nodes: number;
  edges: number;
  density: number;
  avg_degree: number;
  connected_components: number;
  avg_clustering: number;
}

// Type pour les détails quantiques
export interface QuantumDetails {
  qubits: number;
  shots: number;
  feature_map: string;
  ansatz: string;
}

// Type pour les résultats de simulation quantique
export interface QuantumSimulationResults {
  counts: Record<string, number>;
  fidelity?: number;
  success_rate?: number;
  anomalous_states?: string[];
}

// Type pour le contenu du rapport
export interface ReportContent {
  anomalies: Anomaly[];
  metrics: NetworkMetrics;
  quantum_details: QuantumDetails;
  quantum_simulation?: QuantumSimulationResults;
  execution_time: string | number;
  graph_image_url: string;
  circuit_image_url: string;
  histogram_image_url: string;
  timestamp: string;
  anomaly_detected?: boolean;
}

// Type pour un rapport
export interface Report {
  id: number;
  title: string;
  description: string;
  type: string;
  content: string;
  createdAt: string;
  fileUrl?: string | null;
  iconType?: string | null;
  organizationId: number;
  metrics?: {
    securityScore?: number;
    threats?: number;
    vulnerabilities?: number;
  };
  parsedContent?: ReportContent;
}