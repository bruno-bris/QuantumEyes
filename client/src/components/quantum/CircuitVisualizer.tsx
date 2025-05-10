import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { Loader2, Download, RotateCw, RefreshCw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_NUM_QUBITS = 4;
const DEFAULT_FEATURE_MAP = "zz";
const DEFAULT_ANSATZ = "real";
const DEFAULT_NUM_SHOTS = 1024;

interface CircuitVisualizerProps {
  onImageGenerated?: (images: { circuitUrl?: string; histogramUrl?: string }) => void;
}

export function CircuitVisualizer({ onImageGenerated }: CircuitVisualizerProps) {
  const [activeTab, setActiveTab] = useState("circuit");
  const [numQubits, setNumQubits] = useState(DEFAULT_NUM_QUBITS);
  const [featureMap, setFeatureMap] = useState(DEFAULT_FEATURE_MAP);
  const [ansatz, setAnsatz] = useState(DEFAULT_ANSATZ);
  const [numShots, setNumShots] = useState(DEFAULT_NUM_SHOTS);
  const [anomaly, setAnomaly] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [circuitImage, setCircuitImage] = useState<string | null>(null);
  const [histogramImage, setHistogramImage] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  const generateCircuit = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/quantum/visualize/circuit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          numQubits,
          featureMap,
          ansatz
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCircuitImage(data.circuitImageUrl);
        toast({
          title: "Circuit généré",
          description: "Le circuit quantique a été généré avec succès."
        });
        
        if (onImageGenerated) {
          onImageGenerated({ circuitUrl: data.circuitImageUrl });
        }
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur est survenue lors de la génération du circuit.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération du circuit:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du circuit.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateHistogram = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/quantum/visualize/histogram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          numQubits,
          numShots,
          anomaly
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setHistogramImage(data.histogramImageUrl);
        toast({
          title: "Histogramme généré",
          description: "L'histogramme quantique a été généré avec succès."
        });
        
        if (onImageGenerated) {
          onImageGenerated({ histogramUrl: data.histogramImageUrl });
        }
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur est survenue lors de la génération de l'histogramme.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération de l'histogramme:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de l'histogramme.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateComplete = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/quantum/visualize/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          numQubits,
          featureMap,
          ansatz,
          numShots,
          anomaly
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCircuitImage(data.circuitImageUrl);
        setHistogramImage(data.histogramImageUrl);
        toast({
          title: "Visualisations générées",
          description: "Les visualisations quantiques ont été générées avec succès."
        });
        
        if (onImageGenerated) {
          onImageGenerated({ 
            circuitUrl: data.circuitImageUrl,
            histogramUrl: data.histogramImageUrl
          });
        }
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur est survenue lors de la génération des visualisations.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération des visualisations:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération des visualisations.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Visualisation Quantique</CardTitle>
        <CardDescription>
          Générez des visualisations personnalisées de circuits quantiques et d'histogrammes de résultats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="circuit">Circuit Quantique</TabsTrigger>
            <TabsTrigger value="histogram">Histogramme</TabsTrigger>
            <TabsTrigger value="params">Paramètres</TabsTrigger>
          </TabsList>
          
          <TabsContent value="circuit">
            <div className="flex flex-col items-center gap-4">
              {circuitImage ? (
                <div className="w-full overflow-hidden border rounded-lg">
                  <img 
                    src={circuitImage} 
                    alt="Circuit quantique" 
                    className="w-full max-h-[500px] object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-64 p-8 border rounded-lg bg-slate-50 dark:bg-slate-900">
                  <RefreshCw className="w-12 h-12 mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Aucun circuit généré. Configurez les paramètres et cliquez sur "Générer" pour créer une visualisation.
                  </p>
                </div>
              )}
              
              <div className="flex w-full gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={generateCircuit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-4 h-4 mr-2" />
                      Générer un circuit
                    </>
                  )}
                </Button>
                {circuitImage && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(circuitImage, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="histogram">
            <div className="flex flex-col items-center gap-4">
              {histogramImage ? (
                <div className="w-full overflow-hidden border rounded-lg">
                  <img 
                    src={histogramImage} 
                    alt="Histogramme quantique" 
                    className="w-full max-h-[500px] object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-64 p-8 border rounded-lg bg-slate-50 dark:bg-slate-900">
                  <RefreshCw className="w-12 h-12 mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Aucun histogramme généré. Configurez les paramètres et cliquez sur "Générer" pour créer une visualisation.
                  </p>
                </div>
              )}
              
              <div className="flex w-full gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={generateHistogram}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-4 h-4 mr-2" />
                      Générer un histogramme
                    </>
                  )}
                </Button>
                {histogramImage && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(histogramImage, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="params">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre de qubits</Label>
                  <div className="grid items-center grid-cols-3 gap-4">
                    <div className="px-2 py-1 text-center border rounded-md col-span-1">
                      {numQubits}
                    </div>
                    <div className="col-span-2">
                      <Slider
                        value={[numQubits]}
                        onValueChange={(values) => setNumQubits(values[0])}
                        min={2}
                        max={10}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Feature Map</Label>
                  <Select value={featureMap} onValueChange={setFeatureMap}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type de feature map" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zz">ZZ Feature Map</SelectItem>
                      <SelectItem value="pauli">Pauli Feature Map</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Type d'Ansatz</Label>
                  <Select value={ansatz} onValueChange={setAnsatz}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type d'ansatz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real">Real Amplitudes</SelectItem>
                      <SelectItem value="efficientsu2">Efficient SU2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre de shots</Label>
                  <div className="grid items-center grid-cols-3 gap-4">
                    <div className="px-2 py-1 text-center border rounded-md col-span-1">
                      {numShots}
                    </div>
                    <div className="col-span-2">
                      <Slider
                        value={[numShots]}
                        onValueChange={(values) => setNumShots(values[0])}
                        min={100}
                        max={5000}
                        step={100}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <Label htmlFor="anomaly-switch" className="flex-1">
                    Simuler des anomalies
                    <p className="text-xs text-muted-foreground mt-1">
                      Génère une distribution biaisée simulant des anomalies réseau
                    </p>
                  </Label>
                  <Switch
                    id="anomaly-switch"
                    checked={anomaly}
                    onCheckedChange={setAnomaly}
                  />
                </div>
                
                <div className="mt-8">
                  <Button 
                    className="w-full"
                    onClick={generateComplete}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Générer les deux visualisations
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <p className="text-xs text-muted-foreground">
          Les visualisations sont générées avec Qiskit et matplotlib.
        </p>
      </CardFooter>
    </Card>
  );
}