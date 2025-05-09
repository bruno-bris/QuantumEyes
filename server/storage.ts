import {
  type User, type Organization, type OrganizationUser,
  type InsertOrganization, type InsertOrganizationUser,
  type CyberMaturity, type SecurityMetrics, type Threat,
  type NetworkActivity, type Vulnerability,
  type InsertThreat, type InsertNetworkActivity, type InsertVulnerability,
  type InsertCyberMaturity, type InsertSecurityMetrics
} from "@shared/schema";

import { DatabaseStorage } from "./storage-db";

// Storage interface for QuantumEyes application
export interface IStorage {
  // User management (Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: User): Promise<User>;
  
  // Organizations
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationBySlug(slug: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getUserOrganizations(userId: string): Promise<Organization[]>;
  
  // Organization users
  addUserToOrganization(orgUser: InsertOrganizationUser): Promise<OrganizationUser>;
  getUserRoleInOrganization(userId: string, orgId: number): Promise<string | undefined>;
  
  // Security metrics
  getSecurityMetrics(organizationId: number): Promise<SecurityMetrics>;
  createSecurityMetrics(metrics: InsertSecurityMetrics): Promise<SecurityMetrics>;
  
  // Cyber maturity
  getCyberMaturity(organizationId: number): Promise<CyberMaturity>;
  updateCyberMaturity(maturity: InsertCyberMaturity): Promise<CyberMaturity>;
  
  // Threat management
  getRecentThreats(organizationId: number, limit?: number): Promise<Threat[]>;
  createThreat(threat: InsertThreat): Promise<Threat>;
  updateThreatStatus(id: number, status: string): Promise<Threat | undefined>;
  
  // Network activity
  getNetworkActivity(organizationId: number): Promise<any>; // Returns network activity with traffic points
  recordNetworkActivity(activity: InsertNetworkActivity): Promise<NetworkActivity>;
  
  // Vulnerabilities
  getVulnerabilities(organizationId: number): Promise<Vulnerability[]>;
  createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
  updateVulnerabilityStatus(id: number, status: string): Promise<Vulnerability | undefined>;
}

// Utiliser l'implémentation de base de données 
export const storage = new DatabaseStorage();