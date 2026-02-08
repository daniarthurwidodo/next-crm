import { db } from "@/lib/db";
import { user, userSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUsers() {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      plan: userSubscriptions.planName,
      subscriptionStatus: userSubscriptions.subscriptionStatus,
      stripeCustomerId: userSubscriptions.stripeCustomerId,
      stripeSubscriptionId: userSubscriptions.stripeSubscriptionId,
      currentPeriodEnd: userSubscriptions.currentPeriodEnd,
    })
    .from(user)
    .leftJoin(userSubscriptions, eq(user.id, userSubscriptions.userId));

  return rows.map((row) => ({
    ...row,
    plan: row.plan ?? "free",
  }));
}

export async function getUserById(id: string) {
  const rows = await db
    .select()
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function createUser(data: {
  name: string;
  email: string;
}) {
  const rows = await db
    .insert(user)
    .values({
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
    })
    .returning();

  return rows[0];
}

export async function updateUser(
  id: string,
  data: Partial<{ name: string; email: string }>
) {
  const rows = await db
    .update(user)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning();

  return rows[0];
}

export async function deleteUser(id: string) {
  await db.delete(user).where(eq(user.id, id));
  return true;
}
