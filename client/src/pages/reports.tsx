import { 
  Download, 
  Calendar, 
  User, 
  Building2, 
  Shield, 
  FileText 
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

export default function Reports() {
  const reports = [
    {
      id: "cyber-posture-2024",
      title: "Rapport de posture cybersécurité",
      description: "Évaluation complète de la posture de cybersécurité de votre organisation.",
      date: "12 avril 2024",
      type: "compliance",
      icon: <Shield className="h-8 w-8 text-blue-500" />,
    },
    {
      id: "threat-intelligence-q1",
      title: "Rapport d'intelligence des menaces - T1 2024",
      description: "Analyse des menaces cybernétiques pour le premier trimestre 2024.",
      date: "31 mars 2024",
      type: "threat",
      icon: <Building2 className="h-8 w-8 text-red-500" />,
    },
    {
      id: "vulnerability-assessment",
      title: "Évaluation des vulnérabilités",
      description: "Analyse détaillée des vulnérabilités détectées dans votre infrastructure.",
      date: "15 mars 2024",
      type: "vulnerability",
      icon: <Shield className="h-8 w-8 text-orange-500" />,
    },
    {
      id: "business-continuity",
      title: "Plan de continuité d'activité",
      description: "Document détaillant les protocoles de continuité d'activité en cas d'incident majeur.",
      date: "28 février 2024",
      type: "continuity",
      icon: <FileText className="h-8 w-8 text-green-500" />,
    },
  ];

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

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">Tous les rapports</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
          <TabsTrigger value="threat">Menaces</TabsTrigger>
          <TabsTrigger value="vulnerability">Vulnérabilités</TabsTrigger>
          <TabsTrigger value="continuity">Continuité</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </TabsContent>
        {["compliance", "threat", "vulnerability", "continuity"].map((type) => (
          <TabsContent key={type} value={type} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports
                .filter((report) => report.type === type)
                .map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ReportCard({ report }: { report: any }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="p-2 rounded-lg bg-muted">
          {report.icon}
        </div>
        <div>
          <CardTitle className="text-lg">{report.title}</CardTitle>
          <CardDescription>{report.date}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{report.description}</p>
        <div className="flex items-center gap-2 mt-4">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Généré par QuantumEyes
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <Download className="h-4 w-4" />
          Télécharger le rapport
        </Button>
      </CardFooter>
    </Card>
  );
}