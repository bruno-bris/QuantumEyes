"""
Générateur de données synthétiques pour le module QML de QuantumEyes.
Ce module génère des données réseau synthétiques pour tester et entraîner
l'algorithme QML de détection d'anomalies.
"""

import random
import numpy as np
import networkx as nx
from datetime import datetime, timedelta
import json
import os

class NetworkDataGenerator:
    """Générateur de données réseau synthétiques pour QuantumEyes."""
    
    def __init__(self):
        """Initialise le générateur de données."""
        # Liste d'IPs internes (fictives)
        self.internal_ips = [f"192.168.1.{i}" for i in range(1, 31)]
        
        # Liste d'IPs externes (fictives)
        self.external_ips = [
            f"203.0.113.{i}" for i in range(1, 20)
        ] + [
            f"198.51.100.{i}" for i in range(1, 20)
        ] + [
            f"172.16.{i}.{j}" for i in range(1, 5) for j in range(1, 10)
        ]
        
        # IPs malveillantes (fictives pour les anomalies)
        self.malicious_ips = [
            "185.143.223.12", "91.121.87.45", "45.95.168.112", 
            "194.5.249.157", "194.36.191.35"
        ]
        
        # Ports courants
        self.common_ports = [80, 443, 22, 25, 53, 123, 389, 636, 3389]
        
        # Protocoles courants
        self.protocols = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS", "NTP"]
    
    def generate_normal_traffic(self, num_connections=50):
        """
        Génère du trafic réseau normal.
        
        Args:
            num_connections (int): Nombre de connexions à générer
            
        Returns:
            list: Liste de dictionnaires représentant les connexions
        """
        connections = []
        
        for _ in range(num_connections):
            # Pour le trafic normal, utiliser principalement les IPs internes
            src_ip = random.choice(self.internal_ips)
            
            # 80% du trafic vers des IPs externes, 20% en interne
            if random.random() < 0.8:
                dst_ip = random.choice(self.external_ips)
            else:
                dst_ip = random.choice([ip for ip in self.internal_ips if ip != src_ip])
            
            # Sélectionner un port et un protocole courants
            protocol = random.choice(self.protocols)
            if protocol in ["HTTP", "HTTPS"]:
                port = 80 if protocol == "HTTP" else 443
            else:
                port = random.choice(self.common_ports)
            
            # Générer un timestamp
            timestamp = datetime.now() - timedelta(
                minutes=random.randint(0, 60)
            )
            
            # Générer une taille de paquet typique
            packet_size = random.randint(64, 1500)
            
            connection = {
                "source_ip": src_ip,
                "destination_ip": dst_ip,
                "protocol": protocol,
                "source_port": random.randint(49152, 65535),  # Ports éphémères
                "destination_port": port,
                "timestamp": timestamp.isoformat(),
                "packet_size": packet_size,
                "is_anomaly": False
            }
            
            connections.append(connection)
        
        return connections
    
    def generate_anomalous_traffic(self, num_connections=10, anomaly_type="port_scan"):
        """
        Génère du trafic réseau anormal/malveillant.
        
        Args:
            num_connections (int): Nombre de connexions à générer
            anomaly_type (str): Type d'anomalie à générer (port_scan, ddos, data_exfil)
            
        Returns:
            list: Liste de dictionnaires représentant les connexions
        """
        connections = []
        
        if anomaly_type == "port_scan":
            # Simulation d'un scan de ports
            attacker_ip = random.choice(self.external_ips + self.malicious_ips)
            target_ip = random.choice(self.internal_ips)
            
            # Scanner une série de ports consécutifs
            start_port = random.randint(1, 1000)
            
            for i in range(num_connections):
                port = start_port + i
                
                connection = {
                    "source_ip": attacker_ip,
                    "destination_ip": target_ip,
                    "protocol": "TCP",
                    "source_port": random.randint(49152, 65535),
                    "destination_port": port,
                    "timestamp": datetime.now().isoformat(),
                    "packet_size": 64,  # Petits paquets typiques d'un scan
                    "is_anomaly": True
                }
                
                connections.append(connection)
        
        elif anomaly_type == "ddos":
            # Simulation d'une attaque DDoS
            target_ip = random.choice(self.internal_ips)
            target_port = random.choice(self.common_ports)
            
            for _ in range(num_connections):
                # Plusieurs IPs sources attaquent la même cible
                attacker_ip = random.choice(self.external_ips + self.malicious_ips)
                
                connection = {
                    "source_ip": attacker_ip,
                    "destination_ip": target_ip,
                    "protocol": random.choice(["TCP", "UDP", "ICMP"]),
                    "source_port": random.randint(49152, 65535),
                    "destination_port": target_port,
                    "timestamp": datetime.now().isoformat(),
                    "packet_size": random.randint(64, 1500),
                    "is_anomaly": True
                }
                
                connections.append(connection)
        
        elif anomaly_type == "data_exfil":
            # Simulation d'exfiltration de données
            internal_ip = random.choice(self.internal_ips)
            external_ip = random.choice(self.malicious_ips)
            
            for _ in range(num_connections):
                connection = {
                    "source_ip": internal_ip,
                    "destination_ip": external_ip,
                    "protocol": random.choice(["HTTP", "HTTPS", "DNS"]),
                    "source_port": random.randint(49152, 65535),
                    "destination_port": 443 if random.random() < 0.7 else 53,
                    "timestamp": datetime.now().isoformat(),
                    "packet_size": random.randint(1000, 8000),  # Paquets plus grands
                    "is_anomaly": True
                }
                
                connections.append(connection)
        
        return connections
    
    def generate_mixed_dataset(self, normal_count=200, anomaly_count=50):
        """
        Génère un ensemble de données mixtes pour l'entraînement.
        
        Args:
            normal_count (int): Nombre de connexions normales
            anomaly_count (int): Nombre de connexions anormales
            
        Returns:
            tuple: (données, étiquettes)
        """
        # Générer du trafic normal
        normal_traffic = self.generate_normal_traffic(normal_count)
        
        # Générer différents types d'anomalies
        anomaly_types = ["port_scan", "ddos", "data_exfil"]
        anomalies = []
        
        for anomaly_type in anomaly_types:
            count = anomaly_count // len(anomaly_types)
            anomalies.extend(
                self.generate_anomalous_traffic(count, anomaly_type)
            )
        
        # Combiner et mélanger les données
        all_data = normal_traffic + anomalies
        random.shuffle(all_data)
        
        # Extraire les étiquettes
        labels = [1 if conn["is_anomaly"] else 0 for conn in all_data]
        
        return all_data, labels
    
    def extract_features_for_classical_ml(self, connections):
        """
        Extrait des caractéristiques pour l'apprentissage machine classique.
        Utile pour comparer les performances avec le QML.
        
        Args:
            connections (list): Liste des connexions réseau
            
        Returns:
            np.array: Matrice de caractéristiques
        """
        features = []
        
        # Regrouper les connexions par source_ip
        connections_by_source = {}
        for conn in connections:
            src = conn["source_ip"]
            if src not in connections_by_source:
                connections_by_source[src] = []
            connections_by_source[src].append(conn)
        
        # Pour chaque adresse IP source, extraire des statistiques
        for src_ip, conns in connections_by_source.items():
            # Nombre de destinations uniques
            unique_dests = len(set(c["destination_ip"] for c in conns))
            
            # Nombre de ports uniques
            unique_ports = len(set(c["destination_port"] for c in conns))
            
            # Taille moyenne des paquets
            avg_packet_size = np.mean([c["packet_size"] for c in conns])
            
            # Ratio ports/connexions
            port_conn_ratio = unique_ports / len(conns) if len(conns) > 0 else 0
            
            # Caractéristiques par source IP
            feature_vector = [
                len(conns),           # Nombre de connexions
                unique_dests,         # Nombre de destinations uniques
                unique_ports,         # Nombre de ports uniques
                avg_packet_size,      # Taille moyenne des paquets
                port_conn_ratio       # Ratio ports/connexions
            ]
            
            features.append(feature_vector)
        
        return np.array(features)

def generate_sample_data():
    """Génère et sauvegarde un échantillon de données synthétiques pour les tests."""
    generator = NetworkDataGenerator()
    
    # Générer un jeu de données mixte
    data, labels = generator.generate_mixed_dataset(normal_count=100, anomaly_count=30)
    
    # Sauvegarder les données
    os.makedirs('quantum_server/data', exist_ok=True)
    
    with open('quantum_server/data/sample_network_data.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    with open('quantum_server/data/sample_labels.json', 'w') as f:
        json.dump(labels, f, indent=2)
    
    print(f"Données générées : {len(data)} connexions ({sum(labels)} anomalies)")

if __name__ == "__main__":
    generate_sample_data()