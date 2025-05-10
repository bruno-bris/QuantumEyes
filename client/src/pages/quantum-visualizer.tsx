import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircuitVisualizer } from "@/components/quantum/CircuitVisualizer";

export default function QuantumVisualizerPage() {
  return (
    <div className="container p-6 mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/reports">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Retour aux rapports
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold">Visualiseur de Circuits Quantiques</h1>
        <p className="mt-4 text-muted-foreground">
          Générez, personnalisez et explorez les visualisations de circuits quantiques et d'histogrammes de résultats pour mieux comprendre le fonctionnement du QML.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Générateur de visualisations</CardTitle>
            <CardDescription>
              Configurez les paramètres du circuit quantique et générez des visualisations interactives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CircuitVisualizer 
              onImageGenerated={(images) => {
                console.log("Nouvelles images générées:", images);
              }}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>À propos des Feature Maps</CardTitle>
              <CardDescription>Comprendre l'encodage des données dans les circuits quantiques</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Les feature maps sont des circuits quantiques qui encodent des données classiques en états quantiques.
                La <span className="font-medium">ZZ Feature Map</span> utilise des portes de rotation Z (Rz) suivies 
                d'entanglements pour encoder les données, créant ainsi des espaces de dimensions supérieures dans l'espace de Hilbert.
                Cette technique est fondamentale pour l'avantage quantique en machine learning.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>À propos des Ansatz</CardTitle>
              <CardDescription>Comprendre les circuits variationnels pour l'optimisation quantique</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Un ansatz est un circuit quantique paramétré utilisé dans les algorithmes variationnels.
                Le type <span className="font-medium">Real Amplitudes</span> utilise des rotations paramétrées 
                et des entanglements pour créer un espace de recherche optimisable. L'algorithme ajuste ces 
                paramètres pour minimiser une fonction de coût, permettant ainsi l'apprentissage de modèles complexes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}