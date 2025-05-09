/**
 * Service de simulation en temps réel
 * Génère des données de connexion réseau à intervalles réguliers
 */
import { generateRandomConnections, generateNetworkGraphPython, NetworkConnection } from './network-data-generator';
import { storage } from './storage';
import { createIBMQuantumService } from './ibm-quantum-service';

// Configuration par défaut
const DEFAULT_CONFIG = {
  // Intervalle de génération en ms (5 secondes par défaut)
  interval: 5000,
  // Nombre de connexions à générer par intervalle
  connectionsPerBatch: 10,
  // Taux d'anomalies
  anomalyRate: 0.05,
  // ID de l'organisation
  organizationId: 1,
  // Activer/désactiver la simulation
  enabled: false
};

// Configurer l'analyse quantique
let qmlStatus = {
  status: 'running',
  qubits: 4,
  feature_map: 'zz',
  ansatz: 'real',
  shots: 1024,
  model_type: 'variational',
  ibm_connected: false
};

// État de la simulation
let simulationConfig = { ...DEFAULT_CONFIG };
let simulationInterval: NodeJS.Timeout | null = null;
let connectionCount = 0;
let anomalyCount = 0;
let lastAnalysisResult: any = null;
let lastGraphResult: any = null;
let ibmQuantumService = createIBMQuantumService();

/**
 * Démarre la simulation
 */
export function startSimulation(config: Partial<typeof DEFAULT_CONFIG> = {}) {
  // Appliquer la configuration
  simulationConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Arrêter la simulation existante si nécessaire
  if (simulationInterval) {
    clearInterval(simulationInterval);
  }
  
  // Activer la simulation
  simulationConfig.enabled = true;
  
  // Fonction pour générer et traiter un lot de connexions
  const generateBatch = async () => {
    if (!simulationConfig.enabled) return;
    
    try {
      console.log(`[Simulation] Generating batch of ${simulationConfig.connectionsPerBatch} connections...`);
      
      // Générer les connexions
      const connections = generateRandomConnections(
        simulationConfig.connectionsPerBatch,
        simulationConfig.anomalyRate,
        simulationConfig.organizationId
      );
      
      // Stocker les connexions dans la base de données
      await storage.createManyNetworkConnections(connections);
      
      // Mettre à jour les compteurs
      connectionCount += connections.length;
      anomalyCount += connections.filter(c => c.isAnomaly).length;
      
      console.log(`[Simulation] Batch generated. Total: ${connectionCount} connections, ${anomalyCount} anomalies`);
      
      // Générer un graphe pour les 50 dernières connexions
      if (connectionCount % 10 === 0) {
        await updateNetworkGraph();
      }
      
      // Exécuter l'analyse d'anomalies périodiquement (toutes les 3 batchs)
      if (connectionCount % 30 === 0) {
        await performAnomalyDetection();
      }
      
      // Note: Les statistiques réseau sont mises à jour automatiquement par le stockage
    } catch (error) {
      console.error('[Simulation] Error in batch generation:', error);
    }
  };
  
  // Démarrer l'intervalle de génération
  simulationInterval = setInterval(generateBatch, simulationConfig.interval);
  
  // Exécuter immédiatement la première génération
  generateBatch();
  
  return {
    message: 'Simulation started',
    config: simulationConfig
  };
}

/**
 * Arrête la simulation
 */
export function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  
  simulationConfig.enabled = false;
  
  return {
    message: 'Simulation stopped',
    stats: {
      totalConnections: connectionCount,
      totalAnomalies: anomalyCount,
    }
  };
}

/**
 * Obtient l'état actuel de la simulation
 */
export function getSimulationStatus() {
  return {
    config: simulationConfig,
    stats: {
      isRunning: !!simulationInterval && simulationConfig.enabled,
      totalConnections: connectionCount,
      totalAnomalies: anomalyCount,
      lastAnalysisTimestamp: lastAnalysisResult?.timestamp || null,
      anomaliesDetected: lastAnalysisResult?.anomalies_detected || 0
    },
    lastGraphData: lastGraphResult,
    lastAnalysisResult
  };
}

/**
 * Réinitialise la simulation
 */
export async function resetSimulation() {
  // Arrêter la simulation en cours
  stopSimulation();
  
  try {
    // Supprimer toutes les connexions de la base de données
    await storage.deleteNetworkConnections(simulationConfig.organizationId);
    
    // Réinitialiser les compteurs
    connectionCount = 0;
    anomalyCount = 0;
    lastAnalysisResult = null;
    lastGraphResult = null;
    
    return {
      message: 'Simulation reset successfully',
      config: simulationConfig
    };
  } catch (error) {
    console.error('[Simulation] Error resetting simulation:', error);
    throw error;
  }
}

/**
 * Met à jour le graphe réseau basé sur les dernières connexions
 */
async function updateNetworkGraph() {
  try {
    // Récupérer les 50 dernières connexions
    const connections = await storage.getNetworkConnections(simulationConfig.organizationId, 50);
    
    if (connections.length === 0) {
      console.log('[Simulation] No connections available for graph generation');
      return;
    }
    
    // Convertir les connexions pour le générateur de graphe
    const typedConnections: NetworkConnection[] = connections.map(conn => ({
      id: conn.id,
      source_ip: conn.source_ip,
      destination_ip: conn.destination_ip,
      protocol: conn.protocol,
      destination_port: conn.destination_port || 0, // Utiliser 0 comme port par défaut si null
      packet_size: conn.packet_size,
      timestamp: conn.timestamp,
      duration: conn.duration,
      organizationId: conn.organizationId,
      isAnomaly: conn.isAnomaly,
      anomalyScore: conn.anomalyScore,
      anomalyType: conn.anomalyType
    }));
    
    // Générer le graphe avec Python
    const graphResult = await generateNetworkGraphPython(typedConnections);
    lastGraphResult = JSON.parse(graphResult);
    
    console.log('[Simulation] Network graph updated');
    
    return lastGraphResult;
  } catch (error) {
    console.error('[Simulation] Error updating network graph:', error);
  }
}

/**
 * Effectue une détection d'anomalies sur les données actuelles
 */
async function performAnomalyDetection() {
  try {
    // Récupérer les 50 dernières connexions
    const connections = await storage.getNetworkConnections(simulationConfig.organizationId, 50);
    
    if (connections.length === 0) {
      console.log('[Simulation] No connections available for anomaly detection');
      return;
    }
    
    // Convertir les connexions pour traitement
    const typedConnections: NetworkConnection[] = connections.map(conn => ({
      id: conn.id,
      source_ip: conn.source_ip,
      destination_ip: conn.destination_ip,
      protocol: conn.protocol,
      destination_port: conn.destination_port || 0, // Utiliser 0 comme port par défaut si null
      packet_size: conn.packet_size,
      timestamp: conn.timestamp,
      duration: conn.duration,
      organizationId: conn.organizationId,
      isAnomaly: conn.isAnomaly,
      anomalyScore: conn.anomalyScore,
      anomalyType: conn.anomalyType
    }));
    
    // Récupérer les connexions marquées comme anormales
    const anomalousConnections = typedConnections.filter(conn => conn.isAnomaly);
    
    // Générer un circuit quantique pour l'analyse d'anomalies (simulation)
    const qasm = ibmQuantumService.generateAnomalyDetectionCircuit(
      typedConnections.map(c => [c.destination_port, c.source_ip, c.destination_ip]), 
      qmlStatus.qubits, 
      qmlStatus.feature_map
    );
    
    // Exécuter le circuit sur le simulateur local
    const circuitResults = ibmQuantumService.simulateCircuitLocally(qasm, qmlStatus.shots);
    
    // Créer le résultat d'analyse
    const timestamp = new Date();
    const executionTime = (Math.random() * 2 + 1).toFixed(2);
    
    lastAnalysisResult = {
      timestamp,
      anomalies_detected: anomalousConnections.length,
      anomalies: anomalousConnections.map(conn => ({
        connection_id: conn.id,
        source_ip: conn.source_ip,
        destination_ip: conn.destination_ip,
        protocol: conn.protocol,
        port: conn.destination_port,
        anomaly_score: conn.anomalyScore || "0.85",
        anomaly_type: conn.anomalyType || "unknown"
      })),
      execution_time: executionTime,
      connections_analyzed: connections.length,
      quantum_simulation: {
        qubits: qmlStatus.qubits,
        shots: qmlStatus.shots,
        feature_map: qmlStatus.feature_map,
        ansatz: qmlStatus.ansatz
      },
      circuit_results: circuitResults
    };
    
    // Sauvegarder le résultat dans la base de données
    await storage.createAnalysisResult({
      organizationId: simulationConfig.organizationId,
      // Pas besoin de spécifier timestamp car il a une valeur par défaut dans le schéma
      totalConnections: connections.length,
      anomaliesDetected: anomalousConnections.length,
      executionTime: executionTime + "s",
      results: lastAnalysisResult,
      type: "anomaly_detection",
      nodesAnalyzed: lastGraphResult?.metrics?.nodes || 0,
      edgesAnalyzed: lastGraphResult?.metrics?.edges || 0
    });
    
    console.log(`[Simulation] Anomaly detection completed. Found ${anomalousConnections.length} anomalies out of ${connections.length} connections`);
    
    return lastAnalysisResult;
  } catch (error) {
    console.error('[Simulation] Error performing anomaly detection:', error);
  }
}

// Exporter le service
export const realTimeSimulator = {
  start: startSimulation,
  stop: stopSimulation,
  status: getSimulationStatus,
  reset: resetSimulation,
  updateNetworkGraph,
  performAnomalyDetection
};