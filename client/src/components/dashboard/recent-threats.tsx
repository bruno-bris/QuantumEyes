import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Mail, Package, Shield } from "lucide-react";

interface Threat {
  id: string;
  title: string;
  timestamp: string;
  level: "critical" | "warning" | "info" | "success";
  description: string;
  source?: string;
  actions: {
    primary: string;
    secondary?: string[];
  };
  icon: "alert" | "mail" | "server" | "shield";
}

const ThreatIcon = ({ type, level }: { type: string; level: string }) => {
  const levelClasses = {
    critical: "bg-destructive bg-opacity-10 text-destructive",
    warning: "bg-amber-50 bg-opacity-10 text-amber-500",
    info: "bg-blue-50 bg-opacity-10 text-blue-500",
    success: "bg-secondary-50 bg-opacity-10 text-secondary-600",
  };

  const classes = `h-10 w-10 rounded-full ${levelClasses[level as keyof typeof levelClasses]} flex items-center justify-center ring-8 ring-white timeline-dot`;

  switch (type) {
    case "alert":
      return (
        <span className={classes}>
          <AlertTriangle className="h-5 w-5" />
        </span>
      );
    case "mail":
      return (
        <span className={classes}>
          <Mail className="h-5 w-5" />
        </span>
      );
    case "server":
      return (
        <span className={classes}>
          <Package className="h-5 w-5" />
        </span>
      );
    case "shield":
      return (
        <span className={classes}>
          <Shield className="h-5 w-5" />
        </span>
      );
    default:
      return (
        <span className={classes}>
          <AlertTriangle className="h-5 w-5" />
        </span>
      );
  }
};

export function RecentThreats() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/threats/recent'],
    staleTime: 60000, // 1 minute
  });

  const threats = data?.threats || [
    {
      id: "1",
      title: "Tentative de connexion suspecte",
      timestamp: "Il y a 28 minutes",
      level: "critical",
      description: "Multiples tentatives de connexion échouées détectées depuis une adresse IP non reconnue. Possible attaque par force brute.",
      source: "IP: 185.173.92.14",
      actions: {
        primary: "Voir les détails",
        secondary: ["Bloquer l'IP", "Ignorer"]
      },
      icon: "alert",
    },
    {
      id: "2",
      title: "Email de phishing détecté",
      timestamp: "Il y a 1 heure",
      level: "warning",
      description: "Campagne de phishing potentielle ciblant le département financier. Les emails contiennent des liens malveillants imitant le portail bancaire de l'entreprise.",
      source: "Ciblant 3 utilisateurs",
      actions: {
        primary: "Voir les détails",
        secondary: ["Bloquer l'expéditeur"]
      },
      icon: "mail",
    },
    {
      id: "3",
      title: "Activité de scan réseau",
      timestamp: "Il y a 3 heures",
      level: "info",
      description: "Activité de scan sur les ports 22, 80, 443, 3389. Pourrait indiquer une phase de reconnaissance avant une tentative d'attaque.",
      source: "Multiples ports",
      actions: {
        primary: "Voir les détails",
        secondary: ["Marquer comme résolu"]
      },
      icon: "server",
    },
    {
      id: "4",
      title: "Vulnérabilité corrigée",
      timestamp: "Il y a 6 heures",
      level: "success",
      description: "La mise à jour de sécurité a été déployée avec succès sur tous les systèmes affectés. Vulnérabilité Microsoft Office \"Follina\" désormais corrigée.",
      source: "CVE-2022-30190",
      actions: {
        primary: "Voir les détails"
      },
      icon: "shield",
    }
  ];

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium text-neutral-900">
          Menaces Récentes
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="flow-root">
          <ul className="-mb-8">
            {threats.map((threat, index) => (
              <li key={threat.id} className="timeline-item">
                {index !== threats.length - 1 && (
                  <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-neutral-200" aria-hidden="true"></span>
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <ThreatIcon type={threat.icon} level={threat.level} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-neutral-900">{threat.title}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-neutral-500">
                        {threat.timestamp} · {threat.source}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-neutral-700">
                      <p>{threat.description}</p>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      {threat.actions.secondary?.map((action, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <span>{action}</span>
                        </Button>
                      ))}
                      <Button
                        variant="subtle"
                        size="sm"
                        className="text-xs text-primary-700 bg-primary-50 hover:bg-primary-100"
                      >
                        <span>{threat.actions.primary}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 text-center">
          <Button variant="outline" className="inline-flex items-center">
            Voir toutes les alertes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
