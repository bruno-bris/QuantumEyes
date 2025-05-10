import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { CircuitVisualizer } from "@/components/quantum/CircuitVisualizer";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Clock,
  Network,
  Download,
  Server,
  Link as LinkIcon,
  Calendar,
  Info,
  HelpCircle,
  Computer
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Types pour les anomalies
interface Anomaly {
  connection_id: number;
  source_ip: string;
  destination_ip: string;
  protocol: string;
  port: number;
  anomaly_score: string | number;
  anomaly_type: string;
}

// Type pour les métriques réseau
interface NetworkMetrics {
  nodes: number;
  edges: number;
  density: number;
  avg_degree: number;
  connected_components: number;
  avg_clustering: number;
}

// Type pour les détails quantiques
interface QuantumDetails {
  qubits: number;
  shots: number;
  feature_map: string;
  ansatz: string;
}

// Type pour le contenu du rapport
interface ReportContent {
  anomalies: Anomaly[];
  metrics: NetworkMetrics;
  quantum_details: QuantumDetails;
  execution_time: string | number;
  graph_image_url: string;
  circuit_image_url: string;
  histogram_image_url: string;
  timestamp: string;
}

// Type pour un rapport
interface Report {
  id: number;
  title: string;
  description: string;
  type: string;
  content: string;
  createdAt: string;
  fileUrl?: string | null;
  iconType?: string | null;
  organizationId: number;
  metrics?: {
    securityScore?: number;
    threats?: number;
    vulnerabilities?: number;
  };
  parsedContent?: ReportContent;
}

// Descriptions détaillées des types d'anomalies
const anomalyDescriptions: Record<string, { description: string; recommendations: string; severity: string }> = {
  "port_scan": {
    description: "Un balayage de ports a été détecté, indiquant qu'un hôte tente de découvrir des services accessibles sur le réseau. Cette activité peut précéder une tentative d'intrusion.",
    recommendations: "Configurez votre pare-feu pour limiter les connexions entrantes aux seuls ports nécessaires. Mettez en place un système de détection d'intrusion (IDS/IPS) pour alerter et bloquer les comportements suspects.",
    severity: "medium"
  },
  "brute_force": {
    description: "Une tentative d'accès par force brute a été détectée, indiquant qu'un attaquant essaie systématiquement différentes combinaisons de mots de passe pour accéder à un service.",
    recommendations: "Implémentez un verrouillage de compte après plusieurs tentatives échouées. Utilisez l'authentification à deux facteurs (2FA). Surveillez les journaux d'authentification pour détecter les tentatives répétées.",
    severity: "high"
  },
  "data_exfil": {
    description: "Une exfiltration de données potentielle a été détectée, indiquant qu'un volume anormal de données est transféré en dehors du réseau, ce qui pourrait signaler un vol de données.",
    recommendations: "Mettez en place des contrôles de flux de données sortantes. Utilisez des outils DLP (Data Loss Prevention) pour surveiller et contrôler les transferts de données sensibles. Chiffrez les données sensibles.",
    severity: "critical"
  },
  "ddos": {
    description: "Une attaque par déni de service distribuée (DDoS) potentielle a été détectée, visant à rendre un service indisponible en l'inondant de requêtes.",
    recommendations: "Implémentez des solutions anti-DDoS. Configurez des règles de limitation de débit au niveau du pare-feu. Utilisez des services CDN pour absorber le trafic.",
    severity: "high"
  },
  "lateral_movement": {
    description: "Un mouvement latéral a été détecté, indiquant qu'un attaquant tente de se propager à travers le réseau après avoir compromis un premier système.",
    recommendations: "Segmentez votre réseau pour limiter les mouvements latéraux. Implémentez le principe du moindre privilège pour les comptes utilisateurs. Utilisez des solutions EDR pour détecter les comportements anormaux sur les postes de travail.",
    severity: "critical"
  },
  "c2": {
    description: "Une communication avec un serveur de commande et contrôle (C2) a été détectée, indiquant qu'un système compromis tente de communiquer avec l'infrastructure de l'attaquant.",
    recommendations: "Bloquez l'accès aux domaines et IPs malveillants connus. Mettez en place une inspection SSL/TLS pour détecter le trafic chiffré suspect. Surveillez les connexions sortantes inhabituelles.",
    severity: "critical"
  },
  "unusual_protocol": {
    description: "Un protocole réseau inhabituel a été détecté, ce qui pourrait indiquer une tentative de contourner les systèmes de détection.",
    recommendations: "Configurez votre pare-feu pour autoriser uniquement les protocoles nécessaires à votre activité. Mettez en place une surveillance approfondie des paquets pour analyser le trafic réseau inhabituel.",
    severity: "medium"
  }
};

// Fonction pour obtenir les détails de gravité
function getSeverityDetails(severityLevel: string) {
  switch (severityLevel) {
    case "critical":
      return { color: "bg-red-500", text: "Critique", description: "Nécessite une attention immédiate. Ces menaces peuvent causer des dommages significatifs." };
    case "high":
      return { color: "bg-orange-500", text: "Élevée", description: "Doit être traitée rapidement. Ces menaces présentent un risque important." };
    case "medium":
      return { color: "bg-yellow-500", text: "Moyenne", description: "À traiter dans un délai raisonnable. Ces menaces présentent un risque modéré." };
    case "low":
      return { color: "bg-blue-500", text: "Faible", description: "À traiter lorsque possible. Ces menaces présentent un risque limité." };
    default:
      return { color: "bg-gray-500", text: "Inconnue", description: "Gravité non déterminée." };
  }
}

export default function ReportDetail() {
  const [, params] = useLocation();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchReportDetail = async () => {
      try {
        // Récupérer l'ID du rapport depuis les paramètres d'URL
        const reportId = window.location.pathname.split('/').pop();
        if (!reportId) {
          console.error("ID de rapport non trouvé dans l'URL");
          setLoading(false);
          return;
        }

        // Récupérer tous les rapports
        const response = await fetch('/api/reports');
        const data = await response.json();
        
        // Trouver le rapport spécifique par ID
        const foundReport = data.reports.find((r: Report) => r.id.toString() === reportId);
        
        if (foundReport) {
          // Parser le contenu JSON du rapport
          try {
            const parsedContent = JSON.parse(foundReport.content) as ReportContent;
            foundReport.parsedContent = parsedContent;
          } catch (e) {
            console.error("Erreur lors du parsing du contenu du rapport:", e);
          }
          
          setReport(foundReport);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du rapport:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetail();
  }, []);

  if (loading) {
    return (
      <div className="container p-6 mx-auto flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container p-6 mx-auto">
        <div className="text-center p-12 border rounded-lg">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Rapport non trouvé</h2>
          <p className="text-muted-foreground mb-6">Le rapport demandé n'existe pas ou a été supprimé.</p>
          <Link href="/reports">
            <Button>Retour aux rapports</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Préparer les données formatées
  const formattedDate = report.createdAt 
    ? format(new Date(report.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr }) 
    : "Date inconnue";

  const content = report.parsedContent;
  const anomalies = content?.anomalies || [];
  const metrics = content?.metrics || { nodes: 0, edges: 0, density: 0, avg_degree: 0, connected_components: 0, avg_clustering: 0 };
  const quantumDetails = content?.quantum_details || { qubits: 0, shots: 0, feature_map: "", ansatz: "" };

  return (
    <div className="container p-6 mx-auto">
      {/* En-tête du rapport */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/reports">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Retour aux rapports
            </Button>
          </Link>
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
            {report.type === 'threat' ? 'Menaces' : report.type}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold">{report.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Calendar className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
        <p className="mt-4 text-muted-foreground">{report.description}</p>
      </div>

      {/* Onglets du rapport */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="threats">Menaces détectées</TabsTrigger>
          <TabsTrigger value="network">Analyse réseau</TabsTrigger>
          <TabsTrigger value="quantum">Détails quantiques</TabsTrigger>
        </TabsList>

        {/* Contenu de l'onglet Aperçu */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métriques de sécurité</CardTitle>
                <CardDescription>Score de sécurité réseau global</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-6">
                  <div className="relative h-36 w-36">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold">{report.metrics?.securityScore || 0}</span>
                    </div>
                    <svg className="h-full w-full" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="2"></circle>
                      <circle 
                        cx="18" cy="18" r="16" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="2" 
                        strokeDasharray={`${(report.metrics?.securityScore || 0) * 100 / 100}, 100`}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                      ></circle>
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Menaces</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{report.metrics?.threats || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Détectées par QML</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Vulnérabilités</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{report.metrics?.vulnerabilities || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">À corriger</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="#threats">
                  <Button variant="outline" className="w-full">Voir les détails des menaces</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visualisation du réseau</CardTitle>
                <CardDescription>Représentation graphique des connexions analysées</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {content?.graph_image_url ? (
                  <img 
                    src={content.graph_image_url} 
                    alt="Graphe réseau"
                    className="max-w-full max-h-64 object-contain rounded-md border"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 w-full bg-slate-100 dark:bg-slate-800 rounded-md">
                    <Network className="h-16 w-16 text-slate-400" />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span>{metrics.nodes} nœuds et {metrics.edges} connexions analysés</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Contenu de l'onglet Menaces détectées */}
        <TabsContent value="threats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Menaces détectées par QML</CardTitle>
              <CardDescription>
                Analyse détaillée des anomalies identifiées par l'algorithme quantique
              </CardDescription>
            </CardHeader>
            <CardContent>
              {anomalies.length === 0 ? (
                <div className="p-6 text-center">
                  <Shield className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-medium">Aucune menace détectée</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Votre réseau semble sécurisé. Continuez à surveiller régulièrement.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {anomalies.map((anomaly, index) => {
                    // Obtenir des informations supplémentaires sur le type d'anomalie
                    const anomalyInfo = anomalyDescriptions[anomaly.anomaly_type] || {
                      description: "Type d'anomalie inconnu.",
                      recommendations: "Contactez votre administrateur réseau.",
                      severity: "medium"
                    };
                    
                    const severityInfo = getSeverityDetails(anomalyInfo.severity);
                    
                    // Calculer un score sur 100 basé sur anomaly_score
                    const scoreNum = typeof anomaly.anomaly_score === 'string' 
                      ? parseFloat(anomaly.anomaly_score) * 100 
                      : (anomaly.anomaly_score as number) * 100;
                    
                    return (
                      <div 
                        key={index} 
                        className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              {anomaly.anomaly_type === 'brute_force' ? 'Tentative de force brute' : 
                                anomaly.anomaly_type === 'port_scan' ? 'Balayage de ports' : 
                                anomaly.anomaly_type === 'data_exfil' ? 'Exfiltration de données' : 
                                anomaly.anomaly_type === 'ddos' ? 'Attaque DDoS potentielle' :
                                anomaly.anomaly_type === 'lateral_movement' ? 'Mouvement latéral détecté' :
                                anomaly.anomaly_type === 'c2' ? 'Communication C2' :
                                anomaly.anomaly_type}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Badge className={`${severityInfo.color} text-white`}>
                                {severityInfo.text}
                              </Badge>
                              <span>•</span>
                              <span>ID: {anomaly.connection_id}</span>
                              <span>•</span>
                              <span>Score: {scoreNum.toFixed(0)}%</span>
                            </div>
                          </div>
                          <div>
                            <Button variant="outline" size="sm">Corriger</Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Computer className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">Source</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded border text-sm">
                              {anomaly.source_ip}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Server className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">Destination</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded border text-sm">
                              {anomaly.destination_ip}:{anomaly.port} ({anomaly.protocol})
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-amber-500" />
                            <span className="font-medium">Description</span>
                          </div>
                          <p className="text-sm bg-white dark:bg-slate-800 p-3 rounded border">
                            {anomalyInfo.description}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Recommandations</span>
                          </div>
                          <p className="text-sm bg-white dark:bg-slate-800 p-3 rounded border">
                            {anomalyInfo.recommendations}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu de l'onglet Analyse réseau */}
        <TabsContent value="network" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Graphe du réseau</CardTitle>
                <CardDescription>Représentation visuelle des connexions</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {content?.graph_image_url ? (
                  <img 
                    src={content.graph_image_url} 
                    alt="Graphe réseau"
                    className="max-w-full object-contain rounded-md border"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 w-full bg-slate-100 dark:bg-slate-800 rounded-md">
                    <Network className="h-16 w-16 text-slate-400" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques réseau</CardTitle>
                <CardDescription>Métriques structurelles du réseau analysé</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Nœuds</p>
                      <p className="text-xl font-bold">{metrics.nodes}</p>
                      <p className="text-xs text-muted-foreground mt-1">Hôtes uniques</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Connexions</p>
                      <p className="text-xl font-bold">{metrics.edges}</p>
                      <p className="text-xs text-muted-foreground mt-1">Communications</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Degré moyen</p>
                      <p className="text-xl font-bold">{typeof metrics.avg_degree === 'number' ? metrics.avg_degree.toFixed(2) : metrics.avg_degree}</p>
                      <p className="text-xs text-muted-foreground mt-1">Connexions par hôte</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Densité</p>
                      <p className="text-xl font-bold">{typeof metrics.density === 'number' ? (metrics.density * 100).toFixed(1) : metrics.density}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Connectivité</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Composants</p>
                      <p className="text-xl font-bold">{metrics.connected_components}</p>
                      <p className="text-xs text-muted-foreground mt-1">Sous-réseaux isolés</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Coef. de clustering</p>
                      <p className="text-xl font-bold">{typeof metrics.avg_clustering === 'number' ? metrics.avg_clustering.toFixed(2) : metrics.avg_clustering}</p>
                      <p className="text-xs text-muted-foreground mt-1">Regroupement</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contenu de l'onglet Détails quantiques */}
        <TabsContent value="quantum" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Circuit quantique</CardTitle>
                <CardDescription>
                  Circuit utilisé pour l'analyse des anomalies
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {content?.circuit_image_url ? (
                  <img 
                    src={content.circuit_image_url} 
                    alt="Circuit quantique"
                    className="max-w-full object-contain rounded-md border"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 w-full bg-slate-100 dark:bg-slate-800 rounded-md">
                    <Network className="h-16 w-16 text-slate-400" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histogramme des résultats</CardTitle>
                <CardDescription>
                  Distribution des mesures quantiques
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {content?.histogram_image_url ? (
                  <img 
                    src={content.histogram_image_url} 
                    alt="Histogramme quantique"
                    className="max-w-full object-contain rounded-md border"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 w-full bg-slate-100 dark:bg-slate-800 rounded-md">
                    <Network className="h-16 w-16 text-slate-400" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Paramètres de l'analyse quantique</CardTitle>
                <CardDescription>
                  Configuration utilisée pour l'exécution du modèle QML
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">Qubits</p>
                    <p className="text-xl font-bold">{quantumDetails.qubits}</p>
                    <p className="text-xs text-muted-foreground mt-1">Bits quantiques utilisés</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">Shots</p>
                    <p className="text-xl font-bold">{quantumDetails.shots}</p>
                    <p className="text-xs text-muted-foreground mt-1">Exécutions du circuit</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">Feature Map</p>
                    <p className="text-xl font-bold">{quantumDetails.feature_map || "ZZ"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Encodage des données</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">Ansatz</p>
                    <p className="text-xl font-bold">{quantumDetails.ansatz || "Real"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Architecture du circuit</p>
                  </div>
                </div>

                <div className="mt-6 p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Temps d'exécution:</p>
                      <p className="text-muted-foreground">
                        {content?.execution_time} secondes
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Télécharger le rapport complet (PDF)
        </Button>
      </div>
    </div>
  );
}