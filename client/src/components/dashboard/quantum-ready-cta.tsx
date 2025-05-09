import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smile } from "lucide-react";

export function QuantumReadyCTA() {
  return (
    <Card className="relative shadow overflow-hidden border border-accent-100">
      <div className="quantum-gradient absolute top-0 left-0 right-0 h-2"></div>
      <CardContent className="px-6 py-5">
        <div className="flex items-center mb-4">
          <Smile className="h-8 w-8 text-accent-500" />
          <h3 className="ml-2 text-lg font-medium text-neutral-900">QuantumEyes évolue</h3>
        </div>
        <p className="text-sm text-neutral-700 mb-4">
          Notre plateforme intègre progressivement des algorithmes de Quantum Machine Learning (QML) pour améliorer la détection des menaces et anticiper les futures cyberattaques.
        </p>
        <Button 
          variant="accent" 
          className="bg-accent-600 hover:bg-accent-700 text-white"
        >
          En savoir plus
        </Button>
      </CardContent>
    </Card>
  );
}
