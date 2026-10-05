import { createLicense } from "../../actions";

export default function NewLicensePage() {
  return (
    <form action={createLicense} className="card narrow">
      <h1>New license</h1>
      <p className="muted">For gifts, press copies and replacements. Purchases create their own licenses automatically.</p>
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <label>
        Macs allowed
        <input name="max" type="number" min={1} max={50} defaultValue={3} />
      </label>
      <label>
        Note (optional)
        <input name="note" />
      </label>
      <label className="check">
        <input name="send" type="checkbox" defaultChecked /> Email the key to this address
      </label>
      <button className="primary" type="submit">Create</button>
    </form>
  );
}
