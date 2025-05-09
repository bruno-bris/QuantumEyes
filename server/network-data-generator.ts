/**
 * Service de génération de données réseau simulées
 * Permet de générer des données réseau aléatoires pour la simulation
 */
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';

// Type pour les connexions générées - compatible avec le schéma de base de données
export type NetworkConnection = {
  id?: number;
  source_ip: string;
  destination_ip: string;
  protocol: string;
  destination_port: number;
  packet_size?: number;
  timestamp?: Date;
  duration?: string;
  organizationId?: number;
  isAnomaly?: boolean;
  anomalyScore?: string;
  anomalyType?: string;
};

// Protocoles possibles
const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'SMTP', 'FTP', 'SSH', 'ICMP'];

// Plages d'adresses IP pour la simulation
const IP_RANGES = {
  internal: ['10.0.0', '192.168.1', '172.16.0', '172.17.0', '192.168.0'],
  external: ['8.8.8', '1.1.1', '104.18.2', '172.217.169', '52.84.13']
};

// Ports courants pour la simulation
const COMMON_PORTS = [
  20, 21,      // FTP
  22,          // SSH
  23,          // Telnet
  25,          // SMTP
  53,          // DNS
  80, 443,     // HTTP/HTTPS
  110,         // POP3
  143,         // IMAP
  465,         // SMTPS
  993,         // IMAPS
  995,         // POP3S
  3306,        // MySQL
  3389,        // RDP
  5432,        // PostgreSQL
  8080, 8443   // HTTP Alt
];

/**
 * Génère une adresse IP aléatoire dans une plage spécifiée
 */
function generateRandomIP(isInternal = true): string {
  const ranges = isInternal ? IP_RANGES.internal : IP_RANGES.external;
  const range = ranges[Math.floor(Math.random() * ranges.length)];
  const lastOctet = Math.floor(Math.random() * 255) + 1;
  return `${range}.${lastOctet}`;
}

/**
 * Génère une connexion réseau aléatoire
 */
export function generateRandomConnection(options: { 
  isAnomalous?: boolean,
  organizationId?: number 
} = {}): NetworkConnection {
  const { isAnomalous = Math.random() < 0.05, organizationId = 1 } = options;
  
  // Déterminer le type d'anomalie si c'est une connexion anormale
  let anomalyType: string | undefined;
  let port: number = COMMON_PORTS[Math.floor(Math.random() * COMMON_PORTS.length)];
  let protocol: string = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
  let sourceIP = generateRandomIP(true);
  let destIP = generateRandomIP(Math.random() < 0.7); // 70% interne, 30% externe
  
  if (isAnomalous) {
    // Déterminer aléatoirement le type d'anomalie
    const anomalyTypes = ['port_scan', 'data_exfiltration', 'brute_force', 'ddos', 'backdoor'];
    anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
    
    // Ajuster les paramètres selon le type d'anomalie
    switch (anomalyType) {
      case 'port_scan':
        // Port scan - connexions vers plusieurs ports
        port = Math.floor(Math.random() * 65535) + 1;
        break;
      case 'data_exfiltration':
        // Exfiltration de données - souvent vers des adresses externes
        destIP = generateRandomIP(false); // Toujours externe
        port = [53, 80, 443][Math.floor(Math.random() * 3)]; // DNS, HTTP, HTTPS
        break;
      case 'brute_force':
        // Attaque par force brute - souvent sur SSH, FTP, RDP
        port = [22, 21, 3389][Math.floor(Math.random() * 3)];
        protocol = ['SSH', 'FTP', 'RDP'][Math.floor(Math.random() * 3)];
        break;
      case 'ddos':
        // DDoS - nombreuses connexions vers la même cible
        port = [80, 443][Math.floor(Math.random() * 2)];
        sourceIP = generateRandomIP(false); // Source externe
        break;
      case 'backdoor':
        // Backdoor - ports inhabituels
        port = 4444 + Math.floor(Math.random() * 1000);
        break;
    }
  }
  
  // Autres paramètres aléatoires
  const packetSize = Math.floor(Math.random() * 1460) + 40; // 40-1500 bytes
  const duration = Math.random() * 5; // 0-5 secondes
  const bytesSent = Math.floor(Math.random() * 100000) + 100;
  const bytesReceived = Math.floor(Math.random() * 100000) + 100;
  const flags = 'ACK';
  
  // Déterminer un score d'anomalie si c'est une connexion anormale
  const anomalyScore = isAnomalous ? (Math.random() * 0.25 + 0.75).toFixed(2) : undefined;
  
  return {
    source_ip: sourceIP,
    destination_ip: destIP,
    protocol,
    destination_port: port, // Renommé pour correspondre au schéma
    packet_size: packetSize,
    timestamp: new Date(),
    duration: duration.toString(), // Convertir en string pour correspondre au schéma
    organizationId, // Renommé pour correspondre au schéma
    isAnomaly: isAnomalous, // Renommé pour correspondre au schéma
    anomalyScore: anomalyScore, // Déjà une string
    anomalyType: anomalyType // Renommé pour correspondre au schéma
  };
}

/**
 * Génère un lot de connexions réseau aléatoires
 */
export function generateRandomConnections(
  count: number = 10, 
  anomalyRate: number = 0.05,
  organizationId: number = 1
): NetworkConnection[] {
  const connections: NetworkConnection[] = [];
  
  const anomalousCount = Math.round(count * anomalyRate);
  
  // Générer d'abord les connexions anormales
  for (let i = 0; i < anomalousCount; i++) {
    connections.push(generateRandomConnection({ 
      isAnomalous: true,
      organizationId
    }));
  }
  
  // Puis les connexions normales
  for (let i = 0; i < count - anomalousCount; i++) {
    connections.push(generateRandomConnection({ 
      isAnomalous: false,
      organizationId
    }));
  }
  
  return connections;
}

/**
 * Génère des données pour l'entraînement des modèles
 */
export function generateTrainingDataset(
  normalCount: number = 1000,
  anomalyCount: number = 50,
  organizationId: number = 1
): { connections: NetworkConnection[], labels: boolean[] } {
  const connections: NetworkConnection[] = [];
  const labels: boolean[] = [];
  
  // Connexions normales
  for (let i = 0; i < normalCount; i++) {
    connections.push(generateRandomConnection({ 
      isAnomalous: false,
      organizationId
    }));
    labels.push(false);
  }
  
  // Connexions anormales
  for (let i = 0; i < anomalyCount; i++) {
    connections.push(generateRandomConnection({ 
      isAnomalous: true,
      organizationId
    }));
    labels.push(true);
  }
  
  return { connections, labels };
}

/**
 * Génère un exemple de graphe de connexions réseau
 */
export function generateNetworkGraph(connections: NetworkConnection[]): {
  nodes: any[];
  edges: any[];
} {
  // Extraire les nœuds uniques
  const nodeSet = new Set<string>();
  connections.forEach(conn => {
    nodeSet.add(conn.source_ip);
    nodeSet.add(conn.destination_ip);
  });
  
  // Créer les objets nœuds
  const nodes = Array.from(nodeSet).map(ip => ({
    id: ip,
    label: ip,
    type: ip.startsWith('192.168.') || ip.startsWith('10.') ? 'internal' : 'external'
  }));
  
  // Créer les connexions
  const edges = connections.map(conn => ({
    id: uuidv4(),
    source: conn.source_ip,
    target: conn.destination_ip,
    protocol: conn.protocol,
    port: conn.destination_port,
    anomalous: conn.isAnomaly
  }));
  
  return { nodes, edges };
}

/**
 * Génère un graphe réseau avec Python pour une meilleure visualisation
 */
export async function generateNetworkGraphPython(connections: NetworkConnection[]): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Préparer les données pour Python
      const data = JSON.stringify(connections);
      
      const pythonScript = `
import sys
import json
import networkx as nx
import matplotlib.pyplot as plt
import matplotlib
import io
import base64
from collections import defaultdict

# Utiliser un backend non-interactif
matplotlib.use('Agg')

# Lire les données depuis stdin
data = json.loads(sys.stdin.read())

# Créer un graphe dirigé
G = nx.DiGraph()

# Ajouter les nœuds et les arêtes
for conn in data:
    source = conn['source_ip']
    target = conn['destination_ip']
    
    # Vérifier si les nœuds existent déjà et ajouter si nécessaire
    if not G.has_node(source):
        G.add_node(source)
    if not G.has_node(target):
        G.add_node(target)
    
    # Paramètres de la connexion
    is_anomalous = conn.get('isAnomaly', False)
    protocol = conn.get('protocol', 'TCP')
    
    # Ajouter l'arête avec des attributs
    G.add_edge(source, target, protocol=protocol, anomalous=is_anomalous)

# Préparer les couleurs des nœuds
node_colors = []
for node in G.nodes():
    if node.startswith('192.168.') or node.startswith('10.'):
        node_colors.append('skyblue')
    else:
        node_colors.append('lightcoral')

# Préparer les couleurs des arêtes
edge_colors = []
for _, _, data in G.edges(data=True):
    if data.get('anomalous', False):
        edge_colors.append('red')
    else:
        edge_colors.append('gray')

# Préparer le style de ligne des arêtes
edge_styles = []
for _, _, data in G.edges(data=True):
    if data.get('protocol') == 'UDP':
        edge_styles.append('dotted')
    else:
        edge_styles.append('solid')

# Calculer la disposition des nœuds
pos = nx.spring_layout(G, seed=42)

# Créer la figure et tracer le graphe
plt.figure(figsize=(10, 8))
nx.draw_networkx_nodes(G, pos, node_color=node_colors, node_size=300, alpha=0.8)
nx.draw_networkx_edges(G, pos, edge_color=edge_colors, width=1.5, arrowstyle='->', arrowsize=15, alpha=0.7)
nx.draw_networkx_labels(G, pos, font_size=8, font_family='sans-serif')

# Analyser le graphe et ajouter des statistiques
num_nodes = G.number_of_nodes()
num_edges = G.number_of_edges()
avg_degree = sum(dict(G.degree()).values()) / num_nodes if num_nodes > 0 else 0
density = nx.density(G)
connected_components = 1 if nx.is_weakly_connected(G) else nx.number_weakly_connected_components(G)

try:
    avg_clustering = nx.average_clustering(G)
except:
    avg_clustering = 0

# Annoter avec des statistiques
plt.title(f"Network Connections Analysis\\n{num_nodes} nodes, {num_edges} edges")
plt.figtext(0.02, 0.02, f"Density: {density:.3f}\\nAvg. Degree: {avg_degree:.2f}\\nComponents: {connected_components}", fontsize=9)

# Rétréindre les marges pour maximiser l'espace
plt.tight_layout()

# Sauvegarder l'image en mémoire
buffer = io.BytesIO()
plt.savefig(buffer, format='png', dpi=100)
plt.close()

# Convertir en base64
buffer.seek(0)
image_base64 = base64.b64encode(buffer.read()).decode('utf-8')

# Retourner les données d'image et les statistiques
result = {
    'image': image_base64,
    'metrics': {
        'nodes': num_nodes,
        'edges': num_edges,
        'density': density,
        'avg_degree': avg_degree,
        'connected_components': connected_components,
        'avg_clustering': avg_clustering
    }
}

print(json.dumps(result))
      `;
      
      // Exécuter Python pour générer le graphe
      const pythonProcess = spawn('python3', ['-c', pythonScript]);
      
      let result = '';
      let errorData = '';
      
      // Fournir les données à Python via stdin
      pythonProcess.stdin.write(data);
      pythonProcess.stdin.end();
      
      // Collecter la sortie de Python
      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error(`Python stderr: ${data.toString()}`);
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}`);
          console.error(`Error: ${errorData}`);
          
          // Retourner un format de repli en cas d'erreur
          resolve(JSON.stringify({
            image: '',
            metrics: {
              nodes: connections.length * 2,
              edges: connections.length,
              density: 0.1,
              avg_degree: 2,
              connected_components: 1,
              avg_clustering: 0.3
            }
          }));
        } else {
          try {
            const parsedResult = JSON.parse(result);
            resolve(JSON.stringify(parsedResult));
          } catch (error) {
            console.error('Error parsing Python output:', error);
            console.error('Raw output:', result);
            resolve(JSON.stringify({
              image: '',
              metrics: {
                nodes: connections.length * 2,
                edges: connections.length,
                density: 0.1,
                avg_degree: 2,
                connected_components: 1,
                avg_clustering: 0.3
              }
            }));
          }
        }
      });
    } catch (error) {
      console.error('Error generating network graph:', error);
      resolve(JSON.stringify({
        image: '',
        metrics: {
          nodes: connections.length * 2,
          edges: connections.length,
          density: 0.1,
          avg_degree: 2,
          connected_components: 1,
          avg_clustering: 0.3
        }
      }));
    }
  });
}