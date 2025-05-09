"""
Script pour démarrer le serveur API QML
"""
from app import app
import os

if __name__ == "__main__":
    # Générer les données de test si nécessaire
    import data_generator
    os.makedirs('quantum_server/data', exist_ok=True)
    
    if not os.path.exists('quantum_server/data/sample_network_data.json'):
        print("Génération de données de test...")
        data_generator.generate_sample_data()
    
    # Démarrer le serveur API
    port = int(os.environ.get('QUANTUM_API_PORT', 5001))
    print(f"Démarrage du serveur API QML sur le port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)