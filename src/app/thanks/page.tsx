import Link from "next/link";
import { config } from "@/lib/config";

export const metadata = { title: "Thank you — Traybox" };

export default function Thanks() {
  return (
    <div className="site">
      <section className="hero thanks">
        <h1>Thank you.</h1>
        <p className="lead">
          Your license key is on its way to your email. Open Traybox, enter the key on the activation screen, and you're set.
        </p>
        <p className="lead small">
          Nothing in your inbox after a few minutes? Check your spam folder
          {config.supportEmail ? <>, or write to <a href={`mailto:${config.supportEmail}`}>{config.supportEmail}</a></> : ""}.
        </p>
        <div className="cta-row"><Link className="more" href="/">Back to the site &gt;</Link></div>
      </section>
    </div>
  );
}
