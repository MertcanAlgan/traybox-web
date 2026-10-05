import Link from "next/link";
import { and, count, desc, eq, gte, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { activations, licenses } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminHome({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  const [[total], [active], [week], [machines]] = await Promise.all([
    db.select({ n: count() }).from(licenses),
    db.select({ n: count() }).from(licenses).where(eq(licenses.status, "active")),
    db.select({ n: count() }).from(licenses).where(gte(licenses.createdAt, weekAgo)),
    db.select({ n: count() }).from(activations).where(isNull(activations.deactivatedAt)),
  ]);

  const used = db
    .select({ licenseId: activations.licenseId, n: count().as("n") })
    .from(activations)
    .where(isNull(activations.deactivatedAt))
    .groupBy(activations.licenseId)
    .as("used");

  const rows = await db
    .select({
      id: licenses.id,
      key: licenses.key,
      email: licenses.email,
      status: licenses.status,
      max: licenses.maxActivations,
      createdAt: licenses.createdAt,
      used: sql<number>`coalesce(${used.n}, 0)`,
    })
    .from(licenses)
    .leftJoin(used, eq(used.licenseId, licenses.id))
    .where(q ? or(ilike(licenses.email, `%${q}%`), ilike(licenses.key, `%${q}%`)) : undefined)
    .orderBy(desc(licenses.createdAt))
    .limit(200);

  return (
    <>
      <section className="stats">
        <div className="stat"><span>{total.n}</span>Licenses</div>
        <div className="stat"><span>{active.n}</span>Active</div>
        <div className="stat"><span>{week.n}</span>Last 7 days</div>
        <div className="stat"><span>{machines.n}</span>Macs activated</div>
      </section>

      <form className="search" method="get">
        <input name="q" defaultValue={q} placeholder="Search by email or key" />
        <button type="submit">Search</button>
      </form>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Key</th>
              <th>Status</th>
              <th>Macs</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td><Link href={`/admin/licenses/${row.id}`}>{row.email}</Link></td>
                <td className="mono">{row.key}</td>
                <td><span className={`badge ${row.status}`}>{row.status}</span></td>
                <td>{row.used} / {row.max}</td>
                <td>{row.createdAt.toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="muted">No licenses found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
