"""
Script pour démarrer le serveur API QML simulé
"""
from quantum_mock import app

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)