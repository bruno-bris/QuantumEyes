import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { NetworkChart, DataPoint } from "@/components/ui/network-chart";

export function NetworkActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/network-activity'],
    staleTime: 30000, // 30 seconds
  });

  // Use sample data if no data is available
  const networkData = data?.metrics || {
    trafficPoints: generateSampleTrafficData(),
    inboundTraffic: 3.2,
    outboundTraffic: 1.8,
    activeConnections: 247,
    anomalies: [
      {
        id: "1",
        title: "Pic de trafic inhabituel",
        description: "Augmentation soudaine du trafic UDP à 11:42. 420% au-dessus de la référence normale."
      }
    ]
  };

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium text-neutral-900">
          Activité Réseau
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="network-chart mb-4 h-[200px]">
          <NetworkChart data={networkData.trafficPoints} />
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-neutral-700">Trafic Entrant</span>
              <span className="text-sm font-mono font-medium text-neutral-900">{networkData.inboundTraffic} GB/h</span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-2 bg-primary-500 rounded-full" 
                style={{ width: `${(networkData.inboundTraffic / 5) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-neutral-700">Trafic Sortant</span>
              <span className="text-sm font-mono font-medium text-neutral-900">{networkData.outboundTraffic} GB/h</span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-2 bg-secondary-500 rounded-full" 
                style={{ width: `${(networkData.outboundTraffic / 5) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-neutral-700">Connexions Actives</span>
              <span className="text-sm font-mono font-medium text-neutral-900">{networkData.activeConnections}</span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-2 bg-accent-500 rounded-full" 
                style={{ width: `${(networkData.activeConnections / 500) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-neutral-700 mb-3">Anomalies Détectées</h4>
          {networkData.anomalies.map(anomaly => (
            <div key={anomaly.id} className="bg-neutral-50 rounded-md p-3 border border-neutral-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-neutral-900">{anomaly.title}</p>
                  <p className="mt-1 text-sm text-neutral-700">
                    {anomaly.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-right">
          <a href="#" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
            Analyse détaillée
            <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to generate sample network traffic data
function generateSampleTrafficData(): DataPoint[] {
  const now = Date.now();
  const points: DataPoint[] = [];
  
  for (let i = 0; i < 25; i++) {
    // Base value around 50-150
    let value = 50 + Math.sin(i * 0.5) * 50 + Math.random() * 50;
    
    // Add anomaly point at index 18
    const anomaly = i === 18;
    if (anomaly) {
      value = 180; // Spike value
    }
    
    points.push({
      value,
      timestamp: now - (24 - i) * 15 * 60 * 1000, // Each point is 15 minutes apart
      anomaly
    });
  }
  
  return points;
}
