/**
 * Routes pour la visualisation quantique
 * Ces routes permettent de générer des visualisations de circuits quantiques,
 * d'histogrammes et d'autres représentations graphiques liées au QML.
 */

import { Express, Request, Response } from "express";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Dossier local pour stocker les images générées
const IMAGES_DIR = path.join(process.cwd(), "client", "public", "quantum-viz");
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

/**
 * Invoque le script Python pour générer des visualisations
 * @param scriptContent Le contenu du script à exécuter
 * @returns Une promesse avec le résultat de l'exécution
 */
function invokePythonVisualization(scriptContent: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(process.cwd(), `temp_script_${randomUUID()}.py`);
    
    // Écrire le script temporaire
    fs.writeFileSync(tempFile, scriptContent);
    
    // Exécuter le script Python
    const pythonProcess = spawn("python", [tempFile]);
    
    let stdout = "";
    let stderr = "";
    
    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on("close", (code) => {
      // Supprimer le fichier temporaire
      fs.unlinkSync(tempFile);
      
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        console.error(`Erreur lors de l'exécution du script Python: ${stderr}`);
        reject(new Error(`Erreur d'exécution Python (code ${code}): ${stderr}`));
      }
    });
  });
}

/**
 * Génère un script Python pour la visualisation d'un circuit quantique
 */
function generateQuantumCircuitScript(
  numQubits: number = 4,
  featureMap: string = "zz",
  ansatz: string = "real",
  outputFilename: string
): string {
  return `
import sys
sys.path.append('${process.cwd()}/quantum_server')
import quantum_visualization as qv
import os

# Créer le circuit
circuit = qv.create_anomaly_detection_circuit(
    num_qubits=${numQubits},
    feature_map="${featureMap}",
    ansatz="${ansatz}"
)

# Sauvegarder la visualisation
output_path = "${outputFilename}"
qv.visualize_quantum_circuit(circuit, filename=os.path.basename(output_path))
print(f"Circuit généré: {output_path}")
`;
}

/**
 * Génère un script Python pour la visualisation d'un histogramme de résultats
 */
function generateHistogramScript(
  numQubits: number = 4,
  numShots: number = 1024,
  anomaly: boolean = false,
  outputFilename: string
): string {
  return `
import sys
sys.path.append('${process.cwd()}/quantum_server')
import quantum_visualization as qv
import os

# Générer les données de comptage
counts = qv.generate_counts_dict(
    num_qubits=${numQubits},
    num_shots=${numShots},
    anomaly=${anomaly ? "True" : "False"}
)

# Sauvegarder la visualisation
output_path = "${outputFilename}"
qv.visualize_histogram(counts, filename=os.path.basename(output_path), title="Distribution des Mesures Quantiques")
print(f"Histogramme généré: {output_path}")
`;
}

/**
 * Configure les routes de visualisation quantique
 */
export function setupQuantumVisualizationRoutes(app: Express) {
  // Créer un circuit quantique
  app.post("/api/quantum/visualize/circuit", async (req: Request, res: Response) => {
    try {
      const { numQubits = 4, featureMap = "zz", ansatz = "real" } = req.body;
      
      // Valider les paramètres
      if (numQubits < 2 || numQubits > 10) {
        return res.status(400).json({ 
          success: false, 
          message: "Le nombre de qubits doit être entre 2 et 10" 
        });
      }
      
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const filename = `quantum_circuit_${timestamp}.png`;
      const outputPath = path.join(IMAGES_DIR, filename);
      
      // Générer et exécuter le script Python
      const scriptContent = generateQuantumCircuitScript(numQubits, featureMap, ansatz, outputPath);
      
      const { stdout, stderr } = await invokePythonVisualization(scriptContent);
      
      if (stderr && stderr.length > 0) {
        console.warn("Avertissements Python:", stderr);
      }
      
      // Vérifier si le fichier a été créé
      if (!fs.existsSync(outputPath)) {
        return res.status(500).json({
          success: false,
          message: "Échec de la génération du circuit quantique"
        });
      }
      
      // Renvoyer le chemin relatif pour accès via le navigateur
      const relativePath = `/quantum-viz/${filename}`;
      
      res.status(200).json({
        success: true,
        message: "Circuit quantique généré avec succès",
        circuitImageUrl: relativePath,
        details: {
          numQubits,
          featureMap,
          ansatz
        }
      });
    } catch (error) {
      console.error("Erreur lors de la génération du circuit quantique:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la génération du circuit quantique",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Générer un histogramme
  app.post("/api/quantum/visualize/histogram", async (req: Request, res: Response) => {
    try {
      const { numQubits = 4, numShots = 1024, anomaly = false } = req.body;
      
      // Valider les paramètres
      if (numQubits < 2 || numQubits > 10) {
        return res.status(400).json({ 
          success: false, 
          message: "Le nombre de qubits doit être entre 2 et 10" 
        });
      }
      
      if (numShots < 100 || numShots > 10000) {
        return res.status(400).json({ 
          success: false, 
          message: "Le nombre de shots doit être entre 100 et 10000" 
        });
      }
      
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const filename = `quantum_histogram_${timestamp}.png`;
      const outputPath = path.join(IMAGES_DIR, filename);
      
      // Générer et exécuter le script Python
      const scriptContent = generateHistogramScript(numQubits, numShots, anomaly, outputPath);
      
      const { stdout, stderr } = await invokePythonVisualization(scriptContent);
      
      if (stderr && stderr.length > 0) {
        console.warn("Avertissements Python:", stderr);
      }
      
      // Vérifier si le fichier a été créé
      if (!fs.existsSync(outputPath)) {
        return res.status(500).json({
          success: false,
          message: "Échec de la génération de l'histogramme"
        });
      }
      
      // Renvoyer le chemin relatif pour accès via le navigateur
      const relativePath = `/quantum-viz/${filename}`;
      
      res.status(200).json({
        success: true,
        message: "Histogramme généré avec succès",
        histogramImageUrl: relativePath,
        details: {
          numQubits,
          numShots,
          anomaly
        }
      });
    } catch (error) {
      console.error("Erreur lors de la génération de l'histogramme:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la génération de l'histogramme",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Générer les deux visualisations (circuit et histogramme) en une seule requête
  app.post("/api/quantum/visualize/complete", async (req: Request, res: Response) => {
    try {
      const { 
        numQubits = 4, 
        featureMap = "zz", 
        ansatz = "real", 
        numShots = 1024, 
        anomaly = false 
      } = req.body;
      
      // Valider les paramètres
      if (numQubits < 2 || numQubits > 10) {
        return res.status(400).json({ 
          success: false, 
          message: "Le nombre de qubits doit être entre 2 et 10" 
        });
      }
      
      // Générer des noms de fichiers uniques
      const timestamp = Date.now();
      const circuitFilename = `quantum_circuit_${timestamp}.png`;
      const histogramFilename = `quantum_histogram_${timestamp}.png`;
      
      const circuitOutputPath = path.join(IMAGES_DIR, circuitFilename);
      const histogramOutputPath = path.join(IMAGES_DIR, histogramFilename);
      
      // Générer et exécuter les scripts Python
      const circuitScript = generateQuantumCircuitScript(numQubits, featureMap, ansatz, circuitOutputPath);
      const histogramScript = generateHistogramScript(numQubits, numShots, anomaly, histogramOutputPath);
      
      // Exécuter les scripts en parallèle
      const [circuitResult, histogramResult] = await Promise.all([
        invokePythonVisualization(circuitScript),
        invokePythonVisualization(histogramScript)
      ]);
      
      // Vérifier si les fichiers ont été créés
      const circuitExists = fs.existsSync(circuitOutputPath);
      const histogramExists = fs.existsSync(histogramOutputPath);
      
      if (!circuitExists || !histogramExists) {
        return res.status(500).json({
          success: false,
          message: "Échec de la génération des visualisations"
        });
      }
      
      // Renvoyer les chemins relatifs pour accès via le navigateur
      const circuitRelativePath = `/quantum-viz/${circuitFilename}`;
      const histogramRelativePath = `/quantum-viz/${histogramFilename}`;
      
      res.status(200).json({
        success: true,
        message: "Visualisations générées avec succès",
        circuitImageUrl: circuitRelativePath,
        histogramImageUrl: histogramRelativePath,
        details: {
          numQubits,
          featureMap,
          ansatz,
          numShots,
          anomaly
        }
      });
    } catch (error) {
      console.error("Erreur lors de la génération des visualisations:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la génération des visualisations",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
}