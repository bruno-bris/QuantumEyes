"""
QuantumEyes - API du serveur QML

Ce module implémente une API Flask pour exposer les services du module QML
à l'interface utilisateur React.
"""

import os
import json
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from qml_service import quantum_service

# Initialiser l'application Flask
app = Flask(__name__, static_folder='static')
CORS(app)  # Autoriser les requêtes CORS

# Configurer le service QML avec la clé API IBM Quantum
if 'IBM_QUANTUM_API_KEY' in os.environ:
    quantum_service.set_api_token(os.environ['IBM_QUANTUM_API_KEY'])

# Générer des données réseau synthétiques pour les démonstrations
def generate_synthetic_network_data(num_connections=50):
    """
    Génère des données réseau synthétiques pour les démonstrations.
    """
    internal_ips = [f"192.168.1.{i}" for i in range(1, 31)]
    external_ips = [f"203.0.113.{i}" for i in range(1, 20)] + [f"198.51.100.{i}" for i in range(1, 20)]
    malicious_ips = ["185.143.223.12", "91.121.87.45", "45.95.168.112", "194.5.249.157"]
    common_ports = [80, 443, 22, 25, 53, 123, 389, 636, 3389]
    protocols = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS", "NTP"]
    
    connections = []
    
    for i in range(num_connections):
        # Simuler du trafic normal et quelques anomalies
        if i % 10 == 0:  # Ajouter une anomalie potentielle
            src_ip = np.random.choice(internal_ips) if np.random.random() < 0.5 else np.random.choice(malicious_ips)
            dst_ip = np.random.choice(internal_ips)
            protocol = np.random.choice(protocols)
            port = np.random.randint(1, 65535) if i % 20 == 0 else np.random.choice(common_ports)
        else:
            # Trafic normal
            src_ip = np.random.choice(internal_ips)
            dst_ip = np.random.choice(external_ips) if np.random.random() < 0.8 else np.random.choice([ip for ip in internal_ips if ip != src_ip])
            protocol = np.random.choice(protocols)
            port = np.random.choice(common_ports)
        
        connection = {
            "source_ip": src_ip,
            "destination_ip": dst_ip,
            "protocol": protocol,
            "source_port": np.random.randint(49152, 65535),  # Ports éphémères
            "destination_port": port,
            "packet_size": np.random.randint(64, 1500),
            "timestamp": i  # Pour l'ordre
        }
        
        connections.append(connection)
    
    return connections

# Routes API

@app.route('/api/quantum/status', methods=['GET'])
def get_status():
    """Retourne le statut du service QML."""
    return jsonify({
        "status": "operational",
        "qubits": quantum_service.num_qubits,
        "feature_map": quantum_service.feature_map_name,
        "ansatz": quantum_service.ansatz_name,
        "shots": quantum_service.shots,
        "model_type": quantum_service.model_type,
        "ibm_connected": quantum_service.ibm_service is not None
    })

@app.route('/api/quantum/configure', methods=['POST'])
def configure_service():
    """Configure le service QML."""
    config = request.json
    result = quantum_service.configure(config)
    return jsonify(result)

@app.route('/api/quantum/ibm-connect', methods=['POST'])
def ibm_connect():
    """Connecte au service IBM Quantum."""
    data = request.json
    token = data.get('token')
    
    if not token and 'IBM_QUANTUM_API_KEY' in os.environ:
        token = os.environ['IBM_QUANTUM_API_KEY']
    
    if not token:
        return jsonify({"status": "error", "message": "Token API IBM Quantum requis"})
    
    result = quantum_service.set_api_token(token)
    return jsonify(result)

@app.route('/api/quantum/circuit-demo', methods=['GET'])
def circuit_demo():
    """Génère un circuit quantique de démonstration."""
    result = quantum_service.generate_demo_quantum_circuit()
    return jsonify(result)

@app.route('/api/quantum/network-graph', methods=['POST'])
def network_graph():
    """Génère un graphe à partir de données réseau."""
    network_data = request.json
    
    if not network_data:
        # Utiliser des données synthétiques pour la démonstration
        network_data = generate_synthetic_network_data(50)
    
    result = quantum_service.generate_graph_from_network_data(network_data)
    return jsonify(result)

@app.route('/api/quantum/detect-anomalies', methods=['POST'])
def detect_anomalies():
    """Détecte les anomalies dans les données réseau."""
    network_data = request.json
    
    if not network_data:
        # Utiliser des données synthétiques pour la démonstration
        network_data = generate_synthetic_network_data(100)
    
    result = quantum_service.detect_anomalies(network_data)
    return jsonify(result)

@app.route('/api/quantum/demo-data', methods=['GET'])
def get_demo_data():
    """Génère des données de démonstration."""
    num_connections = int(request.args.get('count', 50))
    data = generate_synthetic_network_data(num_connections)
    return jsonify({
        "status": "success",
        "data": data,
        "count": len(data)
    })

@app.route('/static/<path:path>')
def serve_static(path):
    """Sert les fichiers statiques."""
    return send_from_directory('static', path)

if __name__ == '__main__':
    # Démarrer le serveur d'API
    port = int(os.environ.get('QUANTUM_API_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)