import { useEffect, useState } from "react";
import { Network } from "lucide-react";

interface QuantumGate {
  type: string;
  targets: number[];
  controls?: number[];
  qubits?: number[];
  params?: number[];
  position?: number;
}

interface QuantumCircuitProps {
  circuit?: {
    qubits: number;
    gates: QuantumGate[];
  };
  width?: number;
  height?: number;
}

/**
 * Crée un circuit quantique de démonstration
 */
const createDemoCircuit = () => {
  return {
    qubits: 4,
    gates: [
      { type: "h", targets: [0] },
      { type: "h", targets: [1] },
      { type: "h", targets: [2] },
      { type: "h", targets: [3] },
      { type: "cx", targets: [1], controls: [0] },
      { type: "cx", targets: [3], controls: [2] },
      { type: "ry", targets: [0], params: [Math.PI/4] },
      { type: "ry", targets: [2], params: [Math.PI/4] },
      { type: "cx", targets: [3], controls: [0] },
      { type: "cx", targets: [1], controls: [2] },
      { type: "h", targets: [0] },
      { type: "h", targets: [1] },
      { type: "h", targets: [2] },
      { type: "h", targets: [3] },
      { type: "measure", qubits: [0, 1, 2, 3] }
    ]
  };
};

/**
 * Composant de visualisation simplifiée d'un circuit quantique
 */
export const QuantumCircuitVisualizer = ({ 
  circuit,
  width = 600, 
  height = 300 
}: QuantumCircuitProps) => {
  const circuitData = circuit || createDemoCircuit();
  const { qubits, gates } = circuitData;
  const [svgContent, setSvgContent] = useState<string>("");
  
  useEffect(() => {
    // Paramètres de dessin
    const qubitSpacing = 40;
    const gateWidth = 30;
    const gateSpacing = 40;
    const xOffset = 80;
    const yOffset = 30;
    
    let svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .qubit-line { stroke: #888; stroke-width: 1; }
          .qubit-label { font-family: sans-serif; font-size: 14px; text-anchor: end; }
          .gate-h { fill: #8884d8; stroke: none; }
          .gate-cx { fill: none; stroke: #ef4444; stroke-width: 2; }
          .gate-ry { fill: #10b981; stroke: none; }
          .gate-text { fill: white; font-family: sans-serif; font-size: 12px; text-anchor: middle; dominant-baseline: middle; }
          .measure { fill: #f97316; stroke: none; }
          .measure-text { fill: white; font-family: sans-serif; font-size: 10px; text-anchor: middle; dominant-baseline: middle; }
        </style>
    `;
    
    // Dessiner les lignes des qubits et leurs labels
    for (let i = 0; i < qubits; i++) {
      const y = yOffset + i * qubitSpacing;
      svg += `
        <line x1="${xOffset}" y1="${y}" x2="${width - 20}" y2="${y}" class="qubit-line" />
        <text x="${xOffset - 10}" y="${y + 5}" class="qubit-label">q${i}</text>
      `;
    }
    
    // Positionner et dessiner les portes
    let gatePositions = Array(gates.length).fill(0);
    let maxPositions = Array(qubits).fill(0);
    
    // Calculer les positions horizontales des portes
    gates.forEach((gate, idx) => {
      // Déterminer les qubits impliqués
      const involvedQubits = [...(gate.targets || []), ...(gate.controls || []), ...(gate.qubits || [])];
      
      // Trouver la position horizontale disponible pour cette porte
      const position = Math.max(...involvedQubits.map(q => maxPositions[q])) + 1;
      gatePositions[idx] = position;
      
      // Mettre à jour les positions max pour les qubits impliqués
      involvedQubits.forEach(q => {
        maxPositions[q] = position;
      });
    });
    
    // Dessiner les portes
    gates.forEach((gate, idx) => {
      const position = gatePositions[idx];
      const x = xOffset + position * gateSpacing;
      
      if (gate.type === 'h') {
        const y = yOffset + gate.targets[0] * qubitSpacing;
        svg += `
          <rect x="${x - gateWidth/2}" y="${y - gateWidth/2}" width="${gateWidth}" height="${gateWidth}" rx="5" class="gate-h" />
          <text x="${x}" y="${y}" class="gate-text">H</text>
        `;
      } else if (gate.type === 'cx' && gate.controls && gate.controls.length > 0) {
        const control = gate.controls[0];
        const target = gate.targets[0];
        const controlY = yOffset + control * qubitSpacing;
        const targetY = yOffset + target * qubitSpacing;
        
        // Ligne verticale
        svg += `<line x1="${x}" y1="${controlY}" x2="${x}" y2="${targetY}" class="gate-cx" />`;
        
        // Point de contrôle (petit cercle plein)
        svg += `<circle cx="${x}" cy="${controlY}" r="4" fill="#ef4444" />`;
        
        // Target (cercle avec croix)
        svg += `
          <circle cx="${x}" cy="${targetY}" r="${gateWidth/2 - 2}" class="gate-cx" />
          <line x1="${x - gateWidth/3}" y1="${targetY}" x2="${x + gateWidth/3}" y2="${targetY}" class="gate-cx" />
          <line x1="${x}" y1="${targetY - gateWidth/3}" x2="${x}" y2="${targetY + gateWidth/3}" class="gate-cx" />
        `;
      } else if (gate.type === 'ry') {
        const y = yOffset + gate.targets[0] * qubitSpacing;
        const param = gate.params && gate.params[0] ? (gate.params[0] / Math.PI).toFixed(2) + "π" : "θ";
        svg += `
          <rect x="${x - gateWidth/2}" y="${y - gateWidth/2}" width="${gateWidth}" height="${gateWidth}" rx="5" class="gate-ry" />
          <text x="${x}" y="${y}" class="gate-text">Ry</text>
        `;
      } else if (gate.type === 'measure') {
        const qubitsToMeasure = gate.qubits || [];
        qubitsToMeasure.forEach(q => {
          const y = yOffset + q * qubitSpacing;
          svg += `
            <rect x="${x - gateWidth/2}" y="${y - gateWidth/2}" width="${gateWidth}" height="${gateWidth}" rx="3" class="measure" />
            <text x="${x}" y="${y}" class="measure-text">M</text>
          `;
        });
      }
    });
    
    svg += "</svg>";
    setSvgContent(svg);
  }, [circuit, width, height]);

  if (!circuitData) {
    return (
      <div className="flex items-center justify-center h-64 w-full bg-slate-100 dark:bg-slate-800 rounded-md">
        <Network className="h-16 w-16 text-slate-400" />
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center w-full rounded-md border bg-white dark:bg-slate-900 p-4"
      style={{ height: `${height}px`, minHeight: "250px" }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};