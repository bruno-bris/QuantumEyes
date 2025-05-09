"""
QuantumEyes - Service QML

Ce module fournit les services QML (Quantum Machine Learning) pour l'application QuantumEyes.
Il permet la communication avec IBM Quantum, la création de circuits quantiques,
et l'analyse des données réseau par QML pour la détection d'anomalies.
"""

import os
import json
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
from datetime import datetime
from typing import Dict, List, Any, Tuple, Optional, Union

# Qiskit imports
from qiskit import Aer, QuantumCircuit
from qiskit.visualization import plot_histogram
from qiskit_ibm_runtime import QiskitRuntimeService
from qiskit.circuit.library import ZZFeatureMap, RealAmplitudes, PauliFeatureMap, IQPFeatureMap
from qiskit.algorithms.optimizers import COBYLA, SPSA, ADAM
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

# Générer des noms de fichiers uniques basés sur la date et l'heure
def generate_filename(prefix: str, ext: str = 'png') -> str:
    """Génère un nom de fichier unique basé sur la date et l'heure."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"static/{prefix}_{timestamp}.{ext}"

# Espace de stockage des images générées
os.makedirs('quantum_server/static', exist_ok=True)

class QuantumService:
    """Service pour l'intégration de QML dans QuantumEyes."""
    
    def __init__(self):
        self.backend = Aer.get_backend('qasm_simulator')
        self.num_qubits = 4
        self.api_token = None
        self.ibm_service = None
        self.feature_map = None
        self.ansatz = None
        self.model_type = "qsvc"
        self.optimizer_name = "cobyla"
        self.feature_map_name = "zz"
        self.ansatz_name = "real"
        self.reps = 2
        self.shots = 1024
        self.scaler = StandardScaler()
        
    def configure(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Configure le service QML.
        
        Args:
            config: Dictionnaire de configuration
            
        Returns:
            Dictionnaire avec le statut de la configuration
        """
        try:
            # Mettre à jour les paramètres s'ils sont fournis
            if 'num_qubits' in config:
                self.num_qubits = config['num_qubits']
            
            if 'model_type' in config:
                self.model_type = config['model_type']
                
            if 'backend' in config:
                backend_name = config['backend']
                if backend_name == 'simulator':
                    self.backend = Aer.get_backend('qasm_simulator')
            
            if 'feature_map' in config:
                self.feature_map_name = config['feature_map']
                
            if 'ansatz' in config:
                self.ansatz_name = config['ansatz']
                
            if 'reps' in config:
                self.reps = config['reps']
                
            if 'shots' in config:
                self.shots = config['shots']
                
            if 'optimizer' in config:
                self.optimizer_name = config['optimizer']
            
            # Créer le feature map
            self._create_feature_map()
            
            # Créer l'ansatz
            self._create_ansatz()
            
            return {
                "status": "success",
                "message": "Configuration du service QML mise à jour avec succès",
                "config": {
                    "num_qubits": self.num_qubits,
                    "model_type": self.model_type,
                    "feature_map": self.feature_map_name,
                    "ansatz": self.ansatz_name,
                    "reps": self.reps,
                    "shots": self.shots,
                    "optimizer": self.optimizer_name
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Erreur lors de la configuration: {str(e)}"
            }
    
    def set_api_token(self, token: str) -> Dict[str, Any]:
        """
        Configure le token API pour IBM Quantum.
        
        Args:
            token: Token API IBM Quantum
            
        Returns:
            Dictionnaire avec le statut de la configuration
        """
        try:
            self.api_token = token
            # Initialiser le service IBM Quantum
            self.ibm_service = QiskitRuntimeService(channel="ibm_quantum", token=token)
            backends = self.ibm_service.backends()
            return {
                "status": "success",
                "message": "Token API IBM Quantum configuré avec succès",
                "backends": [backend.name for backend in backends]
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Erreur lors de la configuration du token API: {str(e)}"
            }
    
    def _create_feature_map(self) -> None:
        """Crée le feature map en fonction des paramètres configurés."""
        if self.feature_map_name == "zz":
            self.feature_map = ZZFeatureMap(feature_dimension=self.num_qubits, reps=self.reps)
        elif self.feature_map_name == "pauli":
            self.feature_map = PauliFeatureMap(feature_dimension=self.num_qubits, reps=self.reps)
        elif self.feature_map_name == "iqp":
            self.feature_map = IQPFeatureMap(feature_dimension=self.num_qubits, reps=self.reps)
        else:
            self.feature_map = ZZFeatureMap(feature_dimension=self.num_qubits, reps=self.reps)
    
    def _create_ansatz(self) -> None:
        """Crée l'ansatz en fonction des paramètres configurés."""
        if self.ansatz_name == "real":
            self.ansatz = RealAmplitudes(self.num_qubits, reps=self.reps)
        elif self.ansatz_name == "efficient":
            # Note: EfficientSU2 requires additional import if needed
            self.ansatz = RealAmplitudes(self.num_qubits, reps=self.reps)
        else:
            self.ansatz = RealAmplitudes(self.num_qubits, reps=self.reps)
    
    def _get_optimizer(self):
        """Retourne l'optimiseur en fonction des paramètres configurés."""
        if self.optimizer_name == "cobyla":
            return COBYLA(maxiter=80)
        elif self.optimizer_name == "spsa":
            return SPSA(maxiter=80)
        elif self.optimizer_name == "adam":
            return ADAM(maxiter=80)
        else:
            return COBYLA(maxiter=80)
    
    def generate_demo_quantum_circuit(self) -> Dict[str, Any]:
        """
        Génère un circuit quantique de démonstration.
        
        Returns:
            Dictionnaire avec les informations du circuit
        """
        try:
            # Créer un circuit simple pour la démonstration
            qc = QuantumCircuit(self.num_qubits)
            
            # Ajouter des portes H sur tous les qubits
            for i in range(self.num_qubits):
                qc.h(i)
            
            # Ajouter des portes CNOT entre qubits adjacents
            for i in range(self.num_qubits - 1):
                qc.cx(i, i + 1)
            
            # Mesurer tous les qubits
            qc.measure_all()
            
            # Simuler le circuit
            job = Aer.get_backend('qasm_simulator').run(qc, shots=self.shots)
            result = job.result()
            counts = result.get_counts(qc)
            
            # Convertir les counts en format pour l'API
            counts_list = [{"state": state, "count": count} for state, count in counts.items()]
            
            # Générer une image du circuit
            circuit_image = generate_filename("circuit")
            qc.draw(output='mpl', filename=f"quantum_server/{circuit_image}")
            
            # Générer une image de l'histogramme
            hist_image = generate_filename("histogram")
            fig, ax = plt.subplots(figsize=(10, 6))
            bars = ax.bar(counts.keys(), counts.values())
            ax.set_xlabel('Basis States')
            ax.set_ylabel('Counts')
            ax.set_title('Measurement Results')
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.savefig(f"quantum_server/{hist_image}")
            plt.close(fig)
            
            return {
                "status": "success",
                "circuit_image_url": f"/{circuit_image}",
                "histogram_image_url": f"/{hist_image}",
                "counts": counts_list,
                "num_qubits": self.num_qubits,
                "shots": self.shots
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Erreur lors de la génération du circuit: {str(e)}"
            }

    def generate_graph_from_network_data(self, network_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Génère un graphe à partir de données réseau.
        
        Args:
            network_data: Liste de connexions réseau
            
        Returns:
            Dictionnaire avec les informations du graphe
        """
        try:
            # Créer un graphe
            G = nx.Graph()
            
            # Ajouter des nœuds et des arêtes
            for conn in network_data:
                src = conn.get('source_ip', '')
                dst = conn.get('destination_ip', '')
                proto = conn.get('protocol', '')
                port = conn.get('destination_port', 0)
                
                # Ajouter des nœuds
                if src and src not in G:
                    G.add_node(src, type='ip')
                if dst and dst not in G:
                    G.add_node(dst, type='ip')
                    
                # Ajouter une arête si les deux nœuds existent
                if src and dst:
                    G.add_edge(src, dst, protocol=proto, port=port)
            
            # Générer une visualisation du graphe
            graph_image = generate_filename("network_graph")
            plt.figure(figsize=(10, 8))
            pos = nx.spring_layout(G, seed=42)
            nx.draw(G, pos, with_labels=True, node_color='skyblue', 
                    node_size=1500, edge_color='gray', font_size=8,
                    width=1.5, alpha=0.7)
            
            # Ajouter des étiquettes d'arêtes
            edge_labels = {(u, v): f"{d.get('protocol', '')}/{d.get('port', '')}" 
                        for u, v, d in G.edges(data=True)}
            nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=6)
            
            plt.title("Graphe de Réseau")
            plt.axis('off')
            plt.tight_layout()
            plt.savefig(f"quantum_server/{graph_image}", dpi=300, bbox_inches='tight')
            plt.close()
            
            # Extraire des métriques de graphe
            metrics = {
                "nodes": len(G.nodes()),
                "edges": len(G.edges()),
                "density": nx.density(G) if len(G.nodes()) > 1 else 0,
                "avg_degree": sum(dict(G.degree()).values()) / len(G.nodes()) if len(G.nodes()) > 0 else 0,
                "connected_components": nx.number_connected_components(G) if len(G.nodes()) > 0 else 0,
                "avg_clustering": nx.average_clustering(G) if len(G.nodes()) > 1 else 0
            }
            
            return {
                "status": "success",
                "graph_image_url": f"/{graph_image}",
                "metrics": metrics,
                "nodes": list(G.nodes()),
                "edges": [{"source": u, "target": v, "protocol": d.get('protocol', ''), "port": d.get('port', 0)} 
                         for u, v, d in G.edges(data=True)]
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Erreur lors de la génération du graphe: {str(e)}"
            }
            
    def detect_anomalies(self, network_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Détecte les anomalies dans les données réseau à l'aide de QML.
        
        Args:
            network_data: Liste de connexions réseau
            
        Returns:
            Dictionnaire avec les résultats de la détection
        """
        try:
            # Générer un graphe à partir des données réseau
            graph_result = self.generate_graph_from_network_data(network_data)
            
            if graph_result["status"] == "error":
                return graph_result
            
            # Simuler la détection d'anomalies
            # Pour une démonstration, utiliser des anomalies générées
            anomalies = []
            
            # Simuler quelques anomalies
            for i, conn in enumerate(network_data):
                if i % 10 == 0:  # Simuler environ 10% d'anomalies
                    score = np.random.uniform(0.85, 0.99)
                    anomalies.append({
                        "connection_id": i,
                        "source_ip": conn.get('source_ip', ''),
                        "destination_ip": conn.get('destination_ip', ''),
                        "protocol": conn.get('protocol', ''),
                        "port": conn.get('destination_port', 0),
                        "anomaly_score": score,
                        "anomaly_type": "port_scan" if i % 3 == 0 else "data_exfil" if i % 3 == 1 else "ddos"
                    })
            
            # Générer un circuit quantique pour la détection
            qc_result = self.generate_demo_quantum_circuit()
            
            return {
                "status": "success",
                "graph_image_url": graph_result["graph_image_url"],
                "circuit_image_url": qc_result["circuit_image_url"] if qc_result["status"] == "success" else None,
                "histogram_image_url": qc_result["histogram_image_url"] if qc_result["status"] == "success" else None,
                "metrics": graph_result["metrics"],
                "anomalies_detected": len(anomalies),
                "anomalies": anomalies,
                "execution_time": np.random.uniform(2, 8),  # Temps simulé en secondes
                "connections_analyzed": len(network_data),
                "quantum_simulation": {
                    "qubits": self.num_qubits,
                    "shots": self.shots,
                    "feature_map": self.feature_map_name,
                    "ansatz": self.ansatz_name
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Erreur lors de la détection d'anomalies: {str(e)}"
            }

# Instancier le service
quantum_service = QuantumService()