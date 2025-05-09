import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CyberMaturityRadar } from "@/components/dashboard/cyber-maturity-radar";
import { Clipboard, Download, RefreshCw } from "lucide-react";

export default function CyberAssessment() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Évaluation de Maturité Cyber</h1>
          <p className="text-muted-foreground mt-2">
            Évaluez votre niveau de préparation face aux cyber-risques selon différents référentiels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Relancer l'évaluation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Score Global</CardTitle>
            <CardDescription>Votre niveau de maturité cyber</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-32">
              <div className="text-5xl font-bold font-mono text-primary">72/100</div>
              <p className="text-muted-foreground mt-2">Niveau Intermédiaire+</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Conformité</CardTitle>
            <CardDescription>Standards et référentiels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">ANSSI - Niveau 1</span>
                  <span className="text-sm font-mono">80%</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-2 bg-primary-500 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">ISO 27001</span>
                  <span className="text-sm font-mono">65%</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-2 bg-primary-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">NIST CSF</span>
                  <span className="text-sm font-mono">70%</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-2 bg-primary-500 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Prochaines Étapes</CardTitle>
            <CardDescription>Actions recommandées</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="text-sm flex gap-2 items-start">
                <Clipboard className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Mettre en place une politique de gestion des mots de passe plus stricte</span>
              </li>
              <li className="text-sm flex gap-2 items-start">
                <Clipboard className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Déployer un système d'authentification multifactorielle</span>
              </li>
              <li className="text-sm flex gap-2 items-start">
                <Clipboard className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Améliorer la procédure de sauvegarde des données critiques</span>
              </li>
              <li className="text-sm flex gap-2 items-start">
                <Clipboard className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Former les utilisateurs à la détection des tentatives de phishing</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <CyberMaturityRadar />
      
      <Card>
        <CardHeader>
          <CardTitle>Détail des Vulnérabilités</CardTitle>
          <CardDescription>
            Liste des faiblesses identifiées lors de l'évaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
              <h3 className="text-lg font-medium mb-2">Authentification et Contrôle d'Accès</h3>
              <p className="text-sm text-neutral-700 mb-3">
                Les politiques de gestion des mots de passe ne respectent pas les normes actuelles et l'authentification multifactorielle n'est pas déployée systématiquement.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Voir les détails</Button>
                <Button size="sm">Résoudre</Button>
              </div>
            </div>
            
            <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
              <h3 className="text-lg font-medium mb-2">Sauvegardes et Continuité</h3>
              <p className="text-sm text-neutral-700 mb-3">
                Les procédures de sauvegarde ne sont pas testées régulièrement et le plan de reprise d'activité n'est pas formalisé.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Voir les détails</Button>
                <Button size="sm">Résoudre</Button>
              </div>
            </div>
            
            <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
              <h3 className="text-lg font-medium mb-2">Sensibilisation des Utilisateurs</h3>
              <p className="text-sm text-neutral-700 mb-3">
                Le programme de sensibilisation n'inclut pas de formations régulières ni de tests de phishing simulé.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Voir les détails</Button>
                <Button size="sm">Résoudre</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
