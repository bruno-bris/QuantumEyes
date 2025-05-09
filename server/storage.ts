import {
  users, type User, type InsertUser,
  type CyberMaturity, type SecurityMetrics, type Threat,
  type NetworkActivity, type Vulnerability,
  type InsertThreat, type InsertNetworkActivity, type InsertVulnerability,
  type InsertCyberMaturity, type InsertSecurityMetrics
} from "@shared/schema";

// Storage interface for QuantumEyes application
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Security metrics
  getSecurityMetrics(): Promise<SecurityMetrics>;
  createSecurityMetrics(metrics: InsertSecurityMetrics): Promise<SecurityMetrics>;
  
  // Cyber maturity
  getCyberMaturity(): Promise<CyberMaturity>;
  updateCyberMaturity(maturity: InsertCyberMaturity): Promise<CyberMaturity>;
  
  // Threat management
  getRecentThreats(limit?: number): Promise<Threat[]>;
  createThreat(threat: InsertThreat): Promise<Threat>;
  updateThreatStatus(id: number, status: string): Promise<Threat | undefined>;
  
  // Network activity
  getNetworkActivity(): Promise<any>; // Returns network activity with traffic points
  recordNetworkActivity(activity: InsertNetworkActivity): Promise<NetworkActivity>;
  
  // Vulnerabilities
  getVulnerabilities(): Promise<Vulnerability[]>;
  createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
  updateVulnerabilityStatus(id: number, status: string): Promise<Vulnerability | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private securityMetrics: SecurityMetrics;
  private cyberMaturity: CyberMaturity;
  private threats: Map<number, Threat>;
  private networkActivity: NetworkActivity[];
  private vulnerabilities: Map<number, Vulnerability>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.threats = new Map();
    this.vulnerabilities = new Map();
    this.networkActivity = [];
    this.currentId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample security metrics
    this.securityMetrics = {
      id: 1,
      organizationId: 1,
      securityScore: 72,
      securityScoreChange: 4,
      activeThreats: 3,
      activeThreatsChange: 1,
      vulnerabilities: 12,
      vulnerabilitiesChange: -3,
      monitoredAssets: 28,
      timestamp: new Date(),
    };

    // Sample cyber maturity
    this.cyberMaturity = {
      id: 1,
      organizationId: 1,
      governance: 75,
      protection: 60,
      detection: 70,
      response: 50,
      recovery: 55,
      overallScore: 72,
      lastUpdated: new Date(),
    };

    // Sample threats
    const sampleThreats: Threat[] = [
      {
        id: 1,
        organizationId: 1,
        title: "Tentative de connexion suspecte",
        description: "Multiples tentatives de connexion échouées détectées depuis une adresse IP non reconnue. Possible attaque par force brute.",
        level: "critical",
        source: "IP: 185.173.92.14",
        timestamp: new Date(Date.now() - 28 * 60 * 1000), // 28 minutes ago
        status: "active",
        icon: "alert",
        actions: {
          primary: "Voir les détails",
          secondary: ["Bloquer l'IP", "Ignorer"]
        },
      },
      {
        id: 2,
        organizationId: 1,
        title: "Email de phishing détecté",
        description: "Campagne de phishing potentielle ciblant le département financier. Les emails contiennent des liens malveillants imitant le portail bancaire de l'entreprise.",
        level: "warning",
        source: "Ciblant 3 utilisateurs",
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        status: "active",
        icon: "mail",
        actions: {
          primary: "Voir les détails",
          secondary: ["Bloquer l'expéditeur"]
        },
      },
      {
        id: 3,
        organizationId: 1,
        title: "Activité de scan réseau",
        description: "Activité de scan sur les ports 22, 80, 443, 3389. Pourrait indiquer une phase de reconnaissance avant une tentative d'attaque.",
        level: "info",
        source: "Multiples ports",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        status: "active",
        icon: "server",
        actions: {
          primary: "Voir les détails",
          secondary: ["Marquer comme résolu"]
        },
      },
      {
        id: 4,
        organizationId: 1,
        title: "Vulnérabilité corrigée",
        description: "La mise à jour de sécurité a été déployée avec succès sur tous les systèmes affectés. Vulnérabilité Microsoft Office \"Follina\" désormais corrigée.",
        level: "success",
        source: "CVE-2022-30190",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        status: "resolved",
        icon: "shield",
        actions: {
          primary: "Voir les détails",
          secondary: []
        },
      }
    ];

    sampleThreats.forEach(threat => {
      this.threats.set(threat.id, threat);
    });

    // Sample vulnerabilities
    const sampleVulnerabilities: Vulnerability[] = [
      {
        id: 1,
        organizationId: 1,
        cveId: "CVE-2023-1234",
        title: "Vulnérabilité d'exécution de code à distance dans Apache 2.4.52",
        description: "Vulnérabilité d'exécution de code à distance dans Apache 2.4.52",
        severity: "critical",
        affectedSystem: "Serveur Web",
        status: "open",
        discoveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        resolvedAt: null,
      },
      {
        id: 2,
        organizationId: 1,
        cveId: "CVE-2023-5678",
        title: "Faille d'authentification dans PostgreSQL 14.2",
        description: "Faille d'authentification dans PostgreSQL 14.2",
        severity: "critical",
        affectedSystem: "Base de données",
        status: "open",
        discoveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        resolvedAt: null,
      },
      {
        id: 3,
        organizationId: 1,
        cveId: "CVE-2023-9876",
        title: "Vulnérabilité XSS dans le portail client",
        description: "Possibilité d'injecter du code JavaScript dans le portail client",
        severity: "high",
        affectedSystem: "Portail Web",
        status: "in_progress",
        discoveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        resolvedAt: null,
      },
      {
        id: 4,
        organizationId: 1,
        cveId: "CVE-2023-2468",
        title: "Élévation de privilèges dans Windows Server 2019",
        description: "Possibilité d'obtenir des droits administrateur",
        severity: "critical",
        affectedSystem: "Serveur Windows",
        status: "open",
        discoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        resolvedAt: null,
      }
    ];

    sampleVulnerabilities.forEach(vuln => {
      this.vulnerabilities.set(vuln.id, vuln);
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Security Metrics Methods
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    return this.securityMetrics;
  }

  async createSecurityMetrics(metrics: InsertSecurityMetrics): Promise<SecurityMetrics> {
    const id = this.currentId++;
    const newMetrics: SecurityMetrics = { ...metrics, id, timestamp: new Date() };
    this.securityMetrics = newMetrics;
    return newMetrics;
  }

  // Cyber Maturity Methods
  async getCyberMaturity(): Promise<CyberMaturity> {
    return this.cyberMaturity;
  }

  async updateCyberMaturity(maturity: InsertCyberMaturity): Promise<CyberMaturity> {
    const id = this.cyberMaturity?.id || this.currentId++;
    const updatedMaturity: CyberMaturity = { 
      ...maturity, 
      id, 
      lastUpdated: new Date() 
    };
    this.cyberMaturity = updatedMaturity;
    return updatedMaturity;
  }

  // Threat Methods
  async getRecentThreats(limit: number = 10): Promise<Threat[]> {
    return Array.from(this.threats.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createThreat(threat: InsertThreat): Promise<Threat> {
    const id = this.currentId++;
    const newThreat: Threat = { 
      ...threat, 
      id, 
      timestamp: new Date() 
    };
    this.threats.set(id, newThreat);
    return newThreat;
  }

  async updateThreatStatus(id: number, status: string): Promise<Threat | undefined> {
    const threat = this.threats.get(id);
    if (!threat) return undefined;
    
    const updatedThreat = { ...threat, status };
    this.threats.set(id, updatedThreat);
    return updatedThreat;
  }

  // Network Activity Methods
  async getNetworkActivity(): Promise<any> {
    // Generate network activity data with traffic points
    const now = Date.now();
    const trafficPoints = [];
    
    for (let i = 0; i < 25; i++) {
      // Base value around 50-150
      let value = 50 + Math.sin(i * 0.5) * 50 + Math.random() * 50;
      
      // Add anomaly point at index 18
      const anomaly = i === 18;
      if (anomaly) {
        value = 180; // Spike value
      }
      
      trafficPoints.push({
        value,
        timestamp: now - (24 - i) * 15 * 60 * 1000, // Each point is 15 minutes apart
        anomaly
      });
    }
    
    return {
      trafficPoints,
      inboundTraffic: 3.2,
      outboundTraffic: 1.8,
      activeConnections: 247,
      anomalies: [
        {
          id: "1",
          title: "Pic de trafic inhabituel",
          description: "Augmentation soudaine du trafic UDP à 11:42. 420% au-dessus de la référence normale."
        }
      ]
    };
  }

  async recordNetworkActivity(activity: InsertNetworkActivity): Promise<NetworkActivity> {
    const id = this.currentId++;
    const newActivity: NetworkActivity = { 
      ...activity, 
      id, 
      timestamp: new Date() 
    };
    this.networkActivity.push(newActivity);
    return newActivity;
  }

  // Vulnerability Methods
  async getVulnerabilities(): Promise<Vulnerability[]> {
    return Array.from(this.vulnerabilities.values());
  }

  async createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability> {
    const id = this.currentId++;
    const newVulnerability: Vulnerability = { 
      ...vulnerability, 
      id, 
      discoveredAt: new Date(),
      resolvedAt: null
    };
    this.vulnerabilities.set(id, newVulnerability);
    return newVulnerability;
  }

  async updateVulnerabilityStatus(id: number, status: string): Promise<Vulnerability | undefined> {
    const vulnerability = this.vulnerabilities.get(id);
    if (!vulnerability) return undefined;
    
    const updatedVulnerability: Vulnerability = { 
      ...vulnerability, 
      status,
      resolvedAt: status === 'resolved' ? new Date() : vulnerability.resolvedAt
    };
    this.vulnerabilities.set(id, updatedVulnerability);
    return updatedVulnerability;
  }
}

export const storage = new MemStorage();
