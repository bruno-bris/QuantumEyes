import {
  users, organizations, organizationUsers,
  securityMetrics, cyberMaturity, threats, networkActivity, vulnerabilities,
  quantumConfigs, networkConnections, analysisResults, reports,
  type User, type Organization, type OrganizationUser,
  type SecurityMetrics, type CyberMaturity, type Threat,
  type NetworkActivity, type Vulnerability,
  type QuantumConfig, type NetworkConnection, type AnalysisResult, type Report,
  type InsertOrganization, type InsertOrganizationUser,
  type InsertThreat, type InsertNetworkActivity, type InsertVulnerability,
  type InsertCyberMaturity, type InsertSecurityMetrics,
  type InsertQuantumConfig, type InsertNetworkConnection, type InsertAnalysisResult,
  type InsertReport
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User Methods (Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: User): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Organization Methods
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug));
    return org;
  }

  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    const [org] = await db
      .insert(organizations)
      .values({
        ...orgData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return org;
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const results = await db
      .select({
        organization: organizations
      })
      .from(organizationUsers)
      .innerJoin(organizations, eq(organizationUsers.organizationId, organizations.id))
      .where(eq(organizationUsers.userId, userId));
    
    return results.map(result => result.organization);
  }

  // Organization User Methods
  async addUserToOrganization(orgUserData: InsertOrganizationUser): Promise<OrganizationUser> {
    const [orgUser] = await db
      .insert(organizationUsers)
      .values({
        ...orgUserData,
        createdAt: new Date(),
      })
      .returning();
    return orgUser;
  }

  async getUserRoleInOrganization(userId: string, orgId: number): Promise<string | undefined> {
    const [result] = await db
      .select({ role: organizationUsers.role })
      .from(organizationUsers)
      .where(
        and(
          eq(organizationUsers.userId, userId),
          eq(organizationUsers.organizationId, orgId)
        )
      );
    
    return result?.role;
  }

  // Security Metrics Methods
  async getSecurityMetrics(organizationId: number): Promise<SecurityMetrics> {
    const [metrics] = await db
      .select()
      .from(securityMetrics)
      .where(eq(securityMetrics.organizationId, organizationId))
      .orderBy(desc(securityMetrics.id))
      .limit(1);
    
    if (!metrics) {
      // Return default metrics
      return {
        id: 0,
        organizationId,
        securityScore: 72,
        securityScoreChange: 4,
        activeThreats: 3,
        activeThreatsChange: 1,
        vulnerabilities: 12,
        vulnerabilitiesChange: -3,
        monitoredAssets: 28,
        timestamp: new Date(),
      };
    }
    
    return metrics;
  }

  async createSecurityMetrics(metricsData: InsertSecurityMetrics): Promise<SecurityMetrics> {
    const [metrics] = await db
      .insert(securityMetrics)
      .values({
        ...metricsData,
        timestamp: new Date(),
      })
      .returning();
    return metrics;
  }

  // Cyber Maturity Methods
  async getCyberMaturity(organizationId: number): Promise<CyberMaturity> {
    const [maturity] = await db
      .select()
      .from(cyberMaturity)
      .where(eq(cyberMaturity.organizationId, organizationId))
      .orderBy(desc(cyberMaturity.id))
      .limit(1);
    
    if (!maturity) {
      // Return default maturity
      return {
        id: 0,
        organizationId,
        governance: 75,
        protection: 60,
        detection: 70,
        response: 50,
        recovery: 55,
        overallScore: 72,
        lastUpdated: new Date(),
      };
    }
    
    return maturity;
  }

  async updateCyberMaturity(maturityData: InsertCyberMaturity): Promise<CyberMaturity> {
    const [maturity] = await db
      .insert(cyberMaturity)
      .values({
        ...maturityData,
        lastUpdated: new Date(),
      })
      .returning();
    return maturity;
  }

  // Threat Methods
  async getRecentThreats(organizationId: number, limit: number = 10): Promise<Threat[]> {
    const threatsData = await db
      .select()
      .from(threats)
      .where(eq(threats.organizationId, organizationId))
      .orderBy(desc(threats.timestamp))
      .limit(limit);
    
    if (threatsData.length === 0) {
      // Return sample threats for demo purposes
      return [
        {
          id: 1,
          organizationId,
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
          organizationId,
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
        }
      ];
    }
    
    return threatsData;
  }

  async createThreat(threatData: InsertThreat): Promise<Threat> {
    const [threat] = await db
      .insert(threats)
      .values({
        ...threatData,
        timestamp: new Date(),
      })
      .returning();
    return threat;
  }

  async updateThreatStatus(id: number, status: string): Promise<Threat | undefined> {
    const [updatedThreat] = await db
      .update(threats)
      .set({ status })
      .where(eq(threats.id, id))
      .returning();
    return updatedThreat;
  }

  // Network Activity Methods
  async getNetworkActivity(organizationId: number): Promise<any> {
    // Generate network activity data with traffic points for demo purposes
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

  async recordNetworkActivity(activityData: InsertNetworkActivity): Promise<NetworkActivity> {
    const [activity] = await db
      .insert(networkActivity)
      .values({
        ...activityData,
        timestamp: new Date(),
      })
      .returning();
    return activity;
  }

  // Vulnerability Methods
  async getVulnerabilities(organizationId: number): Promise<Vulnerability[]> {
    const vulnData = await db
      .select()
      .from(vulnerabilities)
      .where(eq(vulnerabilities.organizationId, organizationId));
    
    if (vulnData.length === 0) {
      // Return sample vulnerabilities for demo purposes
      return [
        {
          id: 1,
          organizationId,
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
          organizationId,
          cveId: "CVE-2023-5678",
          title: "Faille d'authentification dans PostgreSQL 14.2",
          description: "Faille d'authentification dans PostgreSQL 14.2",
          severity: "critical",
          affectedSystem: "Base de données",
          status: "open",
          discoveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          resolvedAt: null,
        }
      ];
    }
    
    return vulnData;
  }

  async createVulnerability(vulnData: InsertVulnerability): Promise<Vulnerability> {
    const [vulnerability] = await db
      .insert(vulnerabilities)
      .values({
        ...vulnData,
        discoveredAt: new Date(),
      })
      .returning();
    return vulnerability;
  }

  async updateVulnerabilityStatus(id: number, status: string): Promise<Vulnerability | undefined> {
    const [updatedVuln] = await db
      .update(vulnerabilities)
      .set({ 
        status, 
        resolvedAt: status === 'resolved' ? new Date() : null 
      })
      .where(eq(vulnerabilities.id, id))
      .returning();
    return updatedVuln;
  }

  // Quantum Config Methods
  async getQuantumConfigs(organizationId: number): Promise<QuantumConfig[]> {
    const configs = await db
      .select()
      .from(quantumConfigs)
      .where(eq(quantumConfigs.organizationId, organizationId));
    
    if (configs.length === 0) {
      // Return a default configuration if none exist
      return [{
        id: 1,
        organizationId,
        name: "Configuration par défaut",
        qubits: 4,
        feature_map: "zz",
        ansatz: "real",
        shots: 1024,
        model_type: "qsvc",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }];
    }
    
    return configs;
  }
  
  async getQuantumConfig(id: number): Promise<QuantumConfig | undefined> {
    const [config] = await db
      .select()
      .from(quantumConfigs)
      .where(eq(quantumConfigs.id, id));
    
    return config;
  }
  
  async createQuantumConfig(configData: InsertQuantumConfig): Promise<QuantumConfig> {
    const [config] = await db
      .insert(quantumConfigs)
      .values({
        ...configData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return config;
  }
  
  async updateQuantumConfig(id: number, configData: Partial<InsertQuantumConfig>): Promise<QuantumConfig | undefined> {
    const [updatedConfig] = await db
      .update(quantumConfigs)
      .set({
        ...configData,
        updatedAt: new Date()
      })
      .where(eq(quantumConfigs.id, id))
      .returning();
    
    return updatedConfig;
  }
  
  async deleteQuantumConfig(id: number): Promise<boolean> {
    const result = await db
      .delete(quantumConfigs)
      .where(eq(quantumConfigs.id, id));
    
    return !!result;
  }
  
  // Network Connection Methods
  async getNetworkConnections(organizationId: number, limit: number = 50): Promise<NetworkConnection[]> {
    const connections = await db
      .select()
      .from(networkConnections)
      .where(eq(networkConnections.organizationId, organizationId))
      .orderBy(desc(networkConnections.timestamp))
      .limit(limit);
    
    return connections;
  }
  
  async getAnomalousConnections(organizationId: number): Promise<NetworkConnection[]> {
    const connections = await db
      .select()
      .from(networkConnections)
      .where(
        and(
          eq(networkConnections.organizationId, organizationId),
          eq(networkConnections.isAnomaly, true)
        )
      )
      .orderBy(desc(networkConnections.timestamp));
    
    return connections;
  }
  
  async createNetworkConnection(connectionData: InsertNetworkConnection): Promise<NetworkConnection> {
    const [connection] = await db
      .insert(networkConnections)
      .values({
        ...connectionData,
        timestamp: new Date()
      })
      .returning();
    
    return connection;
  }
  
  async createManyNetworkConnections(connectionsData: InsertNetworkConnection[]): Promise<NetworkConnection[]> {
    const connections = await db
      .insert(networkConnections)
      .values(
        connectionsData.map(conn => ({
          ...conn,
          timestamp: new Date()
        }))
      )
      .returning();
    
    return connections;
  }
  
  async deleteNetworkConnections(organizationId: number): Promise<boolean> {
    const result = await db
      .delete(networkConnections)
      .where(eq(networkConnections.organizationId, organizationId));
    
    return !!result;
  }
  
  // Analysis Results Methods
  async getAnalysisResults(organizationId: number, limit: number = 10): Promise<AnalysisResult[]> {
    const results = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.organizationId, organizationId))
      .orderBy(desc(analysisResults.timestamp))
      .limit(limit);
    
    return results;
  }
  
  async getAnalysisResult(id: number): Promise<AnalysisResult | undefined> {
    const [result] = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.id, id));
    
    return result;
  }
  
  async createAnalysisResult(resultData: InsertAnalysisResult): Promise<AnalysisResult> {
    const [result] = await db
      .insert(analysisResults)
      .values({
        ...resultData,
        timestamp: new Date()
      })
      .returning();
    
    return result;
  }

  // Reports Methods
  async getReports(organizationId: number, type?: string): Promise<Report[]> {
    let query = db
      .select()
      .from(reports)
      .where(eq(reports.organizationId, organizationId));
    
    if (type) {
      query = query.where(eq(reports.type, type));
    }
    
    const reportsData = await query.orderBy(desc(reports.createdAt));
    
    if (reportsData.length === 0) {
      // Return a sample report for demo purposes
      return [{
        id: 1,
        organizationId,
        title: "Rapport de sécurité mensuel",
        description: "Rapport d'analyse de sécurité globale pour le mois courant",
        type: "monthly",
        content: JSON.stringify({
          executiveSummary: "Résumé exécutif du rapport mensuel de cybersécurité",
          securityScore: 76,
          securityScoreChange: 4,
          highPriorityFindings: 3,
          mediumPriorityFindings: 8,
          lowPriorityFindings: 12,
          sections: [
            {
              title: "Gouvernance",
              score: 70,
              findings: ["Politique de sécurité mise à jour", "Formation de sensibilisation complétée"]
            },
            {
              title: "Protection",
              score: 65,
              findings: ["Vulnérabilités critiques dans les serveurs web", "Pare-feu correctement configuré"]
            },
            {
              title: "Détection",
              score: 80,
              findings: ["Système de détection d'intrusion amélioré", "Monitoring 24/7 en place"]
            },
            {
              title: "Réponse",
              score: 60,
              findings: ["Plan de réponse aux incidents incomplet", "Équipe de réponse formée"]
            }
          ]
        }),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        metrics: {
          securityScore: 76,
          threats: 5,
          vulnerabilities: 15
        },
        fileUrl: null,
        iconType: "shield"
      }];
    }
    
    return reportsData;
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id));
    
    return report;
  }

  async createReport(reportData: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values({
        ...reportData,
        createdAt: new Date()
      })
      .returning();
    
    return report;
  }

  async deleteReport(id: number): Promise<boolean> {
    const result = await db
      .delete(reports)
      .where(eq(reports.id, id));
    
    return !!result;
  }
}