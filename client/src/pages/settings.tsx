import { UserCircle, Bell, Shield, Server, Globe, Building, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="container p-6 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les paramètres de votre compte et de votre organisation.
        </p>
      </div>

      <Tabs defaultValue="profile" className="mb-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span className="hidden md:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden md:inline">Organisation</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span className="hidden md:inline">Intégrations</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden md:inline">API</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Gérez les informations de votre profil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/4">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    placeholder="Prénom"
                    defaultValue={user?.firstName || ""}
                    className="mt-1"
                  />
                </div>
                <div className="w-full md:w-1/4">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    placeholder="Nom"
                    defaultValue={user?.lastName || ""}
                    className="mt-1"
                  />
                </div>
                <div className="w-full md:w-2/4">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    defaultValue={user?.email || ""}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <Label htmlFor="jobTitle">Fonction</Label>
                  <Input
                    id="jobTitle"
                    placeholder="Fonction"
                    className="mt-1"
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <Label htmlFor="department">Département</Label>
                  <Select>
                    <SelectTrigger id="department" className="mt-1">
                      <SelectValue placeholder="Sélectionnez un département" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">IT & Systèmes d'information</SelectItem>
                      <SelectItem value="security">Sécurité</SelectItem>
                      <SelectItem value="operations">Opérations</SelectItem>
                      <SelectItem value="management">Direction</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="hr">Ressources Humaines</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button>Enregistrer les modifications</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de l'organisation</CardTitle>
              <CardDescription>
                Gérez les paramètres de votre organisation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <Label htmlFor="orgName">Nom de l'organisation</Label>
                  <Input
                    id="orgName"
                    placeholder="Nom de l'organisation"
                    defaultValue="QuantumEyes Demo"
                    className="mt-1"
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <Label htmlFor="industry">Secteur d'activité</Label>
                  <Select defaultValue="technology">
                    <SelectTrigger id="industry" className="mt-1">
                      <SelectValue placeholder="Sélectionnez un secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technologie</SelectItem>
                      <SelectItem value="finance">Finance & Assurance</SelectItem>
                      <SelectItem value="healthcare">Santé</SelectItem>
                      <SelectItem value="manufacturing">Industrie</SelectItem>
                      <SelectItem value="retail">Commerce & Distribution</SelectItem>
                      <SelectItem value="energy">Énergie & Utilities</SelectItem>
                      <SelectItem value="public">Secteur Public</SelectItem>
                      <SelectItem value="education">Éducation</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <Label htmlFor="contactEmail">Email de contact</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="Email de contact"
                    defaultValue="contact@quantumeyes-demo.com"
                    className="mt-1"
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <Label htmlFor="size">Taille de l'organisation</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="size" className="mt-1">
                      <SelectValue placeholder="Taille" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="micro">Micro (1-9 employés)</SelectItem>
                      <SelectItem value="small">Petite (10-49 employés)</SelectItem>
                      <SelectItem value="medium">Moyenne (50-249 employés)</SelectItem>
                      <SelectItem value="large">Grande (250+ employés)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button>Enregistrer les modifications</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de notifications</CardTitle>
              <CardDescription>
                Personnalisez les notifications que vous souhaitez recevoir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="alerts">Alertes de sécurité</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des notifications pour les alertes de sécurité critiques.
                    </p>
                  </div>
                  <Switch id="alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="threats">Rapports de menaces</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des notifications pour les nouveaux rapports de menaces.
                    </p>
                  </div>
                  <Switch id="threats" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="vulnerabilities">Vulnérabilités</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des notifications pour les nouvelles vulnérabilités détectées.
                    </p>
                  </div>
                  <Switch id="vulnerabilities" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="updates">Mises à jour système</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des notifications pour les mises à jour de QuantumEyes.
                    </p>
                  </div>
                  <Switch id="updates" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reports">Rapports hebdomadaires</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des rapports hebdomadaires par email.
                    </p>
                  </div>
                  <Switch id="reports" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
              <CardDescription>
                Gérez les paramètres de sécurité de votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Authentification
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label htmlFor="mfa">Authentification à deux facteurs (2FA)</Label>
                        <p className="text-sm text-muted-foreground">
                          Sécurisez votre compte avec l'authentification à deux facteurs.
                        </p>
                      </div>
                      <Switch id="mfa" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <Label htmlFor="session">Déconnexion automatique</Label>
                        <p className="text-sm text-muted-foreground">
                          Déconnectez-vous automatiquement après une période d'inactivité.
                        </p>
                      </div>
                      <Select defaultValue="30">
                        <SelectTrigger id="session" className="w-[180px]">
                          <SelectValue placeholder="Délai d'inactivité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 heure</SelectItem>
                          <SelectItem value="120">2 heures</SelectItem>
                          <SelectItem value="never">Jamais</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="text-destructive">
                    Changer de mot de passe
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Intégrations</CardTitle>
              <CardDescription>
                Gérez les intégrations avec d'autres services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground">
                Les intégrations seront disponibles prochainement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Clés API</CardTitle>
              <CardDescription>
                Gérez vos clés API pour accéder aux services QuantumEyes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apikey">Clé API</Label>
                  <div className="flex mt-1">
                    <Input
                      id="apikey"
                      type="password"
                      value="••••••••••••••••••••••••••••••"
                      readOnly
                      className="rounded-r-none"
                    />
                    <Button variant="outline" className="rounded-l-none">
                      Afficher
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Cette clé vous donne accès à l'API QuantumEyes. Ne la partagez jamais avec des tiers.
                  </p>
                </div>
                <div className="pt-4 flex gap-2">
                  <Button variant="outline">Régénérer la clé</Button>
                  <Button variant="outline">Copier la clé</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}