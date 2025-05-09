/**
 * Module de simulation pour le service quantique 
 */
import type { Request, Response } from "express";

// Statut du service QML
const qmlStatus = {
  status: "running",
  qubits: 4,
  feature_map: "zz",
  ansatz: "real",
  shots: 1024,
  model_type: "qsvc",
  ibm_connected: false
};

// Génère un nom de fichier unique (non utilisé dans cette simulation)
function generateFilename(prefix: string) {
  const timestamp = new Date().toISOString().replace(/:/g, "-").replace(/\./g, "-");
  return `${prefix}_${timestamp}.png`;
}

// Simuler des données réseau
function generateSyntheticNetworkData(numConnections = 50) {
  const ipPrefixes = ["192.168.1.", "10.0.0.", "172.16.0.", "8.8.8."];
  const protocols = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS"];
  const ports = [80, 443, 22, 25, 53, 8080, 3389];
  
  const data = [];
  for (let i = 0; i < numConnections; i++) {
    const srcPrefix = ipPrefixes[Math.floor(Math.random() * ipPrefixes.length)];
    const dstPrefix = ipPrefixes[Math.floor(Math.random() * ipPrefixes.length)];
    const srcIp = `${srcPrefix}${Math.floor(Math.random() * 254) + 1}`;
    const dstIp = `${dstPrefix}${Math.floor(Math.random() * 254) + 1}`;
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    const port = ports[Math.floor(Math.random() * ports.length)];
    const packetSize = Math.floor(Math.random() * 1400) + 100;
    const duration = Math.random() * 4.9 + 0.1;
    
    data.push({
      id: i,
      source_ip: srcIp,
      destination_ip: dstIp,
      protocol: protocol,
      destination_port: port,
      packet_size: packetSize,
      duration: duration,
      timestamp: new Date().toISOString()
    });
  }
  
  return data;
}

// Routes API
export const getStatus = (_req: Request, res: Response) => {
  res.json(qmlStatus);
};

export const configureService = (req: Request, res: Response) => {
  const config = req.body;
  
  if (config) {
    // Mettre à jour les paramètres du service
    Object.keys(config).forEach(key => {
      if (key in qmlStatus) {
        qmlStatus[key] = config[key];
      }
    });
  }

  res.json({
    status: "success",
    message: "Configuration mise à jour avec succès",
    config: qmlStatus
  });
};

export const ibmConnect = (_req: Request, res: Response) => {
  qmlStatus.ibm_connected = true;
  
  res.json({
    status: "success",
    message: "Connecté au service IBM Quantum avec succès",
    backends: ["ibmq_qasm_simulator", "ibmq_santiago", "ibmq_manila"]
  });
};

export const circuitDemo = (_req: Request, res: Response) => {
  // Dans un vrai service, générer des images réelles
  // Ici, nous simulons simplement l'API
  const circuitImage = "https://i.ibb.co/tQL2RHM/quantum-circuit.png";
  const histogramImage = "https://i.ibb.co/kGXgH3Q/quantum-histogram.png";
  
  // Simuler des résultats de circuit
  const states = ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111', 
               '1000', '1001', '1010', '1011', '1100', '1101', '1110', '1111'];
  
  const counts = {};
  let total = 0;
  
  // Distribution biaisée pour simuler une interférence quantique
  states.forEach(state => {
    if (state === '0000' || state === '1111') {
      counts[state] = Math.floor(Math.random() * 200) + 200; // Entre 200 et 400
    } else {
      counts[state] = Math.floor(Math.random() * 30); // Entre 0 et 30
    }
    total += counts[state];
  });
  
  // Ajuster pour atteindre le nombre de shots total
  const shortfall = qmlStatus.shots - total;
  if (shortfall > 0) {
    counts['0000'] += shortfall;
  }
  
  // Filtrer les états avec des comptages de zéro
  const countsList = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([state, count]) => ({ state, count }));
  
  return res.json({
    status: "success",
    circuit_image_url: circuitImage,
    histogram_image_url: histogramImage,
    counts: countsList,
    num_qubits: qmlStatus.qubits,
    shots: qmlStatus.shots
  });
};

export const networkGraph = (req: Request, res: Response) => {
  // Utiliser des données fournies ou générer des données synthétiques
  let data = req.body && req.body.connections 
    ? req.body.connections 
    : generateSyntheticNetworkData(30);
  
  // Simuler un graphe réseau
  const graphImage = "https://i.ibb.co/Z8FpCLc/network-graph.png";
  
  // Extraire des nœuds et des arêtes
  const nodesMap = new Map();
  const edges = [];
  
  data.forEach((conn) => {
    const src = conn.source_ip || `src_${Math.floor(Math.random() * 10) + 1}`;
    const dst = conn.destination_ip || `dst_${Math.floor(Math.random() * 10) + 1}`;
    
    if (!nodesMap.has(src)) {
      nodesMap.set(src, { id: src, type: 'ip' });
    }
    
    if (!nodesMap.has(dst)) {
      nodesMap.set(dst, { id: dst, type: 'ip' });
    }
    
    edges.push({
      source: src,
      target: dst,
      protocol: conn.protocol || 'TCP',
      port: conn.destination_port || 80
    });
  });
  
  const nodes = Array.from(nodesMap.values());
  
  // Simuler des métriques de graphe
  const metrics = {
    nodes: nodes.length,
    edges: edges.length,
    density: edges.length / (nodes.length * (nodes.length - 1) / 2) || 0,
    avg_degree: 2 * edges.length / (nodes.length || 1),
    connected_components: 1,
    avg_clustering: 0.32
  };
  
  return res.json({
    status: "success",
    graph_image_url: graphImage,
    metrics: metrics,
    nodes: nodes.map(n => n.id),
    edges: edges
  });
};

export const detectAnomalies = (req: Request, res: Response) => {
  // Utiliser des données fournies ou générer des données synthétiques
  const networkData = req.body && req.body.connections 
    ? req.body.connections 
    : generateSyntheticNetworkData(50);
  
  // Simuler des images pour la visualisation
  const graphImage = "https://i.ibb.co/Z8FpCLc/network-graph.png";
  const circuitImage = "https://i.ibb.co/tQL2RHM/quantum-circuit.png";
  const histogramImage = "https://i.ibb.co/kGXgH3Q/quantum-histogram.png";
  
  // Extraire des nœuds et des arêtes
  const nodesMap = new Map();
  const edges = [];
  
  networkData.forEach((conn) => {
    const src = conn.source_ip || `src_${Math.floor(Math.random() * 10) + 1}`;
    const dst = conn.destination_ip || `dst_${Math.floor(Math.random() * 10) + 1}`;
    
    if (!nodesMap.has(src)) {
      nodesMap.set(src, { id: src, type: 'ip' });
    }
    
    if (!nodesMap.has(dst)) {
      nodesMap.set(dst, { id: dst, type: 'ip' });
    }
    
    edges.push({
      source: src,
      target: dst,
      protocol: conn.protocol || 'TCP',
      port: conn.destination_port || 80
    });
  });
  
  const nodes = Array.from(nodesMap.values());
  
  // Simuler des métriques de graphe
  const metrics = {
    nodes: nodes.length,
    edges: edges.length,
    density: edges.length / (nodes.length * (nodes.length - 1) / 2) || 0,
    avg_degree: 2 * edges.length / (nodes.length || 1),
    connected_components: 1,
    avg_clustering: 0.32
  };
  
  // Simuler des anomalies
  const anomalyTypes = ["port_scan", "data_exfiltration", "brute_force"];
  const anomalies = [];
  const anomalyCount = 3;
  
  for (let i = 0; i < anomalyCount; i++) {
    const conn = networkData[Math.floor(Math.random() * networkData.length)];
    anomalies.push({
      connection_id: conn.id || i,
      source_ip: conn.source_ip || `src_${Math.floor(Math.random() * 10) + 1}`,
      destination_ip: conn.destination_ip || `dst_${Math.floor(Math.random() * 10) + 1}`,
      protocol: conn.protocol || 'TCP',
      port: conn.destination_port || 80,
      anomaly_score: (Math.random() * 0.13 + 0.85).toFixed(2),
      anomaly_type: anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)]
    });
  }
  
  return res.json({
    status: "success",
    graph_image_url: graphImage,
    circuit_image_url: circuitImage,
    histogram_image_url: histogramImage,
    metrics: metrics,
    anomalies_detected: anomalies.length,
    anomalies: anomalies,
    execution_time: (Math.random() * 2.5 + 0.5).toFixed(2),
    connections_analyzed: networkData.length,
    quantum_simulation: {
      qubits: qmlStatus.qubits,
      shots: qmlStatus.shots,
      feature_map: qmlStatus.feature_map,
      ansatz: qmlStatus.ansatz
    }
  });
};

export const getDemoData = (req: Request, res: Response) => {
  const count = req.query.count ? parseInt(req.query.count as string) : 50;
  return res.json({
    status: "success",
    data: generateSyntheticNetworkData(count)
  });
};