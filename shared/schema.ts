import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  organization: text("organization"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  organization: true,
  email: true,
});

// Security Metrics schema
export const securityMetrics = pgTable("security_metrics", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  securityScore: integer("security_score").notNull(),
  securityScoreChange: integer("security_score_change"),
  activeThreats: integer("active_threats").notNull(),
  activeThreatsChange: integer("active_threats_change"),
  vulnerabilities: integer("vulnerabilities").notNull(),
  vulnerabilitiesChange: integer("vulnerabilities_change"),
  monitoredAssets: integer("monitored_assets").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertSecurityMetricsSchema = createInsertSchema(securityMetrics).pick({
  organizationId: true,
  securityScore: true,
  securityScoreChange: true,
  activeThreats: true,
  activeThreatsChange: true,
  vulnerabilities: true,
  vulnerabilitiesChange: true,
  monitoredAssets: true,
});

// Cyber Maturity schema
export const cyberMaturity = pgTable("cyber_maturity", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  governance: integer("governance").notNull(),
  protection: integer("protection").notNull(),
  detection: integer("detection").notNull(),
  response: integer("response").notNull(),
  recovery: integer("recovery").notNull(),
  overallScore: integer("overall_score").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertCyberMaturitySchema = createInsertSchema(cyberMaturity).pick({
  organizationId: true,
  governance: true,
  protection: true,
  detection: true,
  response: true,
  recovery: true,
  overallScore: true,
});

// Threats schema
export const threats = pgTable("threats", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(), // critical, warning, info, success
  source: text("source"),
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status").notNull().default("active"), // active, resolved, ignored
  icon: text("icon").default("alert"), // alert, mail, server, shield
  actions: json("actions").notNull(),
});

export const insertThreatSchema = createInsertSchema(threats).pick({
  organizationId: true,
  title: true,
  description: true,
  level: true,
  source: true,
  status: true,
  icon: true,
  actions: true,
});

// Network Activity schema
export const networkActivity = pgTable("network_activity", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  inboundTraffic: integer("inbound_traffic").notNull(), // in MB
  outboundTraffic: integer("outbound_traffic").notNull(), // in MB
  activeConnections: integer("active_connections").notNull(),
  anomalyDetected: boolean("anomaly_detected").default(false),
});

export const insertNetworkActivitySchema = createInsertSchema(networkActivity).pick({
  organizationId: true,
  inboundTraffic: true,
  outboundTraffic: true,
  activeConnections: true,
  anomalyDetected: true,
});

// Vulnerabilities schema
export const vulnerabilities = pgTable("vulnerabilities", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  cveId: varchar("cve_id", { length: 20 }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // critical, high, medium, low
  affectedSystem: text("affected_system").notNull(),
  status: text("status").notNull().default("open"), // open, in_progress, resolved
  discoveredAt: timestamp("discovered_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).pick({
  organizationId: true,
  cveId: true,
  title: true,
  description: true,
  severity: true,
  affectedSystem: true,
  status: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSecurityMetrics = z.infer<typeof insertSecurityMetricsSchema>;
export type SecurityMetrics = typeof securityMetrics.$inferSelect;

export type InsertCyberMaturity = z.infer<typeof insertCyberMaturitySchema>;
export type CyberMaturity = typeof cyberMaturity.$inferSelect;

export type InsertThreat = z.infer<typeof insertThreatSchema>;
export type Threat = typeof threats.$inferSelect;

export type InsertNetworkActivity = z.infer<typeof insertNetworkActivitySchema>;
export type NetworkActivity = typeof networkActivity.$inferSelect;

export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type Vulnerability = typeof vulnerabilities.$inferSelect;
