import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Vulnerability {
  id: string;
  cveId: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  affectedSystem: string;
  description: string;
}

export function VulnerabilitiesSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/vulnerabilities'],
    staleTime: 300000, // 5 minutes
  });

  const vulnData = data?.data || {
    counts: {
      critical: 3,
      high: 5,
      medium: 4,
      low: 0
    },
    criticalVulnerabilities: [
      {
        id: "1",
        cveId: "CVE-2023-1234",
        severity: "critical",
        title: "Vulnérabilité d'exécution de code à distance dans Apache 2.4.52",
        affectedSystem: "Serveur Web",
        description: "Vulnérabilité d'exécution de code à distance dans Apache 2.4.52"
      },
      {
        id: "2",
        cveId: "CVE-2023-5678",
        severity: "critical",
        title: "Faille d'authentification dans PostgreSQL 14.2",
        affectedSystem: "Base de données",
        description: "Faille d'authentification dans PostgreSQL 14.2"
      }
    ]
  };

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium text-neutral-900">
          Vulnérabilités
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center">
            <span className="block text-2xl font-bold text-destructive font-mono">{vulnData.counts.critical}</span>
            <span className="block text-sm text-neutral-700">Critiques</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-amber-500 font-mono">{vulnData.counts.high}</span>
            <span className="block text-sm text-neutral-700">Élevées</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-blue-500 font-mono">{vulnData.counts.medium}</span>
            <span className="block text-sm text-neutral-700">Moyennes</span>
          </div>
        </div>
        
        <h4 className="text-sm font-semibold text-neutral-700 mb-3">Vulnérabilités Critiques</h4>
        <ul className="space-y-3">
          {vulnData.criticalVulnerabilities.map((vuln) => (
            <li key={vuln.id} className="bg-neutral-50 rounded-md p-3 border border-neutral-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-neutral-900">{vuln.cveId}</p>
                    <p className="text-sm text-neutral-500">{vuln.affectedSystem}</p>
                  </div>
                  <p className="mt-1 text-sm text-neutral-700">
                    {vuln.description}
                  </p>
                  <div className="mt-2">
                    <Button 
                      size="sm"
                      variant="primary"
                      className="px-2.5 py-1.5 text-xs"
                    >
                      Corriger maintenant
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        <div className="mt-6 text-center">
          <Button
            variant="primary"
            className="inline-flex items-center"
          >
            Voir toutes les vulnérabilités
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
