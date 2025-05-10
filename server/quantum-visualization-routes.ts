import { Router, type Express } from 'express';
import fetch from 'node-fetch';

// URL de base pour l'API du serveur QML (soit réel soit simulé)
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:5001'  // URL du serveur QML réel en production
  : 'http://localhost:5002';  // URL du serveur QML simulé en développement

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

      // Construction de l'URL pour l'API QML
      const apiUrl = `${API_BASE_URL}/visualize?qubits=${qubits}&feature_map=${featureMap}&ansatz=${ansatz}&depth=${depth}&shots=${shots}&anomaly=${anomaly}`;
      
      // Appel à l'API QML
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        console.error(`Erreur API QML: ${response.status} ${response.statusText}`);
        return res.status(500).json({ 
          error: true, 
          message: `Erreur lors de la génération des visualisations: ${response.statusText}`
        });
      }

      // Réponse de l'API QML
      const data = await response.json();
      
      // En cas d'échec mais avec une réponse 200 (cas particulier)
      if (data.error) {
        console.error(`Erreur QML: ${data.message}`);
        return res.status(500).json({ 
          error: true, 
          message: data.message || 'Erreur lors de la génération des visualisations'
        });
      }

      // Ajout des URLs complètes pour les images
      const result = {
        ...data,
        circuit_image_url: data.circuit_image_url ? `/api/quantum/static/${data.circuit_image_url.split('/').pop()}` : null,
        histogram_image_url: data.histogram_image_url ? `/api/quantum/static/${data.histogram_image_url.split('/').pop()}` : null
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
}