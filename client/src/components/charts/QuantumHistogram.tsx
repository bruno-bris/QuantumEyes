import { Card, CardContent } from "@/components/ui/card";
import { Network } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";

interface HistogramDataItem {
  state: string;
  count: number;
  isAnomaly?: boolean;
}

interface QuantumHistogramProps {
  data?: HistogramDataItem[] | null;
  height?: number;
  maxItems?: number;
}

/**
 * Prépare les données d'histogramme pour l'affichage avec Recharts
 */
const formatHistogramData = (histogramData?: HistogramDataItem[] | null, maxItems = 16) => {
  if (!histogramData || histogramData.length === 0) {
    // Données de démonstration si aucune donnée n'est disponible
    return [
      { state: "0000", count: 250, name: "|0000⟩", isAnomaly: false },
      { state: "0001", count: 50, name: "|0001⟩", isAnomaly: false },
      { state: "0010", count: 75, name: "|0010⟩", isAnomaly: false },
      { state: "0011", count: 100, name: "|0011⟩", isAnomaly: false },
      { state: "0100", count: 25, name: "|0100⟩", isAnomaly: false },
      { state: "0101", count: 30, name: "|0101⟩", isAnomaly: false },
      { state: "0110", count: 20, name: "|0110⟩", isAnomaly: false },
      { state: "0111", count: 15, name: "|0111⟩", isAnomaly: false },
      { state: "1000", count: 40, name: "|1000⟩", isAnomaly: false },
      { state: "1001", count: 35, name: "|1001⟩", isAnomaly: false },
      { state: "1010", count: 125, name: "|1010⟩", isAnomaly: false },
      { state: "1011", count: 45, name: "|1011⟩", isAnomaly: false },
      { state: "1100", count: 60, name: "|1100⟩", isAnomaly: false },
      { state: "1101", count: 50, name: "|1101⟩", isAnomaly: false },
      { state: "1110", count: 55, name: "|1110⟩", isAnomaly: false },
      { state: "1111", count: 400, name: "|1111⟩", isAnomaly: true }
    ];
  }

  // Trier par comptage décroissant et limiter le nombre d'éléments
  return histogramData
    .sort((a, b) => b.count - a.count)
    .slice(0, maxItems)
    .map(item => ({
      ...item, 
      name: `|${item.state}⟩`,
      isAnomaly: item.isAnomaly || false
    }));
};

/**
 * Composant d'histogramme pour les résultats de mesure quantique
 */
export const QuantumHistogram = ({ data, height = 300, maxItems = 16 }: QuantumHistogramProps) => {
  const chartData = formatHistogramData(data, maxItems);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 w-full bg-slate-100 dark:bg-slate-800 rounded-md">
        <Network className="h-16 w-16 text-slate-400" />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 0,
          bottom: 60
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          height={60} 
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`${value} mesures`, "Occurrences"]}
          labelFormatter={(label) => `État: ${label}`}
        />
        <Legend verticalAlign="top" height={36} />
        <Bar 
          dataKey="count" 
          name="Nombre de mesures" 
          fill="#8884d8"
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.isAnomaly ? "#ef4444" : "#8884d8"} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};