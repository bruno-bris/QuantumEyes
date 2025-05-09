import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the QuantumEyes application
  
  // Get security metrics for dashboard
  app.get("/api/security-metrics", async (req, res) => {
    try {
      const metrics = await storage.getSecurityMetrics();
      res.json({ metrics });
    } catch (error) {
      res.status(500).json({ message: "Error fetching security metrics" });
    }
  });

  // Get cyber maturity data
  app.get("/api/cyber-maturity", async (req, res) => {
    try {
      const maturityData = await storage.getCyberMaturity();
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
  app.get("/api/threats/recent", async (req, res) => {
    try {
      const threats = await storage.getRecentThreats();
      res.json({ threats });
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent threats" });
    }
  });

  // Get network activity data
  app.get("/api/network-activity", async (req, res) => {
    try {
      const networkData = await storage.getNetworkActivity();
      res.json({ metrics: networkData });
    } catch (error) {
      res.status(500).json({ message: "Error fetching network activity" });
    }
  });

  // Get vulnerabilities
  app.get("/api/vulnerabilities", async (req, res) => {
    try {
      const vulnerabilities = await storage.getVulnerabilities();
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

  // Get currently logged in user
  app.get("/api/user", async (req, res) => {
    try {
      // For prototype, return a mock user
      res.json({
        user: {
          name: "Entreprise Client",
          role: "Admin",
          initials: "EC"
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user data" });
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
