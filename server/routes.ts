import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Organizations
  app.get('/api/organizations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizations = await storage.getUserOrganizations(userId);
      res.json({ organizations });
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });

  app.get('/api/organizations/:slug', isAuthenticated, async (req: any, res) => {
    try {
      const organization = await storage.getOrganizationBySlug(req.params.slug);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Vérifier si l'utilisateur a accès à cette organisation
      const userId = req.user.claims.sub;
      const userOrgs = await storage.getUserOrganizations(userId);
      const hasAccess = userOrgs.some(org => org.id === organization.id);

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json({ organization });
    } catch (error) {
      console.error("Error fetching organization:", error);
      res.status(500).json({ message: "Failed to fetch organization" });
    }
  });

  // Security Metrics (avec contexte d'organisation)
  app.get("/api/security-metrics", isAuthenticated, async (req: any, res) => {
    try {
      // Par défaut, utiliser la première organisation de l'utilisateur
      const userId = req.user.claims.sub;
      const orgId = req.query.organizationId ? parseInt(req.query.organizationId as string) : null;
      
      let organizationId: number;
      
      if (orgId) {
        // Vérifier l'accès à l'organisation demandée
        const userOrgs = await storage.getUserOrganizations(userId);
        const hasAccess = userOrgs.some(org => org.id === orgId);
        
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied to this organization" });
        }
        
        organizationId = orgId;
      } else {
        // Utiliser la première organisation de l'utilisateur
        const userOrgs = await storage.getUserOrganizations(userId);
        if (userOrgs.length === 0) {
          return res.status(404).json({ message: "No organizations found" });
        }
        organizationId = userOrgs[0].id;
      }
      
      const metrics = await storage.getSecurityMetrics(organizationId);
      res.json({ metrics });
    } catch (error) {
      console.error("Error fetching security metrics:", error);
      res.status(500).json({ message: "Failed to fetch security metrics" });
    }
  });

  // Get cyber maturity data
  app.get("/api/cyber-maturity", isAuthenticated, async (req: any, res) => {
    try {
      // Par défaut, utiliser la première organisation de l'utilisateur
      const userId = req.user.claims.sub;
      const orgId = req.query.organizationId ? parseInt(req.query.organizationId as string) : null;
      
      let organizationId: number;
      
      if (orgId) {
        // Vérifier l'accès à l'organisation demandée
        const userOrgs = await storage.getUserOrganizations(userId);
        const hasAccess = userOrgs.some(org => org.id === orgId);
        
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied to this organization" });
        }
        
        organizationId = orgId;
      } else {
        // Utiliser la première organisation de l'utilisateur
        const userOrgs = await storage.getUserOrganizations(userId);
        if (userOrgs.length === 0) {
          return res.status(404).json({ message: "No organizations found" });
        }
        organizationId = userOrgs[0].id;
      }
      
      const maturityData = await storage.getCyberMaturity(organizationId);
      res.json({
        categories: [
          { name: "Gouvernance", score: maturityData.governance, maxScore: 100 },
          { name: "Protection", score: maturityData.protection, maxScore: 100 },
          { name: "Détection", score: maturityData.detection, maxScore: 100 },
          { name: "Réponse", score: maturityData.response, maxScore: 100 },
          { name: "Récupération", score: maturityData.recovery, maxScore: 100 },
        ],
        overallScore: maturityData.overallScore,
        lastUpdated: maturityData.lastUpdated,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching cyber maturity data" });
    }
  });

  // Get recent threats
  app.get("/api/threats/recent", isAuthenticated, async (req: any, res) => {
    try {
      // Par défaut, utiliser la première organisation de l'utilisateur
      const userId = req.user.claims.sub;
      const orgId = req.query.organizationId ? parseInt(req.query.organizationId as string) : null;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      let organizationId: number;
      
      if (orgId) {
        // Vérifier l'accès à l'organisation demandée
        const userOrgs = await storage.getUserOrganizations(userId);
        const hasAccess = userOrgs.some(org => org.id === orgId);
        
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied to this organization" });
        }
        
        organizationId = orgId;
      } else {
        // Utiliser la première organisation de l'utilisateur
        const userOrgs = await storage.getUserOrganizations(userId);
        if (userOrgs.length === 0) {
          return res.status(404).json({ message: "No organizations found" });
        }
        organizationId = userOrgs[0].id;
      }
      
      const threats = await storage.getRecentThreats(organizationId, limit);
      res.json({ threats });
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent threats" });
    }
  });

  // Get network activity data
  app.get("/api/network-activity", isAuthenticated, async (req: any, res) => {
    try {
      // Par défaut, utiliser la première organisation de l'utilisateur
      const userId = req.user.claims.sub;
      const orgId = req.query.organizationId ? parseInt(req.query.organizationId as string) : null;
      
      let organizationId: number;
      
      if (orgId) {
        // Vérifier l'accès à l'organisation demandée
        const userOrgs = await storage.getUserOrganizations(userId);
        const hasAccess = userOrgs.some(org => org.id === orgId);
        
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied to this organization" });
        }
        
        organizationId = orgId;
      } else {
        // Utiliser la première organisation de l'utilisateur
        const userOrgs = await storage.getUserOrganizations(userId);
        if (userOrgs.length === 0) {
          return res.status(404).json({ message: "No organizations found" });
        }
        organizationId = userOrgs[0].id;
      }
      
      const networkData = await storage.getNetworkActivity(organizationId);
      res.json({ metrics: networkData });
    } catch (error) {
      res.status(500).json({ message: "Error fetching network activity" });
    }
  });

  // Get vulnerabilities
  app.get("/api/vulnerabilities", isAuthenticated, async (req: any, res) => {
    try {
      // Par défaut, utiliser la première organisation de l'utilisateur
      const userId = req.user.claims.sub;
      const orgId = req.query.organizationId ? parseInt(req.query.organizationId as string) : null;
      
      let organizationId: number;
      
      if (orgId) {
        // Vérifier l'accès à l'organisation demandée
        const userOrgs = await storage.getUserOrganizations(userId);
        const hasAccess = userOrgs.some(org => org.id === orgId);
        
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied to this organization" });
        }
        
        organizationId = orgId;
      } else {
        // Utiliser la première organisation de l'utilisateur
        const userOrgs = await storage.getUserOrganizations(userId);
        if (userOrgs.length === 0) {
          return res.status(404).json({ message: "No organizations found" });
        }
        organizationId = userOrgs[0].id;
      }
      
      const vulnerabilities = await storage.getVulnerabilities(organizationId);
      const { criticalVulns, highVulns, mediumVulns, lowVulns } = categorizeVulnerabilities(vulnerabilities);
      
      res.json({
        data: {
          counts: {
            critical: criticalVulns.length,
            high: highVulns.length,
            medium: mediumVulns.length,
            low: lowVulns.length,
          },
          criticalVulnerabilities: criticalVulns,
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching vulnerabilities" });
    }
  });

  // Create an HTTP server instance
  const httpServer = createServer(app);

  return httpServer;
}

// Helper function to categorize vulnerabilities by severity
function categorizeVulnerabilities(vulnerabilities: any[]) {
  const criticalVulns = vulnerabilities.filter(v => v.severity === "critical");
  const highVulns = vulnerabilities.filter(v => v.severity === "high");
  const mediumVulns = vulnerabilities.filter(v => v.severity === "medium");
  const lowVulns = vulnerabilities.filter(v => v.severity === "low");
  
  return { criticalVulns, highVulns, mediumVulns, lowVulns };
}
