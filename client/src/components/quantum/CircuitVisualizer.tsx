import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Download } from "lucide-react";

// Type pour les images générées
interface GeneratedImages {
  circuitUrl?: string;
  histogramUrl?: string;
}

// Props du composant
interface CircuitVisualizerProps {
  onImageGenerated?: (images: GeneratedImages) => void;
}

export function CircuitVisualizer({ onImageGenerated }: CircuitVisualizerProps) {
  // État pour les paramètres du circuit
  const [params, setParams] = useState({
    qubits: 4,
    featureMap: "zz",
    ansatz: "real",
    depth: 2,
    shots: 1024,
    anomaly: false
  });

  // État pour les images générées
  const [images, setImages] = useState<GeneratedImages>({});
  
  // État pour suivre l'onglet actif
  const [activeTab, setActiveTab] = useState("circuit");

  // Requête pour générer le circuit
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["/api/quantum/visualize", params],
    queryFn: async () => {
      const response = await fetch("/api/quantum/visualize?" + new URLSearchParams({
        qubits: params.qubits.toString(),
        feature_map: params.featureMap,
        ansatz: params.ansatz,
        depth: params.depth.toString(),
        shots: params.shots.toString(),
        anomaly: params.anomaly.toString()
      }));
      
      if (!response.ok) {
        throw new Error("Erreur lors de la génération du circuit");
      }
      
      const result = await response.json();
      
      // Mettre à jour les images et notifier via le callback
      const newImages = {
        circuitUrl: result.circuit_image_url,
        histogramUrl: result.histogram_image_url
      };
      
      setImages(newImages);
      
      if (onImageGenerated) {
        onImageGenerated(newImages);
      }
      
      return result;
    },
    enabled: false, // Ne pas exécuter automatiquement
  });

  // Fonction pour télécharger l'image
  const downloadImage = (url: string | undefined, filename: string) => {
    if (!url) return;
    
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="circuit" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[400px] mx-auto">
          <TabsTrigger value="circuit">Circuit</TabsTrigger>
          <TabsTrigger value="histogram">Histogramme</TabsTrigger>
        </TabsList>
        
        <TabsContent value="circuit" className="mt-4">
          <div className="flex justify-center">
            {images.circuitUrl ? (
              <Card className="w-full max-w-3xl overflow-hidden">
                <CardContent className="p-0 relative">
                  <img 
                    src={images.circuitUrl} 
                    alt="Circuit quantique" 
                    className="w-full object-contain"
                  />
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="absolute bottom-4 right-4"
                    onClick={() => downloadImage(images.circuitUrl, "circuit-quantique.png")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-64 w-full max-w-3xl bg-slate-100 dark:bg-slate-800 rounded-md">
                {isLoading ? (
                  <Loader2 className="h-16 w-16 text-slate-400 animate-spin" />
                ) : (
                  <div className="text-center">
                    <RefreshCw className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">Générez un circuit quantique avec les paramètres ci-dessous</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="histogram" className="mt-4">
          <div className="flex justify-center">
            {images.histogramUrl ? (
              <Card className="w-full max-w-3xl overflow-hidden">
                <CardContent className="p-0 relative">
                  <img 
                    src={images.histogramUrl} 
                    alt="Histogramme des résultats" 
                    className="w-full object-contain"
                  />
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="absolute bottom-4 right-4"
                    onClick={() => downloadImage(images.histogramUrl, "histogramme-quantique.png")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-64 w-full max-w-3xl bg-slate-100 dark:bg-slate-800 rounded-md">
                {isLoading ? (
                  <Loader2 className="h-16 w-16 text-slate-400 animate-spin" />
                ) : (
                  <div className="text-center">
                    <RefreshCw className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">Générez un histogramme avec les paramètres ci-dessous</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Contrôles pour les paramètres */}
      <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="qubits">Nombre de qubits: {params.qubits}</Label>
              </div>
              <Slider 
                id="qubits"
                min={2} 
                max={8} 
                step={1} 
                value={[params.qubits]} 
                onValueChange={(value) => setParams({...params, qubits: value[0]})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feature-map">Feature Map</Label>
              <Select 
                value={params.featureMap} 
                onValueChange={(value) => setParams({...params, featureMap: value})}
              >
                <SelectTrigger id="feature-map">
                  <SelectValue placeholder="Sélectionner le type de feature map" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zz">ZZ Feature Map</SelectItem>
                  <SelectItem value="pauli">Pauli Feature Map</SelectItem>
                  <SelectItem value="amplitude">Amplitude Embedding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ansatz">Ansatz</Label>
              <Select 
                value={params.ansatz} 
                onValueChange={(value) => setParams({...params, ansatz: value})}
              >
                <SelectTrigger id="ansatz">
                  <SelectValue placeholder="Sélectionner le type d'ansatz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real">Real Amplitudes</SelectItem>
                  <SelectItem value="efficient">Efficient SU2</SelectItem>
                  <SelectItem value="twolocal">Two Local</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="depth">Profondeur du circuit: {params.depth}</Label>
              </div>
              <Slider 
                id="depth"
                min={1} 
                max={4} 
                step={1} 
                value={[params.depth]} 
                onValueChange={(value) => setParams({...params, depth: value[0]})}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="shots">Nombre de shots: {params.shots}</Label>
              </div>
              <Slider 
                id="shots"
                min={100} 
                max={8192} 
                step={100} 
                value={[params.shots]} 
                onValueChange={(value) => setParams({...params, shots: value[0]})}
              />
            </div>
            
            <div className="flex items-center space-x-2 mt-6">
              <Switch 
                id="anomaly" 
                checked={params.anomaly} 
                onCheckedChange={(checked) => setParams({...params, anomaly: checked})} 
              />
              <Label htmlFor="anomaly">Simuler une anomalie</Label>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Générer la visualisation
          </Button>
        </div>
      </div>
      
      {isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md text-red-600 dark:text-red-400">
          Une erreur est survenue lors de la génération du circuit. Veuillez réessayer.
        </div>
      )}
    </div>
  );
}