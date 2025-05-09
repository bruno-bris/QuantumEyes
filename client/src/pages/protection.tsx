import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NetworkActivity } from "@/components/dashboard/network-activity";
import { RecentThreats } from "@/components/dashboard/recent-threats";
import { AlertCircle, Database, Globe, Server, Shield, Wifi } from "lucide-react";

export default function Protection() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Protection (NDR)</h1>
          <p className="text-muted-foreground mt-2">
            Détection et réponse aux menaces réseau en temps réel
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Activer Mode Strict
          </Button>
          <Button className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Analyser Maintenant
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" />
              Trafic Réseau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.4 TB</div>
            <p className="text-sm text-muted-foreground">Analysé ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Menaces Bloquées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-sm text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4 text-amber-500" />
              Sondes Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12/12</div>
            <p className="text-sm text-muted-foreground">Tous opérationnels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              CTI Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-sm text-muted-foreground">Connectées</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NetworkActivity />
        <RecentThreats />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventaire des Actifs Surveillés</CardTitle>
          <CardDescription>
            Liste des ressources réseau sous protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">Serveur Web Principal</h3>
                  <p className="text-sm text-neutral-500">192.168.1.10</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Protégé</span>
              </div>
            </div>
            
            <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-amber-500" />
                <div>
                  <h3 className="font-medium">Base de données principale</h3>
                  <p className="text-sm text-neutral-500">192.168.1.20</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Protégé</span>
              </div>
            </div>
            
            <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-medium">Passerelle Internet</h3>
                  <p className="text-sm text-neutral-500">192.168.1.1</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Protégé</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button variant="outline">Voir tous les actifs (28)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
