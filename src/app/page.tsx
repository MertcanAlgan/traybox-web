import { config } from "@/lib/config";

const Check = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5 9-10" />
  </svg>
);

function ShelfRow({ name, folder, color, selected }: { name: string; folder: string; color: string; selected?: boolean }) {
  return (
    <div className={`mock-row${selected ? " selected" : ""}`}>
      <div className={`mock-check${selected ? " on" : ""}`}>{selected && <Check />}</div>
      <div className="mock-icon" style={{ background: color }} />
      <div>
        <div className="mock-name">{name}</div>
        <div className="mock-folder">{folder}</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="site">
      <header className="nav">
        <div className="nav-inner">
          <span className="nav-brand">Layover</span>
          <nav>
            <a href="#shelf">File shelf</a>
            <a href="#clipboard">Clipboard</a>
            <a href="#privacy">Privacy</a>
            <a href="#buy">Buy</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <h1>A shelf for your files.<br />Right on your Mac.</h1>
        <p className="lead">
          Park files mid-move, then drop, move or AirDrop them. Clipboard history included. A one-time purchase for your Mac.
        </p>
        <div className="cta-row">
          <a className="pill" href="#buy">Buy now</a>
          <a className="more" href="#shelf">Learn more &gt;</a>
        </div>

        <div className="mock">
          <div className="mock-tabs">
            <div>
              <span className="active">Shelf</span>
              <span>Clipboard</span>
              <span>Settings</span>
            </div>
          </div>
          <div className="mock-body">
            <ShelfRow name="Project-brief.pdf" folder="~/Downloads" color="#d9e2ef" selected />
            <ShelfRow name="Screenshot 2026-10-05.png" folder="~/Desktop" color="#e4dcef" selected />
            <ShelfRow name="invoice-october.xlsx" folder="~/Downloads" color="#dcead9" />
            <div className="mock-foot">
              <span>2 of 3 selected</span>
              <b>Move…</b>
              <b>AirDrop</b>
            </div>
          </div>
        </div>
      </section>

      <section id="shelf" className="band gray">
        <h2>Park it now.<br />Put it away later.</h2>
        <p>
          Drop files on the shelf and go find where they belong. Drag them out to any app, move them to a folder in one click, or send them with AirDrop. Select several and handle them together.
        </p>
      </section>

      <section id="clipboard" className="band">
        <h2>Everything you copied.<br />Still within reach.</h2>
        <p>
          Text, images and files in one searchable history. Find a clip by the app it came from, by its file name, or by the words inside a screenshot. Links and colors get a preview, and you can tidy up text before you paste.
        </p>
        <div className="searchbox">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
          </svg>
          <span>app:Safari kind:image invoice today</span>
        </div>
        <div className="triple">
          <div>
            <h3>Search that understands</h3>
            <p>Filter by app, kind, pinned or today. Screenshot text is read on your Mac, so you can search it.</p>
          </div>
          <div>
            <h3>Colors, done right</h3>
            <p>Copy any color as HEX, RGB, HSL, CMYK or SwiftUI, or pick one from the screen with the eyedropper.</p>
          </div>
          <div>
            <h3>Tidy before you paste</h3>
            <p>Plain text, clean whitespace, formatted JSON, decoded URLs. Pin the clips you keep reaching for.</p>
          </div>
        </div>
      </section>

      <section className="band gray">
        <h2>A window that stays<br />where you put it.</h2>
        <p>
          It floats above your other apps and is visible on every desktop. Snap it to a screen edge, switch to compact mode, and choose light or dark, how transparent it looks, and whether files and clips appear as a list or as cards. Start dragging a file in Finder and it comes forward on its own.
        </p>
      </section>

      <section id="privacy" className="band black">
        <h2>What you copy stays on your Mac.<br />Nothing is saved.</h2>
        <p>
          Your files and clipboard contents never leave your Mac. The shelf and the history live in memory only, so quitting the app clears them. Files are referenced, never copied, text in screenshots is read on your device, and anything a password manager marks as secret is never recorded.
        </p>
      </section>

      <section id="buy" className="band buy">
        <h2>Get Layover.</h2>
        <p>One app. File shelf and clipboard history in a single floating window.</p>
        <div className="price-card">
          <div className="price-name">Layover for Mac</div>
          <div className="price">$2.99</div>
          <div className="price-sub">One-time purchase</div>
          <div className="price-note">Includes a license key you can activate on up to {config.defaultMaxActivations} Macs.</div>
          {config.checkoutUrl ? (
            <a className="pill" href={config.checkoutUrl}>Buy now</a>
          ) : (
            <span className="pill disabled" title="Set NEXT_PUBLIC_CHECKOUT_URL">Coming soon</span>
          )}
          <div className="price-fine">
            After checkout your license key arrives by email. Enter it in the app to activate.<br />
            Requires macOS 13 or later.
            {config.supportEmail && <><br />Questions? <a href={`mailto:${config.supportEmail}`}>{config.supportEmail}</a></>}
          </div>
        </div>
      </section>

      <footer className="foot">
        <span>Layover, made by Mertcan Algan.</span>
        <span>For macOS 13 and later.</span>
      </footer>
    </div>
  );
}
