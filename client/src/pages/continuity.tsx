import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Download, FileText, Shield, AlertTriangle } from "lucide-react";

export default function Continuity() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Continuité d'Activité</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des plans de continuité et cyber-assurance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter les Plans
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Nouveau Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Statut PCA/PRA</CardTitle>
            <CardDescription>Plans de Continuité et Reprise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-32">
              <div className="flex items-center text-2xl font-bold mb-2">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <span>Opérationnel</span>
              </div>
              <p className="text-muted-foreground">Dernière mise à jour: 12/04/2023</p>
              <p className="text-muted-foreground mt-1">Prochain test: 15/07/2023</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Cyber-Assurance</CardTitle>
            <CardDescription>Couverture et renouvellement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-32">
              <div className="flex items-center text-2xl font-bold mb-2">
                <Shield className="h-6 w-6 text-primary mr-2" />
                <span>Actif</span>
              </div>
              <p className="text-muted-foreground">Police: CYB-2023-87542</p>
              <p className="text-muted-foreground mt-1">Renouvellement: 31/12/2023</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Temps de Reprise</CardTitle>
            <CardDescription>Objectifs définis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-32">
              <div className="flex items-center text-2xl font-bold mb-2">
                <Clock className="h-6 w-6 text-amber-500 mr-2" />
                <span>4h (RTO)</span>
              </div>
              <p className="text-muted-foreground">Point de Reprise (RPO): 15 min</p>
              <p className="text-muted-foreground mt-1">Dernier test: Conforme</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plans d'Intervention</CardTitle>
          <CardDescription>
            Procédures à suivre en cas d'incident de sécurité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium flex items-center">
                  <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                  Intervention en cas de Ransomware
                </h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Validé</span>
              </div>
              <p className="text-sm text-neutral-700 mb-3">
                Procédure complète d'isolation, d'analyse et de restauration en cas d'attaque par rançongiciel.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Consulter</Button>
                <Button variant="outline" size="sm">Simuler</Button>
              </div>
            </div>
            
            <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  Réponse à une fuite de données
                </h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Validé</span>
              </div>
              <p className="text-sm text-neutral-700 mb-3">
                Actions à mener pour identifier, contenir et remédier à une violation de données personnelles.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Consulter</Button>
                <Button variant="outline" size="sm">Simuler</Button>
              </div>
            </div>
            
            <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium flex items-center">
                  <AlertTriangle className="h-5 w-5 text-blue-500 mr-2" />
                  Défaillance d'infrastructure critique
                </h3>
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">En révision</span>
              </div>
              <p className="text-sm text-neutral-700 mb-3">
                Procédure de basculement et de reprise en cas de défaillance majeure d'un composant d'infrastructure.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Consulter</Button>
                <Button variant="outline" size="sm">Simuler</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Offres de Cyber-Assurance</CardTitle>
          <CardDescription>
            Solutions adaptées à votre profil de risque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="mb-3">
                <h3 className="font-medium text-lg">Protection Essentielle</h3>
                <p className="text-sm text-neutral-500">Couverture de base</p>
              </div>
              <ul className="space-y-2 mb-4">
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Incidents de sécurité</span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Restauration des données</span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Assistance technique (8h/j)</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Plus d'infos</Button>
            </div>
            
            <div className="border rounded-lg p-4 bg-primary-50 border-primary-100">
              <div className="mb-3">
                <h3 className="font-medium text-lg">Protection Premium</h3>
                <p className="text-sm text-neutral-500">Recommandé pour vous</p>
              </div>
              <ul className="space-y-2 mb-4">
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Tous les avantages Essentiels</span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Couverture ransomware</span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Assistance juridique RGPD</span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Support 24/7</span>
                </li>
              </ul>
              <Button className="w-full">Demander un devis</Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="mb-3">
                <h3 className="font-medium text-lg">Protection Entreprise</h3>
                <p className="text-sm text-neutral-500">Solution complète</p>
              </div>
              <ul className="space-y-2 mb-4">
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Tous les avantages Premium</span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Gestion de crise dédiée</span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Cyber-extorsion</span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Pertes d'exploitation</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Plus d'infos</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
