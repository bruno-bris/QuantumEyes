"""
Module de visualisation avancée pour QuantumEyes

Ce module fournit des fonctions pour générer des visualisations de haute qualité
pour les circuits quantiques, les histogrammes de résultats et autres représentations
graphiques liées au quantum machine learning.
"""

import matplotlib.pyplot as plt
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.visualization import plot_histogram
import networkx as nx
import io
import base64
from matplotlib.figure import Figure
import random
import os

# Fixer le style Matplotlib
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial', 'DejaVu Sans']
plt.rcParams['axes.titlesize'] = 14
plt.rcParams['axes.labelsize'] = 12
plt.rcParams['xtick.labelsize'] = 10
plt.rcParams['ytick.labelsize'] = 10

# Constantes
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)

def generate_filename(prefix: str, ext: str = 'png') -> str:
    """Génère un nom de fichier unique basé sur la date et l'heure."""
    import datetime
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    return f"{prefix}_{timestamp}.{ext}"

def create_feature_map_circuit(num_qubits=4, feature_map="zz", data_points=None):
    """
    Crée un circuit correspondant à une feature map ZZ ou ZZFeatureMap.
    
    Args:
        num_qubits: Nombre de qubits à utiliser
        feature_map: Type de feature map ('zz', 'pauli', etc.)
        data_points: Points de données à encoder (si None, génère des données aléatoires)
        
    Returns:
        Le circuit quantique créé
    """
    if data_points is None:
        # Générer des données aléatoires si aucune donnée n'est fournie
        data_points = np.random.random(num_qubits)
    
    qr = QuantumRegister(num_qubits, 'q')
    cr = ClassicalRegister(num_qubits, 'c')
    circuit = QuantumCircuit(qr, cr)
    
    # Première rotation
    for i in range(num_qubits):
        circuit.h(qr[i])
        circuit.rz(data_points[i % len(data_points)], qr[i])
    
    # Entanglement (pour ZZ)
    if feature_map.lower() == "zz":
        for i in range(num_qubits-1):
            circuit.cx(qr[i], qr[i+1])
            circuit.rz(data_points[i % len(data_points)] * data_points[(i+1) % len(data_points)], qr[i+1])
            circuit.cx(qr[i], qr[i+1])
    
    # Mesures
    circuit.barrier()
    circuit.measure(qr, cr)
    
    return circuit

def create_variational_circuit(num_qubits=4, ansatz="realamplitudes", depth=2):
    """
    Crée un circuit variationnel (ansatz) pour l'apprentissage quantique.
    
    Args:
        num_qubits: Nombre de qubits à utiliser
        ansatz: Type d'ansatz ('realamplitudes', 'efficientsu2', etc.)
        depth: Profondeur du circuit
        
    Returns:
        Le circuit quantique créé
    """
    qr = QuantumRegister(num_qubits, 'q')
    cr = ClassicalRegister(num_qubits, 'c')
    circuit = QuantumCircuit(qr, cr)
    
    # Paramètres aléatoires pour la visualisation
    params = np.random.random(num_qubits * depth * 3)
    param_idx = 0
    
    for d in range(depth):
        # Rotations
        for i in range(num_qubits):
            circuit.rx(params[param_idx], qr[i])
            param_idx += 1
            circuit.ry(params[param_idx], qr[i])
            param_idx += 1
            circuit.rz(params[param_idx], qr[i])
            param_idx += 1
        
        # Entanglement
        if ansatz.lower() in ["realamplitudes", "real"]:
            for i in range(num_qubits-1):
                circuit.cx(qr[i], qr[i+1])
            if num_qubits > 2:  # Ajouter une connexion du dernier au premier qubit pour fermer la boucle
                circuit.cx(qr[num_qubits-1], qr[0])
    
    # Mesures
    circuit.barrier()
    circuit.measure(qr, cr)
    
    return circuit

def create_anomaly_detection_circuit(num_qubits=4, feature_map="zz", ansatz="real", data_points=None):
    """
    Crée un circuit complet pour la détection d'anomalies quantique.
    
    Args:
        num_qubits: Nombre de qubits à utiliser
        feature_map: Type de feature map
        ansatz: Type d'ansatz
        data_points: Points de données à encoder
        
    Returns:
        Le circuit quantique créé
    """
    if data_points is None:
        # Générer des données aléatoires si aucune donnée n'est fournie
        data_points = np.random.random(num_qubits)
    
    qr = QuantumRegister(num_qubits, 'q')
    cr = ClassicalRegister(num_qubits, 'c')
    circuit = QuantumCircuit(qr, cr)
    
    # Première partie: Feature Map
    # Hadamard sur tous les qubits
    for i in range(num_qubits):
        circuit.h(qr[i])
    
    # Encodage des données
    for i in range(num_qubits):
        circuit.rz(data_points[i % len(data_points)] * np.pi, qr[i])
    
    # Entanglement pour ZZ feature map
    if feature_map.lower() == "zz":
        for i in range(num_qubits-1):
            circuit.cx(qr[i], qr[i+1])
            circuit.rz(data_points[i % len(data_points)] * data_points[(i+1) % len(data_points)] * np.pi, qr[i+1])
            circuit.cx(qr[i], qr[i+1])
    
    circuit.barrier()
    
    # Deuxième partie: Ansatz variationnel
    # Paramètres aléatoires pour la visualisation
    params = np.random.random(num_qubits * 3)
    
    # Rotations paramétrées
    for i in range(num_qubits):
        circuit.rx(params[i % len(params)] * np.pi, qr[i])
    
    for i in range(num_qubits):
        circuit.ry(params[(i+1) % len(params)] * np.pi, qr[i])
    
    # Entanglement
    if ansatz.lower() in ["realamplitudes", "real"]:
        for i in range(num_qubits-1):
            circuit.cx(qr[i], qr[i+1])
        if num_qubits > 2:
            circuit.cx(qr[num_qubits-1], qr[0])  # Boucle fermée
    
    circuit.barrier()
    
    # Mesures
    circuit.measure(qr, cr)
    
    return circuit

def visualize_quantum_circuit(circuit, style='mpl', filename=None):
    """
    Visualise un circuit quantique et sauvegarde l'image.
    
    Args:
        circuit: Le circuit quantique à visualiser
        style: Style de visualisation ('mpl' ou 'latex')
        filename: Nom du fichier pour sauvegarder l'image
        
    Returns:
        Chemin vers l'image sauvegardée
    """
    if filename is None:
        filename = generate_filename('circuit')
    
    filepath = os.path.join(STATIC_DIR, filename)
    
    fig = plt.figure(figsize=(12, 8))
    ax = fig.add_subplot(111)
    
    if style == 'latex':
        circuit_drawing = circuit.draw('latex')
    else:
        circuit_drawing = circuit.draw('mpl', ax=ax)
    
    plt.title('Circuit Quantique pour la Détection d\'Anomalies', fontsize=16)
    plt.tight_layout()
    plt.savefig(filepath, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    
    return filepath

def generate_counts_dict(num_qubits=4, num_shots=1024, anomaly=False):
    """
    Génère un dictionnaire simulant les résultats de mesure d'un circuit quantique.
    
    Args:
        num_qubits: Nombre de qubits
        num_shots: Nombre de shots
        anomaly: Si True, génère une distribution biaisée suggérant une anomalie
        
    Returns:
        Dictionnaire des états et leurs comptages
    """
    states = []
    for i in range(2**num_qubits):
        # Convertir i en chaîne binaire et remplir avec des zéros
        binary = bin(i)[2:].zfill(num_qubits)
        states.append(binary)
    
    counts = {}
    
    if anomaly:
        # Distribution biaisée - pic sur certains états spécifiques
        anomalous_states = [states[0], states[-1]]  # Par exemple, tout 0 et tout 1
        anomalous_prob = 0.7  # 70% de probabilité pour les états anormaux
        normal_prob = 0.3 / (len(states) - len(anomalous_states))
        
        for state in states:
            if state in anomalous_states:
                prob = anomalous_prob / len(anomalous_states)
            else:
                prob = normal_prob
            
            # Ajouter une variation aléatoire
            prob += random.uniform(-0.02, 0.02)
            counts[state] = int(prob * num_shots)
    else:
        # Distribution normale - plus proche d'une distribution uniforme avec du bruit
        for state in states:
            # Base probability with some noise
            prob = 1.0 / len(states) + random.uniform(-0.01, 0.01)
            counts[state] = max(0, int(prob * num_shots))
    
    # S'assurer que le total fait bien num_shots
    total = sum(counts.values())
    if total != num_shots:
        # Ajuster le premier état non-nul
        for state in counts:
            if counts[state] > 0 or total < num_shots:
                counts[state] += (num_shots - total)
                break
    
    return counts

def visualize_histogram(counts, filename=None, title='Distribution des Mesures Quantiques'):
    """
    Visualise un histogramme des résultats de circuit quantique et sauvegarde l'image.
    
    Args:
        counts: Dictionnaire des états et comptages
        filename: Nom du fichier pour sauvegarder l'image
        title: Titre du graphique
        
    Returns:
        Chemin vers l'image sauvegardée
    """
    if filename is None:
        filename = generate_filename('histogram')
    
    filepath = os.path.join(STATIC_DIR, filename)
    
    fig = plt.figure(figsize=(12, 8))
    ax = fig.add_subplot(111)
    
    # Trier les états par valeur (nombre d'occurrences)
    sorted_counts = dict(sorted(counts.items(), key=lambda item: item[1], reverse=True))
    
    # Limiter à 20 états pour la lisibilité
    if len(sorted_counts) > 20:
        top_states = list(sorted_counts.keys())[:20]
        filtered_counts = {state: sorted_counts[state] for state in top_states}
    else:
        filtered_counts = sorted_counts
    
    # Créer l'histogramme
    bars = ax.bar(filtered_counts.keys(), filtered_counts.values(), color='skyblue', alpha=0.7)
    
    # Ajouter les valeurs sur les barres
    for bar in bars:
        height = bar.get_height()
        if height > 0:
            ax.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height}',
                    ha='center', va='bottom', fontsize=9)
    
    plt.title(title, fontsize=16)
    plt.xlabel('États quantiques', fontsize=12)
    plt.ylabel('Nombre d\'occurrences', fontsize=12)
    plt.xticks(rotation=45, fontsize=9)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(filepath, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    
    return filepath

def generate_demo_visualization(num_qubits=4, feature_map="zz", ansatz="real", anomaly=False, prefix="demo"):
    """
    Génère des visualisations de démonstration pour le QML.
    
    Args:
        num_qubits: Nombre de qubits
        feature_map: Type de feature map
        ansatz: Type d'ansatz
        anomaly: Si True, génère une distribution suggérant une anomalie
        prefix: Préfixe pour les noms de fichiers
        
    Returns:
        Tuple avec les chemins vers les images générées (circuit, histogramme)
    """
    # Créer un circuit de détection d'anomalies
    circuit = create_anomaly_detection_circuit(num_qubits, feature_map, ansatz)
    
    # Visualiser le circuit
    circuit_filename = f"{prefix}_circuit.png"
    circuit_path = visualize_quantum_circuit(circuit, filename=circuit_filename)
    
    # Générer et visualiser l'histogramme
    counts = generate_counts_dict(num_qubits, 1024, anomaly)
    histogram_filename = f"{prefix}_histogram.png"
    histogram_title = "Distribution des Mesures - Détection d'Anomalies QML"
    histogram_path = visualize_histogram(counts, histogram_filename, histogram_title)
    
    return circuit_path, histogram_path

def generate_network_graph_visualization(nodes, edges, filename=None, anomalies=None):
    """
    Génère une visualisation d'un graphe de réseau avec mise en évidence des anomalies.
    
    Args:
        nodes: Liste des nœuds
        edges: Liste des arêtes
        filename: Nom du fichier pour sauvegarder l'image
        anomalies: Liste des arêtes représentant des anomalies
        
    Returns:
        Chemin vers l'image sauvegardée
    """
    if filename is None:
        filename = generate_filename('network')
    
    filepath = os.path.join(STATIC_DIR, filename)
    
    # Créer le graphe
    G = nx.Graph()
    G.add_nodes_from(nodes)
    G.add_edges_from(edges)
    
    # Configuration de la figure
    plt.figure(figsize=(12, 8))
    
    # Définir le layout
    pos = nx.spring_layout(G, seed=42)
    
    # Dessiner les nœuds
    nx.draw_networkx_nodes(G, pos, node_color='lightblue', node_size=300, alpha=0.8)
    
    # Coloration des arêtes
    edge_colors = []
    edge_widths = []
    
    if anomalies:
        anomaly_set = set(anomalies)
        for edge in G.edges():
            if edge in anomaly_set or (edge[1], edge[0]) in anomaly_set:
                edge_colors.append('red')
                edge_widths.append(2.0)
            else:
                edge_colors.append('gray')
                edge_widths.append(1.0)
    else:
        edge_colors = ['gray'] * len(G.edges())
        edge_widths = [1.0] * len(G.edges())
    
    # Dessiner les arêtes
    nx.draw_networkx_edges(G, pos, edge_color=edge_colors, width=edge_widths, alpha=0.7)
    
    # Dessiner les labels des nœuds
    nx.draw_networkx_labels(G, pos, font_size=8, font_family='sans-serif')
    
    plt.title('Graphe de Connexions Réseau avec Anomalies', fontsize=16)
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(filepath, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    
    return filepath

# Test des fonctions si exécuté directement
if __name__ == "__main__":
    print("Génération de visualisations de test...")
    
    # Générer un circuit quantique
    circuit = create_anomaly_detection_circuit(4, "zz", "real")
    circuit_path = visualize_quantum_circuit(circuit)
    print(f"Circuit quantique généré: {circuit_path}")
    
    # Générer un histogramme
    counts = generate_counts_dict(4, 1024, anomaly=True)
    histogram_path = visualize_histogram(counts)
    print(f"Histogramme généré: {histogram_path}")
    
    # Générer une visualisation complète
    circuit_path, histogram_path = generate_demo_visualization(anomaly=True)
    print(f"Visualisation de démo générée: {circuit_path}, {histogram_path}")
    
    # Générer un graphe réseau
    nodes = [f"Node{i}" for i in range(10)]
    edges = [(nodes[i], nodes[j]) for i in range(len(nodes)) for j in range(i+1, len(nodes)) if random.random() > 0.7]
    anomalies = [edges[i] for i in range(len(edges)) if random.random() > 0.8]
    graph_path = generate_network_graph_visualization(nodes, edges, anomalies=anomalies)
    print(f"Graphe réseau généré: {graph_path}")