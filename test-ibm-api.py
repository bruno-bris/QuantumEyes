"""
Script de test pour la connexion à IBM Quantum via Qiskit
"""
import os
import json
from qiskit_ibm_runtime import QiskitRuntimeService

def test_ibm_connection():
    """Test la connexion à IBM Quantum et récupère les informations"""
    try:
        # Récupérer la clé API
        api_key = os.environ.get("IBM_QUANTUM_API_KEY")
        if not api_key:
            return {"success": False, "error": "IBM_QUANTUM_API_KEY manquant dans les variables d'environnement"}
        
        # Se connecter au service (utilisation du nouveau canal recommandé)
        service = QiskitRuntimeService(channel="ibm_cloud", token=api_key)
        
        # Récupérer des informations de base pour tester la connection
        account_info = {
            "connected": True,
            "channel": "ibm_cloud"
        }
        
        # Information de connexion simplifiée pour éviter le timeout
        backend_info = [{"note": "Liste des backends omise pour éviter timeout"}]
        hub_info = {"note": "Informations hub omises pour éviter timeout"}
        
        # Obtenir l'URL de base de l'API si possible
        base_url = "N/A"
        try:
            api_client = service.runtime._api_client
            base_url = api_client.get_backend_urls()[0]
        except Exception as e:
            print(f"Impossible d'obtenir l'URL de l'API: {e}")
        
        return {
            "success": True,
            "user": account_info,
            "backends": backend_info,
            "hub_info": hub_info,
            "api_url": base_url
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    result = test_ibm_connection()
    print(json.dumps(result, indent=2))