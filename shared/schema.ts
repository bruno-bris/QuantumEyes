import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User schema (for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

// Organizations schema
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  contactEmail: text("contact_email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrganizationSchema = createInsertSchema(organizations).pick({
  name: true,
  slug: true,
  description: true,
  contactEmail: true,
});

// Organization users (many-to-many)
export const organizationUsers = pgTable("organization_users", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("member"), // admin, member
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrganizationUserSchema = createInsertSchema(organizationUsers).pick({
  organizationId: true,
  userId: true,
  role: true,
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

// Quantum Configuration Schema
export const quantumConfigs = pgTable("quantum_configs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  qubits: integer("qubits").notNull().default(4),
  feature_map: text("feature_map").notNull().default("zz"),
  ansatz: text("ansatz").notNull().default("real"),
  shots: integer("shots").notNull().default(1024),
  model_type: text("model_type").notNull().default("qsvc"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQuantumConfigSchema = createInsertSchema(quantumConfigs).pick({
  organizationId: true,
  name: true,
  qubits: true,
  feature_map: true,
  ansatz: true,
  shots: true,
  model_type: true,
  active: true,
});

// Network Connection Data Schema (pour les données issues de l'analyse réseau)
export const networkConnections = pgTable("network_connections", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  source_ip: text("source_ip").notNull(),
  destination_ip: text("destination_ip").notNull(),
  protocol: text("protocol").notNull(),
  destination_port: integer("destination_port"),
  packet_size: integer("packet_size"),
  duration: text("duration"),
  timestamp: timestamp("timestamp").defaultNow(),
  isAnomaly: boolean("is_anomaly").default(false),
  anomalyScore: text("anomaly_score"),
  anomalyType: text("anomaly_type"),
});

export const insertNetworkConnectionSchema = createInsertSchema(networkConnections).pick({
  organizationId: true,
  source_ip: true,
  destination_ip: true,
  protocol: true,
  destination_port: true,
  packet_size: true,
  duration: true,
  isAnomaly: true,
  anomalyScore: true,
  anomalyType: true,
});

// Network Analysis Results Schema
export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  configId: integer("config_id").references(() => quantumConfigs.id),
  timestamp: timestamp("timestamp").defaultNow(),
  title: text("title"),
  description: text("description"),
  type: text("type").default("anomaly_detection"),
  nodesAnalyzed: integer("nodes_analyzed"),
  edgesAnalyzed: integer("edges_analyzed"),
  totalConnections: integer("total_connections"),
  anomaliesDetected: integer("anomalies_detected").default(0),
  executionTime: text("execution_time"),
  circuitImageUrl: text("circuit_image_url"),
  histogramImageUrl: text("histogram_image_url"),
  graphImageUrl: text("graph_image_url"),
  results: json("results"),
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).pick({
  organizationId: true,
  configId: true,
  title: true,
  description: true,
  type: true,
  nodesAnalyzed: true,
  edgesAnalyzed: true,
  totalConnections: true,
  anomaliesDetected: true,
  executionTime: true,
  circuitImageUrl: true,
  histogramImageUrl: true,
  graphImageUrl: true,
  results: true,
});

// Rapports schema
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // compliance, threat, vulnerability, continuity, monthly, weekly
  content: text("content").notNull(), // JSON stringified content
  metrics: json("metrics"), // JSON metrics data
  createdAt: timestamp("created_at").defaultNow(),
  fileUrl: text("file_url"),
  iconType: text("icon_type").default("shield"), // shield, building2, file-text 
});

export const insertReportSchema = createInsertSchema(reports).pick({
  organizationId: true,
  title: true,
  description: true,
  type: true,
  content: true,
  metrics: true,
  fileUrl: true,
  iconType: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

export type InsertOrganizationUser = z.infer<typeof insertOrganizationUserSchema>;
export type OrganizationUser = typeof organizationUsers.$inferSelect;

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

export type InsertQuantumConfig = z.infer<typeof insertQuantumConfigSchema>;
export type QuantumConfig = typeof quantumConfigs.$inferSelect;

export type InsertNetworkConnection = z.infer<typeof insertNetworkConnectionSchema>;
export type NetworkConnection = typeof networkConnections.$inferSelect;

export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
