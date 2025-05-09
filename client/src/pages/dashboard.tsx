import { StatusOverview } from "@/components/dashboard/status-overview";
import { CyberMaturityRadar } from "@/components/dashboard/cyber-maturity-radar";
import { RecentThreats } from "@/components/dashboard/recent-threats";
import { NetworkActivity } from "@/components/dashboard/network-activity";
import { VulnerabilitiesSummary } from "@/components/dashboard/vulnerabilities-summary";
import { QuantumReadyCTA } from "@/components/dashboard/quantum-ready-cta";

export default function Dashboard() {
  return (
    <div>
      {/* Status Overview Section */}
      <StatusOverview />
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Maturité Cyber + Menaces Récentes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cyber Maturity Radar Chart */}
          <CyberMaturityRadar />
          
          {/* Recent Threats */}
          <RecentThreats />
        </div>
        
        {/* Right Column - Network Activity + Vulnerabilities */}
        <div className="space-y-6">
          {/* Network Activity */}
          <NetworkActivity />
          
          {/* Vulnerabilities Summary */}
          <VulnerabilitiesSummary />
          
          {/* CTA Card - Quantum-Ready */}
          <QuantumReadyCTA />
        </div>
      </div>
    </div>
  );
}
