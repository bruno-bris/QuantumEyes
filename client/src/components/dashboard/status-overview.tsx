import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Shield, AlertTriangle, Server, Layout } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  alertLevel?: "success" | "warning" | "error" | "info" | "neutral";
  detailsLink?: string;
  detailsText?: string;
}

function StatusCard({
  title,
  value,
  change,
  icon,
  alertLevel = "neutral",
  detailsLink = "#",
  detailsText = "Voir les détails",
}: StatusCardProps) {
  // Map alert level to styling
  const alertStyles = {
    success: {
      bg: "bg-secondary-50",
      text: "text-secondary-600",
      iconBg: "bg-secondary-50",
      iconText: "text-secondary-600",
    },
    warning: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      iconBg: "bg-amber-50 bg-opacity-10",
      iconText: "text-amber-500",
    },
    error: {
      bg: "bg-destructive bg-opacity-10",
      text: "text-destructive",
      iconBg: "bg-destructive bg-opacity-10",
      iconText: "text-destructive",
    },
    info: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      iconBg: "bg-blue-50 bg-opacity-10",
      iconText: "text-blue-500",
    },
    neutral: {
      bg: "bg-primary-50",
      text: "text-primary-600",
      iconBg: "bg-primary-50",
      iconText: "text-primary-600",
    },
  };

  const styles = alertStyles[alertLevel];

  return (
    <Card className="transition duration-150 ease-in-out card-hover">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${styles.iconBg} rounded-md p-3`}>
            <div className={`h-6 w-6 ${styles.iconText}`}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-neutral-900 font-mono">
                  {value}
                </div>
                {change !== undefined && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${change >= 0 ? 'text-secondary-600' : 'text-destructive'}`}>
                    {change >= 0 ? (
                      <ArrowUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="w-3 h-3 mr-0.5" />
                    )}
                    <span>{Math.abs(change)}</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <div className="bg-neutral-50 px-5 py-3">
        <div className="text-sm">
          <a 
            href={detailsLink} 
            className={`font-medium ${alertLevel === 'error' ? 'text-destructive hover:text-red-800' : 'text-primary-600 hover:text-primary-700'}`}
          >
            {detailsText}
          </a>
        </div>
      </div>
    </Card>
  );
}

export function StatusOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/security-metrics'],
    staleTime: 60000, // 1 minute
  });

  const metrics = data?.metrics || {
    securityScore: 72,
    securityScoreChange: 4,
    activeThreats: 3,
    activeThreatsChange: 1,
    vulnerabilities: 12,
    vulnerabilitiesChange: -3,
    monitoredAssets: 28,
  };

  return (
    <div className="mb-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h2 className="text-lg font-semibold text-neutral-900">Vue d'ensemble de la sécurité</h2>
        <div className="mt-3 sm:mt-0">
          <select className="bg-white border border-neutral-300 rounded-md px-3 py-1.5 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            <option>Dernières 24 heures</option>
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard 
          title="Score de Sécurité"
          value={`${metrics.securityScore}/100`}
          change={metrics.securityScoreChange}
          icon={<Shield />}
          alertLevel="neutral"
        />
        
        <StatusCard 
          title="Menaces Actives"
          value={metrics.activeThreats}
          change={metrics.activeThreatsChange}
          icon={<AlertTriangle />}
          alertLevel="error"
          detailsText="Résoudre maintenant"
        />
        
        <StatusCard 
          title="Vulnérabilités"
          value={metrics.vulnerabilities}
          change={metrics.vulnerabilitiesChange}
          icon={<Layout />}
          alertLevel="warning"
        />
        
        <StatusCard 
          title="Actifs Surveillés"
          value={metrics.monitoredAssets}
          icon={<Server />}
          alertLevel="info"
          detailsText="Gérer les actifs"
        />
      </div>
    </div>
  );
}
