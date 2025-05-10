import { useEffect, useState } from "react";
import { Network } from "lucide-react";

interface Node {
  id: string;
  color?: string;
  size?: number;
  label?: string;
}

interface Edge {
  source: string;
  target: string;
  value?: number;
  id?: string;
  color?: string;
}

interface NetworkGraphProps {
  nodes?: Node[];
  edges?: Edge[];
  width?: number;
  height?: number;
  anomalies?: {source_ip: string, destination_ip: string}[];
}

/**
 * Crée un dataset de démonstration pour le graphe réseau
 */
const createDemoNetworkData = () => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Ajouter des nœuds (hôtes du réseau)
  const internalHosts = ["192.168.1.1", "192.168.1.2", "192.168.1.10", "192.168.1.20", "192.168.1.50"];
  const externalHosts = ["8.8.8.8", "93.184.216.34", "172.217.20.142"];
  
  // Ajouter les hôtes internes (en bleu)
  internalHosts.forEach(host => {
    nodes.push({
      id: host,
      color: "#3b82f6",
      size: 20,
      label: host
    });
  });
  
  // Ajouter les hôtes externes (en gris)
  externalHosts.forEach(host => {
    nodes.push({
      id: host,
      color: "#9ca3af",
      size: 15,
      label: host
    });
  });
  
  // Ajouter des connexions
  edges.push(
    { source: "192.168.1.1", target: "192.168.1.2", value: 2 },
    { source: "192.168.1.1", target: "192.168.1.10", value: 3 },
    { source: "192.168.1.2", target: "192.168.1.20", value: 1 },
    { source: "192.168.1.10", target: "8.8.8.8", value: 5 },
    { source: "192.168.1.20", target: "93.184.216.34", value: 2 },
    { source: "192.168.1.50", target: "172.217.20.142", value: 4, color: "#ef4444" }, // Connexion anormale
    { source: "192.168.1.50", target: "8.8.8.8", value: 3, color: "#ef4444" } // Connexion anormale
  );
  
  return { nodes, edges };
};

/**
 * Composant de visualisation du graphe réseau
 */
export const NetworkGraph = ({ 
  nodes: propNodes, 
  edges: propEdges, 
  width = 400,
  height = 300,
  anomalies = []
}: NetworkGraphProps) => {
  const [d3, setD3] = useState<any>(null);
  const [forceGraph, setForceGraph] = useState<any>(null);
  
  // Utiliser les données de démo si aucune donnée n'est fournie
  const { nodes, edges } = propNodes && propEdges && propNodes.length > 0 && propEdges.length > 0
    ? { nodes: propNodes, edges: propEdges }
    : createDemoNetworkData();

  // Marquer les arêtes avec des anomalies
  const processedEdges = edges.map(edge => {
    // Vérifier si cette connexion correspond à une anomalie
    const isAnomaly = anomalies.some(anomaly => 
      (anomaly.source_ip === edge.source && anomaly.destination_ip === edge.target) ||
      (anomaly.source_ip === edge.target && anomaly.destination_ip === edge.source)
    );
    
    return {
      ...edge,
      color: isAnomaly || edge.color === "#ef4444" ? "#ef4444" : "#9ca3af"
    };
  });

  useEffect(() => {
    // Charger dynamiquement D3.js et ForceGraph car ils sont de grosses dépendances
    const loadD3AndForceGraph = async () => {
      try {
        const d3Module = await import('d3');
        setD3(d3Module);
      } catch (error) {
        console.error("Erreur lors du chargement de D3:", error);
      }
    };
    
    loadD3AndForceGraph();
  }, []);

  useEffect(() => {
    if (!d3 || !nodes || !processedEdges) return;

    try {
      // Nettoyer le conteneur avant de dessiner
      d3.select("#network-graph").selectAll("*").remove();
      
      // Créer le SVG
      const svg = d3.select("#network-graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
      
      // Créer une simulation de force
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(processedEdges).id((d: any) => d.id))
        .force("charge", d3.forceManyBody().strength(-150))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(30));
      
      // Ajouter les liens
      const link = svg.append("g")
        .selectAll("line")
        .data(processedEdges)
        .join("line")
        .attr("stroke", d => d.color || "#9ca3af")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", d => Math.sqrt(d.value || 1));
      
      // Ajouter les nœuds
      const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => d.size || 10)
        .attr("fill", d => d.color || "#3b82f6")
        .call(drag(simulation) as any);
      
      // Ajouter des labels
      const label = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("font-size", 10)
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(d => d.label || d.id);
      
      // Mettre à jour les positions à chaque tick
      simulation.on("tick", () => {
        link
          .attr("x1", d => (d.source as any).x)
          .attr("y1", d => (d.source as any).y)
          .attr("x2", d => (d.target as any).x)
          .attr("y2", d => (d.target as any).y);
        
        node
          .attr("cx", d => Math.max(10, Math.min(width - 10, (d as any).x)))
          .attr("cy", d => Math.max(10, Math.min(height - 10, (d as any).y)));
        
        label
          .attr("x", d => (d as any).x)
          .attr("y", d => (d as any).y);
      });
      
      // Fonction pour le drag
      function drag(simulation: any) {
        function dragstarted(event: any, d: any) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }
        
        function dragged(event: any, d: any) {
          d.fx = event.x;
          d.fy = event.y;
        }
        
        function dragended(event: any, d: any) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }
        
        return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      }
      
      setForceGraph(simulation);
    } catch (error) {
      console.error("Erreur lors de la création du graphe réseau:", error);
    }
    
    // Nettoyer lors du démontage
    return () => {
      if (forceGraph) {
        forceGraph.stop();
      }
    };
  }, [d3, nodes, processedEdges, width, height]);

  if (!nodes || !edges || nodes.length === 0 || edges.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 w-full bg-slate-100 dark:bg-slate-800 rounded-md">
        <Network className="h-16 w-16 text-slate-400" />
      </div>
    );
  }

  return (
    <div 
      id="network-graph" 
      className="flex items-center justify-center w-full rounded-md border bg-white dark:bg-slate-900"
      style={{ height: `${height}px`, minHeight: "250px" }}
    >
      {!d3 && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      )}
    </div>
  );
};