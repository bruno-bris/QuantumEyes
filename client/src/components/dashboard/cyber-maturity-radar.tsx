import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { RadarChart } from "@/components/ui/radar-chart";

interface MaturityCategory {
  name: string;
  score: number;
  maxScore: number;
}

export function CyberMaturityRadar() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/cyber-maturity'],
    staleTime: 3600000, // 1 hour
  });

  const maturityData = data?.categories || [
    { name: "Gouvernance", score: 75, maxScore: 100 },
    { name: "Protection", score: 60, maxScore: 100 },
    { name: "Détection", score: 70, maxScore: 100 },
    { name: "Réponse", score: 50, maxScore: 100 },
    { name: "Récupération", score: 55, maxScore: 100 },
  ];

  // Format data for radar chart
  const radarData = maturityData.map(cat => ({
    label: cat.name,
    value: cat.score,
    max: cat.maxScore,
  }));

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-neutral-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-neutral-900">
          Évaluation de Maturité Cyber
        </CardTitle>
        <Button variant="outline" onClick={() => refetch()} className="inline-flex items-center">
          <RefreshCw className="-ml-1 mr-1 h-5 w-5 text-neutral-500" />
          Relancer l'évaluation
        </Button>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2">
            <div className="h-64">
              <RadarChart data={radarData} strokeColor="#6236ff" fillColor="#6236ff" />
            </div>
          </div>
          <div className="w-full md:w-1/2 mt-6 md:mt-0 md:pl-6">
            <h4 className="text-sm font-semibold text-neutral-700 mb-3">
              Analyse de Maturité
            </h4>
            <div className="space-y-4">
              {maturityData.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-accent-500 mr-2"></div>
                      <span className="text-sm font-medium text-neutral-700">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-medium text-neutral-900">
                      {category.score}%
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-accent-500 rounded-full"
                      style={{ width: `${category.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <a
                href="#"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Voir le rapport complet
                <svg
                  className="ml-1 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
