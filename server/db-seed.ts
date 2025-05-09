import { db } from "./db";
import { organizations, users, organizationUsers } from "@shared/schema";
import { eq, and } from "drizzle-orm";

async function seedDatabase() {
  console.log("Seeding database with initial data...");

  // 1. Créer une organisation par défaut si elle n'existe pas déjà
  const [existingOrg] = await db.select().from(organizations).where(eq(organizations.id, 1));

  if (!existingOrg) {
    console.log("Creating default organization...");
    await db.insert(organizations).values({
      name: "QuantumEyes Demo",
      slug: "quantum-eyes-demo",
      industry: "Technology",
      size: "Medium",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    console.log("Default organization already exists.");
  }

  // 2. Créer un utilisateur de démonstration si nécessaire
  const [existingUser] = await db.select().from(users).where(eq(users.id, "demo-user"));

  if (!existingUser) {
    console.log("Creating demo user...");
    await db.insert(users).values({
      id: "demo-user",
      email: "demo@quantumeyes.com",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    console.log("Demo user already exists.");
  }

  // 3. Associer l'utilisateur à l'organisation s'il ne l'est pas déjà
  const [existingOrgUser] = await db
    .select()
    .from(organizationUsers)
    .where(
      and(
        eq(organizationUsers.userId, "demo-user"),
        eq(organizationUsers.organizationId, 1)
      )
    );

  if (!existingOrgUser) {
    console.log("Adding demo user to organization...");
    await db.insert(organizationUsers).values({
      userId: "demo-user",
      organizationId: 1,
      role: "admin",
      createdAt: new Date(),
    });
  } else {
    console.log("Demo user already associated with organization.");
  }

  console.log("Database seeding completed successfully!");
}

// Exécuter la fonction de seeding
seedDatabase()
  .then(() => {
    console.log("Seeding script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during seeding:", error);
    process.exit(1);
  });