import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE, isValidSession } from "@/lib/session";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const signedIn = await isValidSession(cookies().get(SESSION_COOKIE)?.value);

  return (
    <div className="admin">
      <header className="admin-bar">
        <Link href="/admin" className="admin-brand">
          Traybox admin
        </Link>
        {signedIn && (
          <nav>
            <Link href="/admin">Licenses</Link>
            <Link href="/admin/licenses/new">New license</Link>
            <form action={logout}>
              <button className="link-button" type="submit">
                Sign out
              </button>
            </form>
          </nav>
        )}
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
