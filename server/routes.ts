import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import axios from "axios";

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
  // Temporairement accessible sans authentification pour le développement
  app.get("/api/security-metrics", async (req: any, res) => {
    try {
      // En mode développement, utiliser l'ID d'organisation 1 par défaut si pas d'utilisateur connecté
      let organizationId = 1;
      
      // Si l'utilisateur est authentifié, utiliser son contexte d'organisation
      if (req.user && req.user.claims) {
        const userId = req.user.claims.sub;
        const orgId = req.query.organizationId ? parseInt(req.query.organizationId as string) : null;
        
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
          if (userOrgs.length > 0) {
            organizationId = userOrgs[0].id;
          }
        }
      }
      
      const metrics = await storage.getSecurityMetrics(organizationId);
      res.json({ metrics });
    } catch (error) {
      console.error("Error fetching security metrics:", error);
      res.status(500).json({ message: "Failed to fetch security metrics" });
    }
  });

  // Get cyber maturity data - temporairement accessible sans authentification
  app.get("/api/cyber-maturity", async (req: any, res) => {
    try {
      // En mode développement, utiliser l'ID d'organisation 1 par défaut si pas d'utilisateur connecté
      let organizationId = 1;
      
      // Si l'utilisateur est authentifié, utiliser son contexte d'organisation
      if (req.user && req.user.claims) {
        const userId = req.user.claims.sub;
        const orgId = req.query.organizationId ? parseInt(req.query.organizationId as string) : null;
        
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
          if (userOrgs.length > 0) {
            organizationId = userOrgs[0].id;
          }
        }
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

  // Get recent threats - temporairement accessible sans authentification
  app.get("/api/threats/recent", async (req: any, res) => {
    try {
      // En mode développement, utiliser l'ID d'organisation 1 par défaut si pas d'utilisateur connecté
      let organizationId = 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      // Si l'utilisateur est authentifié, utiliser son contexte d'organisation
      if (req.user && req.user.claims) {
        const userId = req.user.claims.sub;
        const orgId = req.query.organizationId ? parseInt(req.query.organizationId as string) : null;
        
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
          if (userOrgs.length > 0) {
            organizationId = userOrgs[0].id;
          }
        }
      }
      
      const threats = await storage.getRecentThreats(organizationId, limit);
      res.json({ threats });
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent threats" });
    }
  });

  // Get network activity data - temporairement accessible sans authentification
  app.get("/api/network-activity", async (req: any, res) => {
    try {
      // En mode développement, utiliser l'ID d'organisation 1 par défaut si pas d'utilisateur connecté
      let organizationId = 1;
      
      // Si l'utilisateur est authentifié, utiliser son contexte d'organisation
      if (req.user && req.user.claims) {
        const userId = req.user.claims.sub;
        const orgId = req.query.organizationId ? parseInt(req.query.organizationId as string) : null;
        
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
          if (userOrgs.length > 0) {
            organizationId = userOrgs[0].id;
          }
        }
      }
      
      const networkData = await storage.getNetworkActivity(organizationId);
      res.json({ metrics: networkData });
    } catch (error) {
      res.status(500).json({ message: "Error fetching network activity" });
    }
  });

  // Get vulnerabilities - temporairement accessible sans authentification
  app.get("/api/vulnerabilities", async (req: any, res) => {
    try {
      // En mode développement, utiliser l'ID d'organisation 1 par défaut si pas d'utilisateur connecté
      let organizationId = 1;
      
      // Si l'utilisateur est authentifié, utiliser son contexte d'organisation
      if (req.user && req.user.claims) {
        const userId = req.user.claims.sub;
        const orgId = req.query.organizationId ? parseInt(req.query.organizationId as string) : null;
        
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
          if (userOrgs.length > 0) {
            organizationId = userOrgs[0].id;
          }
        }
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
      console.error("Error fetching vulnerabilities:", error);
      res.status(500).json({ message: "Error fetching vulnerabilities" });
    }
  });

  // Quantum API routes - proxy to Python Quantum server
  // API routes for the quantum analysis module
  const QUANTUM_API_URL = "http://localhost:5001/api/quantum";

  // Quantum status
  app.get("/api/quantum/status", async (_req, res) => {
    try {
      const response = await axios.get(`${QUANTUM_API_URL}/status`);
      res.json(response.data);
    } catch (error) {
      console.error("Error connecting to quantum server:", error);
      res.status(503).json({
        status: "error",
        message: "Quantum server unavailable. Please start the quantum_server/run.py script."
      });
    }
  });

  // Configure quantum service
  app.post("/api/quantum/configure", async (req, res) => {
    try {
      const response = await axios.post(`${QUANTUM_API_URL}/configure`, req.body);
      res.json(response.data);
    } catch (error) {
      console.error("Error configuring quantum service:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to configure quantum service"
      });
    }
  });

  // Connect to IBM Quantum
  app.post("/api/quantum/ibm-connect", async (req, res) => {
    try {
      // Utiliser la clé API stockée dans l'environnement si non fournie
      if (!req.body.token && process.env.IBM_QUANTUM_API_KEY) {
        req.body.token = process.env.IBM_QUANTUM_API_KEY;
      }
      
      const response = await axios.post(`${QUANTUM_API_URL}/ibm-connect`, req.body);
      res.json(response.data);
    } catch (error) {
      console.error("Error connecting to IBM Quantum:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to connect to IBM Quantum"
      });
    }
  });

  // Generate a demo quantum circuit
  app.get("/api/quantum/circuit-demo", async (_req, res) => {
    try {
      const response = await axios.get(`${QUANTUM_API_URL}/circuit-demo`);
      res.json(response.data);
    } catch (error) {
      console.error("Error generating quantum circuit:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to generate quantum circuit"
      });
    }
  });

  // Generate network graph
  app.post("/api/quantum/network-graph", async (req, res) => {
    try {
      const response = await axios.post(`${QUANTUM_API_URL}/network-graph`, req.body);
      res.json(response.data);
    } catch (error) {
      console.error("Error generating network graph:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to generate network graph"
      });
    }
  });

  // Detect anomalies
  app.post("/api/quantum/detect-anomalies", async (req, res) => {
    try {
      const response = await axios.post(`${QUANTUM_API_URL}/detect-anomalies`, req.body);
      res.json(response.data);
    } catch (error) {
      console.error("Error detecting anomalies:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to detect anomalies"
      });
    }
  });

  // Get demo data
  app.get("/api/quantum/demo-data", async (req, res) => {
    try {
      const count = req.query.count || 50;
      const response = await axios.get(`${QUANTUM_API_URL}/demo-data?count=${count}`);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching demo data:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch demo data"
      });
    }
  });

  // Proxy to static files from the quantum server
  app.get("/static/:path", async (req, res) => {
    try {
      const path = req.params.path;
      const response = await axios.get(`${QUANTUM_API_URL}/static/${path}`, {
        responseType: 'stream'
      });
      
      // Forward content type
      res.set('Content-Type', response.headers['content-type']);
      
      // Pipe the response stream to our response
      response.data.pipe(res);
    } catch (error) {
      console.error("Error fetching static file:", error);
      res.status(404).json({
        status: "error",
        message: "Static file not found"
      });
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
