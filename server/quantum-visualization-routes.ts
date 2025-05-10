import { Router, type Express } from 'express';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';

// URL de base pour l'API du serveur QML (soit réel soit simulé)
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:5001'  // URL du serveur QML réel en production
  : 'http://localhost:5002';  // URL du serveur QML simulé en développement

// Visualisations prédéfinies pour les démonstrations
const DEMO_VISUALIZATIONS = {
  // Images de circuits pour différentes configurations
  circuits: {
    'zz_real': '/quantum_server/static/demo-circuit-zz-real.png',
    'zz_efficient': '/quantum_server/static/demo-circuit-zz-efficient.png',
    'pauli_real': '/quantum_server/static/demo-circuit-pauli-real.png',
    'amplitude_real': '/quantum_server/static/demo-circuit-amplitude-real.png'
  },
  // Images d'histogrammes pour différentes configurations
  histograms: {
    'normal': '/quantum_server/static/demo-histogram-normal.png',
    'anomaly': '/quantum_server/static/demo-histogram-anomaly.png'
  }
};

/**
 * Routes pour la visualisation quantique interactive
 */
export function setupQuantumVisualizationRoutes(app: Express) {
  /**
   * Route pour générer des visualisations de circuits quantiques personnalisés
   */
  app.get('/api/quantum/visualize', async (req, res) => {
    try {
      // Récupération des paramètres de la requête
      const qubits = parseInt(req.query.qubits as string) || 4;
      const featureMap = req.query.feature_map as string || 'zz';
      const ansatz = req.query.ansatz as string || 'real';
      const depth = parseInt(req.query.depth as string) || 2;
      const shots = parseInt(req.query.shots as string) || 1024;
      const anomaly = (req.query.anomaly as string) === 'true';

      // Utilisation de visualisations prédéfinies (mode démonstration) plutôt que d'appeler le serveur Python
      console.log(`Génération d'une visualisation pour: qubits=${qubits}, featureMap=${featureMap}, ansatz=${ansatz}, depth=${depth}, shots=${shots}, anomaly=${anomaly}`);
      
      // Choix du circuit en fonction des paramètres
      let circuitKey = 'zz_real';
      if (featureMap === 'zz') {
        circuitKey = ansatz === 'real' ? 'zz_real' : 'zz_efficient';
      } else if (featureMap === 'pauli') {
        circuitKey = 'pauli_real';
      } else if (featureMap === 'amplitude') {
        circuitKey = 'amplitude_real';
      }
      
      // Choix de l'histogramme en fonction du paramètre d'anomalie
      const histogramKey = anomaly ? 'anomaly' : 'normal';
      
      // Construction de la réponse
      const result = {
        qubits,
        feature_map: featureMap,
        ansatz,
        depth,
        shots,
        anomaly,
        // Utilisation de chemins d'accès statiques
        circuit_image_url: DEMO_VISUALIZATIONS.circuits[circuitKey],
        histogram_image_url: DEMO_VISUALIZATIONS.histograms[histogramKey],
        success: true
      };

      // Renvoi du résultat
      return res.json(result);
    } catch (error) {
      console.error('Erreur lors de la génération des visualisations:', error);
      return res.status(500).json({ 
        error: true, 
        message: 'Erreur lors de la génération des visualisations'
      });
    }
  });
  
  /**
   * Route pour servir les fichiers statiques du serveur quantum
   */
  app.get('/api/quantum/static/:filename', (req, res) => {
    try {
      const filename = req.params.filename;
      // Chemin vers les fichiers statiques depuis la racine du projet
      const filePath = path.join(process.cwd(), 'quantum_server', 'static', filename);
      
      // Vérification de sécurité pour éviter la traversée de répertoire
      if (!filePath.startsWith(path.join(process.cwd(), 'quantum_server', 'static'))) {
        return res.status(403).json({ error: true, message: 'Accès interdit' });
      }
      
      // Vérification de l'existence du fichier
      if (!fs.existsSync(filePath)) {
        console.error(`Fichier non trouvé: ${filePath}`);
        return res.status(404).json({ error: true, message: 'Fichier non trouvé' });
      }
      
      // Envoi du fichier
      res.sendFile(filePath);
    } catch (error) {
      console.error('Erreur lors de l\'accès au fichier statique:', error);
      res.status(500).json({ error: true, message: 'Erreur lors de l\'accès au fichier' });
    }
  });
}