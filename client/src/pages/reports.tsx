import { useEffect, useState } from "react";
import { Link } from "wouter";
import { 
  Download, 
  Calendar, 
  User, 
  Building2, 
  Shield, 
  FileText,
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState("all");
  
  // Récupérer les rapports depuis l'API
  const { data, isLoading, error } = useQuery<{ reports: Report[] }>({
    queryKey: ["/api/reports"],
    staleTime: 60000, // 1 minute
  });

  // Générer l'icône en fonction du type de rapport
  const getIconForType = (type: string, iconType?: string | null) => {
    const iconClass = "h-8 w-8";
    
    if (iconType === "building2") {
      return <Building2 className={`${iconClass} text-red-500`} />;
    }
    
    if (iconType === "file-text") {
      return <FileText className={`${iconClass} text-green-500`} />;
    }
    
    switch (type) {
      case "compliance":
        return <Shield className={`${iconClass} text-blue-500`} />;
      case "threat":
        return <Building2 className={`${iconClass} text-red-500`} />;
      case "vulnerability":
        return <Shield className={`${iconClass} text-orange-500`} />;
      case "continuity":
        return <FileText className={`${iconClass} text-green-500`} />;
      case "monthly":
        return <Calendar className={`${iconClass} text-purple-500`} />;
      case "weekly":
        return <Calendar className={`${iconClass} text-indigo-500`} />;
      default:
        return <FileText className={`${iconClass} text-gray-500`} />;
    }
  };

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Rapports</h1>
          <p className="text-muted-foreground mt-1">
            Accédez et téléchargez les rapports générés par QuantumEyes.
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Générer un nouveau rapport
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="all">Tous les rapports</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
          <TabsTrigger value="threat">Menaces</TabsTrigger>
          <TabsTrigger value="vulnerability">Vulnérabilités</TabsTrigger>
          <TabsTrigger value="continuity">Continuité</TabsTrigger>
          <TabsTrigger value="monthly">Mensuels</TabsTrigger>
        </TabsList>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Chargement des rapports...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500">Une erreur est survenue lors du chargement des rapports.</p>
            <p className="text-sm text-muted-foreground mt-2">Veuillez réessayer ultérieurement.</p>
          </div>
        ) : (
          <>
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.reports && data.reports.length > 0 ? (
                  data.reports.map((report) => (
                    <ReportCard 
                      key={report.id} 
                      report={report}
                      icon={getIconForType(report.type, report.iconType)} 
                    />
                  ))
                ) : (
                  <div className="col-span-2 p-6 text-center border rounded-lg">
                    <p>Aucun rapport disponible pour le moment.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {["compliance", "threat", "vulnerability", "continuity", "monthly"].map((type) => (
              <TabsContent key={type} value={type} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data?.reports && data.reports.filter(report => report.type === type).length > 0 ? (
                    data.reports
                      .filter((report) => report.type === type)
                      .map((report) => (
                        <ReportCard 
                          key={report.id} 
                          report={report} 
                          icon={getIconForType(report.type, report.iconType)} 
                        />
                      ))
                  ) : (
                    <div className="col-span-2 p-6 text-center border rounded-lg">
                      <p>Aucun rapport de type {type} disponible.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </>
        )}
      </Tabs>
    </div>
  );
}

interface ReportCardProps {
  report: Report;
  icon: React.ReactNode;
}

function ReportCard({ report, icon }: ReportCardProps) {
  // Formater la date
  const formattedDate = report.createdAt 
    ? format(new Date(report.createdAt), "d MMMM yyyy", { locale: fr }) 
    : "Date inconnue";
    
  // Extraire des métriques potentiellement présentes dans le rapport
  const metrics = report.metrics || {};

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="p-2 rounded-lg bg-muted">
          {icon}
        </div>
        <div>
          <CardTitle className="text-lg">{report.title}</CardTitle>
          <CardDescription>{formattedDate}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{report.description}</p>
        
        {/* Affichage des métriques si disponibles */}
        {metrics.securityScore && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-center">
              <div className="font-bold">{metrics.securityScore}</div>
              <div className="text-muted-foreground">Score</div>
            </div>
            {metrics.threats !== undefined && (
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-center">
                <div className="font-bold">{metrics.threats}</div>
                <div className="text-muted-foreground">Menaces</div>
              </div>
            )}
            {metrics.vulnerabilities !== undefined && (
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-center">
                <div className="font-bold">{metrics.vulnerabilities}</div>
                <div className="text-muted-foreground">Vulnérabilités</div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-4">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Généré par QuantumEyes
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/report-detail/${report.id}`}>
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Download className="h-4 w-4" />
            Voir le rapport détaillé
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}