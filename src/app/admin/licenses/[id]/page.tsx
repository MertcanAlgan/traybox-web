import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activations, licenses } from "@/db/schema";
import {
  deleteLicense,
  releaseActivation,
  resendEmail,
  setMaxActivations,
  setStatus,
} from "../../actions";

export const dynamic = "force-dynamic";

const fmt = (d: Date) =>
  d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function LicensePage({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const [license] = await db.select().from(licenses).where(eq(licenses.id, params.id)).limit(1);
  if (!license) notFound();

  const rows = await db
    .select()
    .from(activations)
    .where(eq(activations.licenseId, license.id))
    .orderBy(asc(activations.activatedAt));
  const activeRows = rows.filter((r) => !r.deactivatedAt);

  return (
    <>
      <p><Link href="/admin">← All licenses</Link></p>

      <div className="card">
        <h1>{license.email}</h1>
        <p className="mono big">{license.key}</p>
        <dl className="facts">
          <div><dt>Status</dt><dd><span className={`badge ${license.status}`}>{license.status}</span></dd></div>
          <div><dt>Created</dt><dd>{fmt(license.createdAt)}</dd></div>
          <div><dt>Order</dt><dd className="mono">{license.orderId ?? "created by hand"}</dd></div>
          <div><dt>Macs</dt><dd>{activeRows.length} / {license.maxActivations}</dd></div>
          {license.note && <div><dt>Note</dt><dd>{license.note}</dd></div>}
        </dl>

        <div className="actions">
          {license.status === "active" ? (
            <form action={setStatus.bind(null, license.id, "revoked")}>
              <button className="danger" type="submit">Revoke</button>
            </form>
          ) : (
            <form action={setStatus.bind(null, license.id, "active")}>
              <button type="submit">Restore</button>
            </form>
          )}
          <form action={resendEmail.bind(null, license.id)}>
            <button type="submit">Resend key email</button>
          </form>
          <form action={setMaxActivations.bind(null, license.id)} className="inline">
            <input name="max" type="number" min={1} max={50} defaultValue={license.maxActivations} />
            <button type="submit">Set Mac limit</button>
          </form>
        </div>
      </div>

      <div className="card table-wrap">
        <h2>Activations</h2>
        <table>
          <thead>
            <tr><th>Mac</th><th>Activated</th><th>Last seen</th><th>State</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  {row.machineName ?? "Unknown Mac"}
                  <div className="mono muted small">{row.machineId.slice(0, 12)}…</div>
                </td>
                <td>{fmt(row.activatedAt)}</td>
                <td>{fmt(row.lastSeenAt)}</td>
                <td>{row.deactivatedAt ? `released ${fmt(row.deactivatedAt)}` : "active"}</td>
                <td>
                  {!row.deactivatedAt && (
                    <form action={releaseActivation.bind(null, license.id, row.id)}>
                      <button type="submit">Release</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="muted">Not activated yet.</td></tr>}
          </tbody>
        </table>
        <p className="muted small">
          Releasing frees a slot on the server. The Mac keeps working until it next checks in, then asks to activate again.
        </p>
      </div>

      <form action={deleteLicense.bind(null, license.id)}>
        <button className="danger" type="submit">Delete license permanently</button>
      </form>
    </>
  );
}
