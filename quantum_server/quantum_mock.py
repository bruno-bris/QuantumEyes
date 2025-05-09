"""
QuantumEyes - Simulateur d'API QML

Ce module fournit un serveur Flask qui simule l'API du module QML pour les tests.
"""
import os
import random
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Création du dossier pour les images statiques
os.makedirs('static', exist_ok=True)

# Générer des noms de fichiers uniques basés sur la date et l'heure
def generate_filename(prefix: str, ext: str = 'png') -> str:
    """Génère un nom de fichier unique basé sur la date et l'heure."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"static/{prefix}_{timestamp}.{ext}"

# Statut du service QML
qml_status = {
    "status": "running",
    "qubits": 4,
    "feature_map": "zz",
    "ansatz": "real",
    "shots": 1024,
    "model_type": "qsvc",
    "ibm_connected": False
}

# Simuler des données réseau
def generate_synthetic_network_data(num_connections=50):
    """Génère des données réseau synthétiques pour les démonstrations."""
    ip_prefixes = ["192.168.1.", "10.0.0.", "172.16.0.", "8.8.8."]
    protocols = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS"]
    ports = [80, 443, 22, 25, 53, 8080, 3389]
    
    data = []
    for i in range(num_connections):
        src_ip = f"{random.choice(ip_prefixes)}{random.randint(1, 254)}"
        dst_ip = f"{random.choice(ip_prefixes)}{random.randint(1, 254)}"
        protocol = random.choice(protocols)
        port = random.choice(ports)
        packet_size = random.randint(100, 1500)
        duration = random.uniform(0.1, 5.0)
        
        data.append({
            "id": i,
            "source_ip": src_ip,
            "destination_ip": dst_ip,
            "protocol": protocol,
            "destination_port": port,
            "packet_size": packet_size,
            "duration": duration,
            "timestamp": datetime.now().isoformat()
        })
    
    return data

# Routes API
@app.route('/api/quantum/status', methods=['GET'])
def get_status():
    """Retourne le statut du service QML."""
    return jsonify(qml_status)

@app.route('/api/quantum/configure', methods=['POST'])
def configure_service():
    """Configure le service QML."""
    config = request.get_json()
    
    if config:
        # Mettre à jour les paramètres du service
        for key, value in config.items():
            if key in qml_status:
                qml_status[key] = value
    
    return jsonify({
        "status": "success",
        "message": "Configuration mise à jour avec succès",
        "config": qml_status
    })

@app.route('/api/quantum/ibm/connect', methods=['POST'])
def ibm_connect():
    """Simuler la connexion au service IBM Quantum."""
    qml_status["ibm_connected"] = True
    
    return jsonify({
        "status": "success",
        "message": "Connecté au service IBM Quantum avec succès",
        "backends": ["ibmq_qasm_simulator", "ibmq_santiago", "ibmq_manila"]
    })

@app.route('/api/quantum/circuit/demo', methods=['GET'])
def circuit_demo():
    """Génère un circuit quantique de démonstration."""
    # Générer des images pour la démo
    circuit_image = generate_filename("circuit")
    
    # Créer une image de circuit simple
    plt.figure(figsize=(8, 6))
    plt.plot([0, 1, 2, 3], [0, 0, 0, 0], 'k-', linewidth=2)
    plt.plot([0, 1, 2, 3], [1, 1, 1, 1], 'k-', linewidth=2)
    plt.plot([0, 1, 2, 3], [2, 2, 2, 2], 'k-', linewidth=2)
    plt.plot([0, 1, 2, 3], [3, 3, 3, 3], 'k-', linewidth=2)
    
    # Ajouter des symboles pour les portes
    plt.text(0.5, 0, 'H', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='blue'))
    plt.text(0.5, 1, 'H', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='blue'))
    plt.text(0.5, 2, 'H', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='blue'))
    plt.text(0.5, 3, 'H', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='blue'))
    
    plt.text(1.5, 0, 'CNOT', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='green'))
    plt.plot([1.5, 1.5], [0, 1], 'g-', linewidth=2)
    
    plt.text(1.5, 2, 'CNOT', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='green'))
    plt.plot([1.5, 1.5], [2, 3], 'g-', linewidth=2)
    
    plt.text(2.5, 0, 'M', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='red'))
    plt.text(2.5, 1, 'M', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='red'))
    plt.text(2.5, 2, 'M', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='red'))
    plt.text(2.5, 3, 'M', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='red'))
    
    plt.title("Circuit Quantique de Démonstration")
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(circuit_image)
    plt.close()
    
    # Créer un histogramme de résultats simulés
    hist_image = generate_filename("histogram")
    # Simuler des résultats de circuit quantique
    states = ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111', 
             '1000', '1001', '1010', '1011', '1100', '1101', '1110', '1111']
    
    # Distribution avec un biais vers certains états pour simuler une interférence quantique
    probabilities = np.zeros(16)
    probabilities[0] = 0.25  # |0000> a une probabilité plus élevée
    probabilities[15] = 0.25  # |1111> a une probabilité plus élevée
    for i in range(1, 15):
        if i != 15:
            probabilities[i] = 0.5 / 14  # Distribuer le reste uniformément
    
    # Générer des comptages à partir des probabilités
    shots = qml_status["shots"]
    counts = np.random.multinomial(shots, probabilities)
    counts_dict = {state: count for state, count in zip(states, counts) if count > 0}
    
    # Dessiner l'histogramme
    plt.figure(figsize=(12, 6))
    bars = plt.bar(counts_dict.keys(), counts_dict.values())
    plt.xlabel('Etats de Base')
    plt.ylabel('Nombre')
    plt.title('Résultats de Mesure')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(hist_image)
    plt.close()
    
    # Créer une liste de comptages pour l'API
    counts_list = [{"state": state, "count": int(count)} for state, count in counts_dict.items()]
    
    return jsonify({
        "status": "success",
        "circuit_image_url": f"/{os.path.basename(circuit_image)}",
        "histogram_image_url": f"/{os.path.basename(hist_image)}",
        "counts": counts_list,
        "num_qubits": qml_status["qubits"],
        "shots": qml_status["shots"]
    })

@app.route('/api/quantum/network/graph', methods=['POST'])
def network_graph():
    """Génère un graphe à partir de données réseau."""
    # Utiliser des données fournies ou générer des données synthétiques
    data = request.get_json()
    if not data or 'connections' not in data:
        data = generate_synthetic_network_data(30)
    else:
        data = data['connections']
    
    # Générer une image de graphe
    graph_image = generate_filename("network_graph")
    plt.figure(figsize=(10, 8))
    
    # Créer des nœuds et des arêtes pour la visualisation
    nodes = set()
    edges = []
    for conn in data:
        src = conn.get('source_ip', f"src_{random.randint(1, 10)}")
        dst = conn.get('destination_ip', f"dst_{random.randint(1, 10)}")
        nodes.add(src)
        nodes.add(dst)
        edges.append((src, dst))
    
    # Positionner les nœuds
    pos = {}
    nodes = list(nodes)
    n = len(nodes)
    for i, node in enumerate(nodes):
        angle = 2 * np.pi * i / n
        pos[node] = (np.cos(angle), np.sin(angle))
    
    # Dessiner les nœuds
    plt.scatter([pos[node][0] for node in nodes], 
                [pos[node][1] for node in nodes], 
                s=500, color='skyblue', edgecolors='black', zorder=2)
    
    # Ajouter les étiquettes
    for node in nodes:
        plt.text(pos[node][0], pos[node][1], node, 
                 fontsize=8, ha='center', va='center', zorder=3)
    
    # Dessiner les arêtes
    for src, dst in edges:
        plt.plot([pos[src][0], pos[dst][0]], 
                 [pos[src][1], pos[dst][1]], 
                 'gray', alpha=0.5, zorder=1)
    
    plt.title("Graphe de Réseau")
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(graph_image, dpi=300, bbox_inches='tight')
    plt.close()
    
    # Simuler des métriques de graphe
    metrics = {
        "nodes": len(nodes),
        "edges": len(edges),
        "density": len(edges) / (len(nodes) * (len(nodes) - 1) / 2) if len(nodes) > 1 else 0,
        "avg_degree": 2 * len(edges) / len(nodes) if len(nodes) > 0 else 0,
        "connected_components": 1,
        "avg_clustering": 0.32
    }
    
    return jsonify({
        "status": "success",
        "graph_image_url": f"/{os.path.basename(graph_image)}",
        "metrics": metrics,
        "nodes": nodes,
        "edges": [{"source": src, "target": dst, "protocol": "TCP", "port": 80} for src, dst in edges]
    })

@app.route('/api/quantum/detect/anomalies', methods=['POST'])
def detect_anomalies():
    """Simule la détection d'anomalies dans les données réseau."""
    # Utiliser des données fournies ou générer des données synthétiques
    data = request.get_json()
    if not data or 'connections' not in data:
        network_data = generate_synthetic_network_data(50)
    else:
        network_data = data['connections']
    
    # Générer des images pour la visualisation
    graph_image = generate_filename("network_graph")
    circuit_image = generate_filename("circuit")
    hist_image = generate_filename("histogram")
    
    # Simuler une analyse de graphe
    plt.figure(figsize=(10, 8))
    
    # Créer des nœuds et des arêtes pour la visualisation
    nodes = set()
    edges = []
    for conn in network_data:
        src = conn.get('source_ip', f"src_{random.randint(1, 10)}")
        dst = conn.get('destination_ip', f"dst_{random.randint(1, 10)}")
        nodes.add(src)
        nodes.add(dst)
        edges.append((src, dst))
    
    # Positionner les nœuds
    pos = {}
    nodes = list(nodes)
    n = len(nodes)
    for i, node in enumerate(nodes):
        angle = 2 * np.pi * i / n
        pos[node] = (np.cos(angle), np.sin(angle))
    
    # Dessiner les nœuds
    plt.scatter([pos[node][0] for node in nodes], 
                [pos[node][1] for node in nodes], 
                s=500, color='skyblue', edgecolors='black', zorder=2)
    
    # Ajouter les étiquettes
    for node in nodes:
        plt.text(pos[node][0], pos[node][1], node, 
                 fontsize=8, ha='center', va='center', zorder=3)
    
    # Dessiner les arêtes
    for src, dst in edges:
        plt.plot([pos[src][0], pos[dst][0]], 
                 [pos[src][1], pos[dst][1]], 
                 'gray', alpha=0.5, zorder=1)
    
    # Surligner quelques anomalies
    anomaly_edges = random.sample(edges, min(3, len(edges)))
    for src, dst in anomaly_edges:
        plt.plot([pos[src][0], pos[dst][0]], 
                 [pos[src][1], pos[dst][1]], 
                 'red', linewidth=2, alpha=0.7, zorder=4)
    
    plt.title("Détection d'Anomalies Réseau")
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(graph_image, dpi=300, bbox_inches='tight')
    plt.close()
    
    # Simuler un circuit quantique
    plt.figure(figsize=(8, 6))
    plt.plot([0, 1, 2, 3], [0, 0, 0, 0], 'k-', linewidth=2)
    plt.plot([0, 1, 2, 3], [1, 1, 1, 1], 'k-', linewidth=2)
    plt.plot([0, 1, 2, 3], [2, 2, 2, 2], 'k-', linewidth=2)
    plt.plot([0, 1, 2, 3], [3, 3, 3, 3], 'k-', linewidth=2)
    
    # Ajouter des symboles pour les portes
    plt.text(0.5, 0, 'H', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='blue'))
    plt.text(0.5, 1, 'H', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='blue'))
    plt.text(0.5, 2, 'H', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='blue'))
    plt.text(0.5, 3, 'H', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='blue'))
    
    plt.text(1.5, 0, 'RZ', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='purple'))
    plt.text(1.5, 1, 'RZ', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='purple'))
    plt.text(1.5, 2, 'RZ', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='purple'))
    plt.text(1.5, 3, 'RZ', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='purple'))
    
    plt.text(2.5, 0, 'M', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='red'))
    plt.text(2.5, 1, 'M', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='red'))
    plt.text(2.5, 2, 'M', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='red'))
    plt.text(2.5, 3, 'M', fontsize=12, ha='center', va='center', bbox=dict(facecolor='white', edgecolor='red'))
    
    plt.title("Circuit QML - Détection d'Anomalies")
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(circuit_image)
    plt.close()
    
    # Simuler un histogramme de résultats
    states = ['Normal', 'Anomalie']
    values = [47, 3]  # 3 anomalies sur 50 connexions
    
    plt.figure(figsize=(8, 6))
    plt.bar(states, values, color=['green', 'red'])
    plt.title("Résultats de Détection")
    plt.xlabel("Classe")
    plt.ylabel("Nombre de connexions")
    plt.tight_layout()
    plt.savefig(hist_image)
    plt.close()
    
    # Simuler des métriques
    metrics = {
        "nodes": len(nodes),
        "edges": len(edges),
        "density": len(edges) / (len(nodes) * (len(nodes) - 1) / 2) if len(nodes) > 1 else 0,
        "avg_degree": 2 * len(edges) / len(nodes) if len(nodes) > 0 else 0,
        "connected_components": 1,
        "avg_clustering": 0.32
    }
    
    # Simuler des anomalies
    anomalies = []
    for i in range(3):
        conn = random.choice(network_data)
        anomalies.append({
            "connection_id": conn.get('id', i),
            "source_ip": conn.get('source_ip', f"src_{random.randint(1, 10)}"),
            "destination_ip": conn.get('destination_ip', f"dst_{random.randint(1, 10)}"),
            "protocol": conn.get('protocol', 'TCP'),
            "port": conn.get('destination_port', 80),
            "anomaly_score": round(random.uniform(0.85, 0.98), 2),
            "anomaly_type": random.choice(["port_scan", "data_exfiltration", "brute_force"])
        })
    
    return jsonify({
        "status": "success",
        "graph_image_url": f"/{os.path.basename(graph_image)}",
        "circuit_image_url": f"/{os.path.basename(circuit_image)}",
        "histogram_image_url": f"/{os.path.basename(hist_image)}",
        "metrics": metrics,
        "anomalies_detected": len(anomalies),
        "anomalies": anomalies,
        "execution_time": round(random.uniform(0.5, 3.0), 2),
        "connections_analyzed": len(network_data),
        "quantum_simulation": {
            "qubits": qml_status["qubits"],
            "shots": qml_status["shots"],
            "feature_map": qml_status["feature_map"],
            "ansatz": qml_status["ansatz"]
        }
    })

@app.route('/api/quantum/demo/data', methods=['GET'])
def get_demo_data():
    """Génère des données de démonstration."""
    return jsonify({
        "status": "success",
        "data": generate_synthetic_network_data(50)
    })

@app.route('/static/<path:path>', methods=['GET'])
def serve_static(path):
    """Sert les fichiers statiques."""
    return send_from_directory('static', path)

# Démarrer le serveur
if __name__ == '__main__':
    print("Démarrage du serveur QML simulé sur http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)