/**
 * Fonctions utilitaires pour formater les données de rapport pour les visualisations
 */

import { ReportContent, Anomaly } from "../../types/reports";

/**
 * Convertit des états quantiques (ex: "0000", "1111") en données d'histogramme pour Recharts
 */
export const parseQuantumHistogramData = (
  content?: ReportContent | null
): Record<string, number> | null => {
  if (!content) return null;

  // Si des données de simulation existent dans le rapport, les utiliser
  if (content.quantum_simulation?.counts) {
    return content.quantum_simulation.counts;
  }

  // Créer un histogramme simulé basé sur le nombre de qubits
  // (pour illustrer à quoi cela ressemblerait)
  const qubits = content.quantum_details?.qubits || 4;
  const numStates = Math.pow(2, qubits);
  const result: Record<string, number> = {};

  // Créer plus de probabilité pour les états "tous à 0" et "tous à 1"
  // (typique dans les circuits quantiques simples)
  const allZeros = "0".repeat(qubits);
  const allOnes = "1".repeat(qubits);

  result[allZeros] = Math.floor(Math.random() * 300) + 200;
  result[allOnes] = Math.floor(Math.random() * 400) + 300;

  // Répartir le reste des probabilités
  const remainingTotal = 1024 - (result[allZeros] + result[allOnes]);
  const remainingStates = numStates - 2;
  
  for (let i = 0; i < numStates; i++) {
    const state = i.toString(2).padStart(qubits, "0");
    if (state !== allZeros && state !== allOnes) {
      // Attribuer une valeur aléatoire mais proportionnelle aux états restants
      result[state] = Math.floor(Math.random() * remainingTotal / remainingStates);
    }
  }

  return result;
};

/**
 * Convertit les données de connexions réseau en nœuds et arêtes pour visualisation de graphe
 */
export const parseNetworkGraphData = (content?: ReportContent | null) => {
  if (!content) {
    return { nodes: [], edges: [] };
  }

  // Extraire les anomalies
  const anomalies = content.anomalies || [];
  
  // Créer des nœuds et arêtes si disponibles
  const nodes: { id: string; color?: string; size?: number }[] = [];
  const edges: { source: string; target: string; value?: number; color?: string }[] = [];
  
  // Ensemble pour suivre les nœuds uniques
  const uniqueNodes = new Set<string>();
  
  // Ajouter tous les nœuds et arêtes des anomalies
  anomalies.forEach(anomaly => {
    const sourceIp = anomaly.source_ip;
    const destIp = anomaly.destination_ip;
    
    // Ajouter à l'ensemble des nœuds uniques
    uniqueNodes.add(sourceIp);
    uniqueNodes.add(destIp);
    
    // Ajouter l'arête
    edges.push({
      source: sourceIp,
      target: destIp,
      value: 2,
      color: "#ef4444" // Rouge pour les anomalies
    });
  });
  
  // Convertir l'ensemble en tableau de nœuds
  Array.from(uniqueNodes).forEach(ip => {
    // Supposer que les IPs commençant par 192.168, 10., ou 172.16-31 sont des IPs internes
    const isInternal = 
      ip.startsWith("192.168.") || 
      ip.startsWith("10.") || 
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);
    
    nodes.push({
      id: ip,
      color: isInternal ? "#3b82f6" : "#9ca3af", // Bleu pour interne, gris pour externe
      size: isInternal ? 20 : 15
    });
  });
  
  // Si les données sont trop limitées, ajouter quelques nœuds et arêtes supplémentaires
  // (cette partie devrait être adaptée en fonction des données réelles)
  if (nodes.length < 3) {
    nodes.push(
      { id: "192.168.1.1", color: "#3b82f6", size: 20 },
      { id: "192.168.1.2", color: "#3b82f6", size: 20 },
      { id: "8.8.8.8", color: "#9ca3af", size: 15 }
    );
    
    edges.push(
      { source: "192.168.1.1", target: "192.168.1.2", value: 1 },
      { source: "192.168.1.2", target: "8.8.8.8", value: 1 }
    );
  }
  
  return { nodes, edges };
};

/**
 * Parse le circuit quantique à partir des données du rapport
 */
export const parseQuantumCircuitData = (content?: ReportContent | null) => {
  if (!content) return null;
  
  const quantumDetails = content.quantum_details || { qubits: 4, shots: 1024, feature_map: "zz", ansatz: "real" };
  
  // Pour l'instant, nous ne pouvons pas reconstruire le circuit exact à partir des métadonnées
  // Donc nous allons créer un circuit représentatif basé sur la feature map et l'ansatz
  
  const { qubits, feature_map, ansatz } = quantumDetails;
  
  // Créer un circuit basique qui ressemble à celui qui serait utilisé pour la détection d'anomalies
  const circuit = {
    qubits: qubits || 4,
    gates: [] as any[]
  };
  
  // Ajouter des portes Hadamard au début (typiques pour les feature maps)
  for (let i = 0; i < circuit.qubits; i++) {
    circuit.gates.push({ type: "h", targets: [i] });
  }
  
  // Ajouter des portes CNOT en fonction de la feature map
  if (feature_map === "zz") {
    // ZZFeatureMap utilise typiquement des CNOTs entre qubits adjacents
    for (let i = 0; i < circuit.qubits - 1; i++) {
      circuit.gates.push({ type: "cx", targets: [i + 1], controls: [i] });
    }
  }
  
  // Ajouter des rotations en fonction de l'ansatz
  if (ansatz === "real") {
    // RealAmplitudes utilise typiquement des rotations Ry
    for (let i = 0; i < circuit.qubits; i++) {
      circuit.gates.push({ type: "ry", targets: [i], params: [Math.PI / 4] });
    }
  }
  
  // Ajouter quelques CNOTs supplémentaires pour l'entanglement dans l'ansatz
  for (let i = 0; i < circuit.qubits - 1; i += 2) {
    circuit.gates.push({ type: "cx", targets: [i + 1], controls: [i] });
  }
  
  // Terminer avec une mesure
  circuit.gates.push({ type: "measure", qubits: Array.from({ length: circuit.qubits }, (_, i) => i) });
  
  return circuit;
};